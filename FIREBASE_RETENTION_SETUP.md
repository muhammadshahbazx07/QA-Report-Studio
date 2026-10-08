# Firebase Retention and Pagination Setup

## What this deploys

- A daily UTC Cloud Function deletes only documents in the top-level `reports`
  collection whose original numeric `createdAt` is at least two calendar years
  old. It does not delete projects, templates, statuses, or settings.
- New reports receive an immutable `createdAt` and a calendar-based `expiresAt`.
  Editing a report does not change either value.
- Firestore rules stop anonymous access to an expired public report even if the
  scheduled deletion has not run yet.
- Report pages use a Firestore cursor and fetch ten reports at a time. Page
  counts use Firestore aggregation queries.

## One-time setup and deployment

1. Install and authenticate the Firebase CLI, select the intended Firebase
   project, and ensure billing is enabled. Scheduled Functions require the
   Blaze plan and deploy Cloud Scheduler resources.

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use YOUR_FIREBASE_PROJECT_ID
   ```

2. Install the Cloud Function dependencies:

   ```bash
   cd functions
   npm install
   cd ..
   ```

3. Migrate existing reports before tightening public-read rules. This adds an
   `expiresAt` value derived from each existing report's original numeric
   `createdAt`; invalid/missing creation dates are reported and skipped.
   Temporarily pause report creation while this one-time migration runs.
   Run from the repository root after Firebase Admin credentials are available
   through Application Default Credentials (for example, with
   `gcloud auth application-default login`) or `GOOGLE_APPLICATION_CREDENTIALS`:

   ```bash
   cd functions
   npm run migrate:report-expiry
   cd ..
   ```

   The migration can be safely rerun. Confirm that skipped records (if any) have
   valid original creation dates and correct expiry values before proceeding.

4. Deploy Firestore rules, composite indexes, and the scheduled function:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,functions
   ```

   Indexes may take several minutes to build. Verify all report listing/filter
   combinations in the Firestore Indexes page before considering rollout
   complete. The CLI will report index build state and function deployment
   errors.

5. Build/deploy the React application as usual. Remove `VITE_MAX_REPORTS` from
   hosting environment variables; it is no longer used.

## Verification checklist

- Create reports in two projects and across multiple templates in one project.
- Confirm each listing shows ten rows maximum, accurate filtered counts, and
  working Previous/Next navigation.
- Exercise project, template, Draft/Published, start-date, and end-date filters
  individually and in combination. Confirm changing filters returns to page 1.
- Create a report and return to its project listing; confirm it appears first.
  Delete a report from a later page; confirm the listing reloads and navigation
  remains valid.
- Publish a test report and open its public URL in a signed-out browser.
- In a non-production test project, create a report with `createdAt` more than
  two calendar years in the past and a matching `expiresAt`; confirm the public
  URL is denied before cleanup and the document is deleted after the scheduled
  function runs.
- Check Cloud Functions logs for `Expired report cleanup completed`. Only
  report document deletions are expected.
