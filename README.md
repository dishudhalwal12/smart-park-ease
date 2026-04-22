# SmartParkEase

SmartParkEase is a React + Vite parking operations dashboard with slot monitoring, vehicle entry, billing, analytics, and an integrated ANPR flow for automated number plate recognition.

## ANPR integration

This project now includes a sidecar Python API that wraps the open source [`fast-alpr`](https://github.com/ankandrew/fast-alpr) library.

Flow:

1. Open the Vehicle Entry page.
2. Upload or capture a number plate image.
3. The ALPR API detects the plate and returns OCR candidates.
4. Apply the best match to the vehicle number field and continue normal slot assignment.

## Frontend setup

```bash
npm install
npm run dev
```

## Firebase setup

Create a local `.env.local` file with your Firebase web app values. The app expects:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` optionally

Enable Email/Password in Firebase Authentication and deploy Firestore rules from [firestore.rules](firestore.rules).

The app bootstraps a default parking workspace in Firestore on first authenticated login.

Use the sign-up screen in the app to create the first operator account with email/password.

Optional frontend env:

```bash
cp .env.example .env
```

## ALPR API setup

```bash
cd services/alpr-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The frontend calls `http://127.0.0.1:8000` by default, or `VITE_ANPR_API_URL` if provided.

In Vite development, the app uses `/api/anpr` and proxies that to `http://127.0.0.1:8000`, so the React app and Python API work together without hardcoding localhost into the browser request.

## Notes

- The React app still works without the ALPR API; attendants can continue entering vehicle numbers manually.
- `fast-alpr` downloads and uses ONNX models, so the first recognition call can take longer than later scans.
- If the entry screen shows the ANPR service as offline, start the Python API first:
  `cd services/alpr-api && source .venv/bin/activate && uvicorn app:app --reload --port 8000`
