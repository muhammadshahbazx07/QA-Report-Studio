# Firebase Setup

## 1. Create Firebase project

Create a Firebase project and add a Web App.

Copy the web configuration values into a new `.env` file based on `.env.example`.

## 2. Enable Authentication

Firebase Console -> Authentication -> Sign-in method -> enable **Email/Password**.

Then go to Authentication -> Users -> Add user.

There is intentionally no public sign-up screen in this project. Only users you create in Firebase Authentication can access the admin panel.

## 3. Firestore

Create a Cloud Firestore database.

Install Firebase CLI if required:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

Use the included Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

The rule behavior is:

- Admin data requires Firebase authentication.
- Published documents in `reports` can be read publicly.
- Draft reports stay private.
- Public reads stop when a report's `expiresAt` timestamp is reached.

## 4. Environment

Create `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Restart Vite after changing `.env`.

## 5. Vercel

Add the same environment variables in Vercel -> Project -> Settings -> Environment Variables.

Then deploy normally. The included `vercel.json` redirects all app routes to `index.html`, so direct links such as `/r/REPORT_ID` work.

For the scheduled two-year report cleanup, the required one-time migration,
Function deployment, and verification steps, see
[FIREBASE_RETENTION_SETUP.md](./FIREBASE_RETENTION_SETUP.md).
