import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  runTransaction,
  where,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

export const DEFAULT_SLOTS = Array.from({ length: 24 }, (_, index) => ({
  id: `S-${String(index + 1).padStart(2, '0')}`,
  zone: index < 8 ? 'North' : index < 16 ? 'Central' : 'South',
}));

export const DEFAULT_SETTINGS = {
  lotName: 'SmartParkEase Central',
  totalSlots: 24,
  hourlyRate: 3,
  currency: 'USD',
  gracePeriodMinutes: 15,
};

export function getWorkspaceRefs(db) {
  return {
    settingsRef: doc(db, 'settings', 'main'),
    slotsCol: collection(db, 'slots'),
    vehiclesCol: collection(db, 'vehicles'),
    activityCol: collection(db, 'activity'),
  };
}

export async function bootstrapWorkspace(db, user) {
  const { settingsRef, slotsCol } = getWorkspaceRefs(db);
  const [settingsSnap] = await Promise.all([getDoc(settingsRef)]);

  const batch = writeBatch(db);

  if (!settingsSnap.exists()) {
    batch.set(settingsRef, {
      ...DEFAULT_SETTINGS,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid,
    });
  }

  const slotIds = DEFAULT_SLOTS.map((slot) => slot.id);
  const existingSlotDocs = await Promise.all(slotIds.map((slotId) => getDoc(doc(db, 'slots', slotId))));

  if (existingSlotDocs.some((document) => !document.exists())) {
    DEFAULT_SLOTS.forEach((slot) => {
      const slotExists = existingSlotDocs.find((document) => document.id === slot.id);

      if (!slotExists || !slotExists.exists()) {
        batch.set(doc(db, 'slots', slot.id), {
          id: slot.id,
          zone: slot.zone,
          status: 'available',
          vehicleId: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: user.uid,
          updatedBy: user.uid,
        });
      }
    });
  }

  await batch.commit();
}

export function subscribeWorkspace(db, handlers) {
  const { settingsRef, slotsCol, vehiclesCol, activityCol } = getWorkspaceRefs(db);

  const unsubscribers = [];

  unsubscribers.push(
    onSnapshot(settingsRef, (snapshot) => handlers.onSettings(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)),
  );

  unsubscribers.push(
    onSnapshot(slotsCol, (snapshot) => {
      handlers.onSlots(
        snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .sort((left, right) => left.id.localeCompare(right.id)),
      );
    }),
  );

  unsubscribers.push(
    onSnapshot(vehiclesCol, (snapshot) => {
      handlers.onVehicles(
        snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .sort((left, right) => {
            const leftTime = left.entryAt?.toMillis ? left.entryAt.toMillis() : 0;
            const rightTime = right.entryAt?.toMillis ? right.entryAt.toMillis() : 0;
            return rightTime - leftTime;
          }),
      );
    }),
  );

  unsubscribers.push(
    onSnapshot(activityCol, (snapshot) => {
      handlers.onActivity(
        snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .sort((left, right) => {
            const leftTime = left.createdAt?.toMillis ? left.createdAt.toMillis() : 0;
            const rightTime = right.createdAt?.toMillis ? right.createdAt.toMillis() : 0;
            return rightTime - leftTime;
          }),
      );
    }),
  );

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}

