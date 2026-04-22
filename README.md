# SmartParkEase

SmartParkEase is a React + Vite parking operations dashboard with slot monitoring, vehicle entry, billing, analytics, and an integrated ANPR flow for automated number plate recognition.

## ANPR integration

This project now includes a sidecar Python API that wraps the open source [`fast-alpr`](https://github.com/ankandrew/fast-alpr) library.

Flow:

1. Open the Vehicle Entry page.
2. Upload or capture a number plate image.
3. The ALPR API detects the plate and returns OCR candidates.
4. Apply the best match to the vehicle number field and continue normal slot assignment.

## Quick Start

After cloning the repository and installing Node.js, VS Code, and Python:

1. `cd SmartParkEase`
2. `./setup.sh` (installs all dependencies)
3. `./run.sh` (starts the app with ANPR service)

The app will be running at http://localhost:5173

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