function normalizePlate(value) {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

function calculateCharge(entryAt, exitAt, hourlyRate, gracePeriodMinutes) {
  const entryDate = entryAt?.toDate ? entryAt.toDate() : new Date(entryAt);
  const exitDate = exitAt?.toDate ? exitAt.toDate() : new Date(exitAt);
  const elapsedMinutes = Math.max(0, Math.ceil((exitDate.getTime() - entryDate.getTime()) / 60000));

  if (elapsedMinutes <= gracePeriodMinutes) {
    return 0;
  }

  const billableMinutes = elapsedMinutes - gracePeriodMinutes;
  const billableHours = Math.ceil(billableMinutes / 60);

  return billableHours * hourlyRate;
}

export async function createVehicleEntry(db, user, input) {
  const { settingsRef, slotsCol, vehiclesCol, activityCol } = getWorkspaceRefs(db);

  const vehiclePlate = normalizePlate(input.plateNumber);
  const existingVehicleSnap = await getDocs(query(vehiclesCol, where('plateNumber', '==', vehiclePlate), where('status', '==', 'active')));

  if (existingVehicleSnap.docs.length > 0) {
    throw new Error('This vehicle is already active in the lot.');
  }

  return runTransaction(db, async (transaction) => {
    const settingsSnap = await transaction.get(settingsRef);
    const settings = settingsSnap.exists() ? settingsSnap.data() : DEFAULT_SETTINGS;

    const totalSlots = Math.max(1, Number(settings.totalSlots || DEFAULT_SETTINGS.totalSlots));
    const orderedSlotIds = Array.from({ length: totalSlots }, (_, index) => `S-${String(index + 1).padStart(2, '0')}`);

    let slotId = input.slotId || null;

    if (!slotId) {
      for (const candidateSlotId of orderedSlotIds) {
        const candidateSlotRef = doc(db, 'slots', candidateSlotId);
        const candidateSlotSnap = await transaction.get(candidateSlotRef);

        if (candidateSlotSnap.exists() && candidateSlotSnap.data().status === 'available') {
          slotId = candidateSlotId;
          break;
        }
      }

      if (!slotId) {
        throw new Error('No free slots are available.');
      }
    }

    const slotRef = doc(db, 'slots', slotId);

    const slotSnap = await transaction.get(slotRef);

    if (!slotSnap.exists()) {
      throw new Error('Selected slot does not exist.');
    }

    const slot = slotSnap.data();

    if (slot.status !== 'available') {
      throw new Error('Selected slot is no longer available.');
    }

    const vehicleRef = doc(vehiclesCol);
    const now = Timestamp.now();

    transaction.set(vehicleRef, {
      plateNumber: vehiclePlate,
      vehicleType: input.vehicleType,
      slotId: slotRef.id,
      entrySource: input.entrySource || 'manual',
      status: 'active',
      entryAt: now,
      exitAt: null,
      amountDue: 0,
      amountPaid: 0,
      paymentMethod: null,
      paymentReference: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
      createdBy: user.uid,
      updatedBy: user.uid,
    });

    transaction.update(slotRef, {
      status: 'occupied',
      vehicleId: vehicleRef.id,
      updatedAt: now,
      updatedBy: user.uid,
    });

    transaction.set(doc(activityCol), {
      type: 'entry',
      label: 'Vehicle entry recorded',
      detail: `${vehiclePlate} assigned to ${slotRef.id}`,
      plateNumber: vehiclePlate,
      slotId: slotRef.id,
      vehicleType: input.vehicleType,
      entrySource: input.entrySource || 'manual',
      createdAt: now,
      createdBy: user.uid,
    });

    transaction.set(doc(activityCol), {
      type: 'entry-meta',
      label: 'Slot allocation updated',
      detail: `${slotRef.id} is now occupied`,
      createdAt: now,
      createdBy: user.uid,
    });

    return {
      vehicleId: vehicleRef.id,
      slotId: slotRef.id,
      settings,
    };
  });
}

export async function settleVehicle(db, user, vehicleId) {
  const { vehiclesCol, slotsCol, activityCol } = getWorkspaceRefs(db);

  return runTransaction(db, async (transaction) => {
    const vehicleRef = doc(vehiclesCol, vehicleId);
    const vehicleSnap = await transaction.get(vehicleRef);

    if (!vehicleSnap.exists()) {
      throw new Error('Vehicle record not found.');
    }

    const vehicle = vehicleSnap.data();

    if (vehicle.status !== 'active') {
      throw new Error('This vehicle has already been processed.');
    }

    const settingsSnap = await transaction.get(doc(db, 'settings', 'main'));
    const settings = settingsSnap.exists() ? settingsSnap.data() : DEFAULT_SETTINGS;
    const exitAt = Timestamp.now();
    const slotRef = doc(slotsCol, vehicle.slotId);

    const amountDue = calculateCharge(vehicle.entryAt, exitAt, settings.hourlyRate, settings.gracePeriodMinutes);

    const paymentMethod = (vehicle.paymentMethod || 'cash').toLowerCase();
    const paymentReference = vehicle.paymentReference || null;

    transaction.update(vehicleRef, {
      status: 'closed',
      exitAt,
      paidAt: exitAt,
      amountDue,
      amountPaid: amountDue,
      paymentMethod,
      paymentReference,
      updatedAt: exitAt,
      updatedBy: user.uid,
    });

    transaction.update(slotRef, {
      status: 'available',
      vehicleId: null,
      updatedAt: exitAt,
      updatedBy: user.uid,
    });

    transaction.set(doc(activityCol), {
      type: 'exit',
      label: 'Vehicle exit processed',
      detail: `${vehicle.plateNumber} released from ${vehicle.slotId}`,
      plateNumber: vehicle.plateNumber,
      slotId: vehicle.slotId,
      amountPaid: amountDue,
      paymentMethod,
      paymentReference,
      createdAt: exitAt,
      createdBy: user.uid,
    });

    return {
      amountDue,
      slotId: vehicle.slotId,
    };
  });
}

export async function saveBillDraft(db, user, vehicleId) {
  const { vehiclesCol, activityCol } = getWorkspaceRefs(db);

  return runTransaction(db, async (transaction) => {
    const vehicleRef = doc(vehiclesCol, vehicleId);
    const vehicleSnap = await transaction.get(vehicleRef);

    if (!vehicleSnap.exists()) {
      throw new Error('Vehicle record not found.');
    }

    const vehicle = vehicleSnap.data();

    if (vehicle.status !== 'active') {
      throw new Error('Only active vehicles can be saved as a draft bill.');
    }

    const settingsSnap = await transaction.get(doc(db, 'settings', 'main'));
    const settings = settingsSnap.exists() ? settingsSnap.data() : DEFAULT_SETTINGS;
    const now = Timestamp.now();
    const currentAmount = calculateCharge(vehicle.entryAt, now, settings.hourlyRate, settings.gracePeriodMinutes);

    transaction.update(vehicleRef, {
      amountDue: currentAmount,
      updatedAt: now,
      updatedBy: user.uid,
    });

    transaction.set(doc(activityCol), {
      type: 'billing-draft',
      label: 'Bill draft saved',
      detail: `${vehicle.plateNumber} draft bill updated for ${vehicle.slotId}`,
      plateNumber: vehicle.plateNumber,
      slotId: vehicle.slotId,
      amountDue: currentAmount,
      createdAt: now,
      createdBy: user.uid,
    });

    return {
      amountDue: currentAmount,
      slotId: vehicle.slotId,
    };
  });
}

export async function updateVehiclePayment(db, user, vehicleId, payment) {
  const { vehiclesCol, activityCol } = getWorkspaceRefs(db);
  const vehicleRef = doc(vehiclesCol, vehicleId);
  const now = Timestamp.now();
  const paymentMethod = (payment?.method || 'cash').toLowerCase();
  const paymentReference = payment?.reference?.trim() || null;

  await setDoc(
    vehicleRef,
    {
      paymentMethod,
      paymentReference,
      updatedAt: now,
      updatedBy: user.uid,
    },
    { merge: true },
  );

  await addDoc(activityCol, {
    type: 'payment-updated',
    label: 'Payment details updated',
    detail: `Payment method updated to ${paymentMethod.toUpperCase()}`,
    paymentMethod,
    paymentReference,
    vehicleId,
    createdAt: now,
    createdBy: user.uid,
  });
}

export async function logAnprAccepted(db, user, payload) {
  const { activityCol } = getWorkspaceRefs(db);
  const now = Timestamp.now();

  await addDoc(activityCol, {
    type: 'anpr-accepted',
    label: 'ANPR candidate applied',
    detail: `${payload.plateNumber} selected (${Math.round((payload.confidence || 0) * 100)}% confidence)`,
    plateNumber: payload.plateNumber,
    confidence: payload.confidence || 0,
    processingMs: payload.processingMs || null,
    createdAt: now,
    createdBy: user.uid,
  });
}

export async function saveSettings(db, user, input) {
  const { settingsRef, activityCol } = getWorkspaceRefs(db);
  const payload = {
    lotName: input.lotName,
    totalSlots: Number(input.totalSlots),
    hourlyRate: Number(input.hourlyRate),
    currency: input.currency || 'USD',
    gracePeriodMinutes: Number(input.gracePeriodMinutes),
    updatedAt: Timestamp.now(),
    updatedBy: user.uid,
  };

  await setDoc(settingsRef, payload, { merge: true });

  await addDoc(activityCol, {
    type: 'settings',
    label: 'Lot settings updated',
    detail: `Rate set to ${payload.currency} ${payload.hourlyRate} and capacity ${payload.totalSlots}`,
    createdAt: Timestamp.now(),
    createdBy: user.uid,
  });

  return payload;
}
