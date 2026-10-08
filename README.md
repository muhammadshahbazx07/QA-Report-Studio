# QA Report Studio

A Firebase + React admin system for creating, managing, and publishing daily software QA/testing reports.

## Features

- Firebase Email/Password authentication for the admin panel
- Projects/companies with configurable accent colors
- Multiple report templates per project
- Dynamic report sections, headings, and field types
- Configurable result statuses such as Pass, Failed, Pending, and N/A
- Optional Issue/Remarks fields for selected statuses
- Daily report creation with tester name and report date
- Template snapshots to preserve historical reports
- Public read-only report URLs
- Client-facing reports without admin controls
- PDF report generation and download
- Project-wide, rolling two-year report retention
- Cursor-based report pagination with server-side filtering
- Project-specific copyright/footer text

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Add your Firebase web app configuration to `.env`.

### 3. Configure Firebase

In your Firebase project:

1. Enable **Authentication → Email/Password**
2. Create your admin user in Firebase Authentication
3. Create a Firestore Database
4. Deploy the provided Firestore security rules

See `FIREBASE_SETUP.md` for the Firebase configuration and deployment steps.

### 4. Start the development server

```bash
npm run dev
```

## Production Build

Create a production build with:

```bash
npm run build
```

The generated Vite application can be deployed to Vercel.

The included `vercel.json` contains the SPA rewrite required for application routes and public report URLs.

## Project Structure

```text
src/
├─ core/
│  ├─ Firebase/
│  ├─ Routes/
│  ├─ Services/
│  ├─ Context/
│  ├─ Constants/
│  └─ Utils/
├─ view/
│  ├─ components/
│  ├─ layouts/
│  └─ pages/
└─ assets/
   └─ styles/
```

## Customization

Main application colors and the available project/status color palette are centralized in:

```text
src/assets/styles/global.css
```

Projects store color keys such as `blue`, `violet`, and `green`, while the actual color values are controlled through the CSS variables.

This makes it possible to update the visual palette without changing individual components.

## Report Retention and Pagination

Reports are retained for two years from their original creation time. A scheduled
Firebase Cloud Function removes expired report documents; all reports in all
templates under a project share this policy. Public report links stop working
when their expiry time is reached. Project, template, status, and date filters
use Firestore queries and cursor navigation loads ten reports per page.

See [FIREBASE_RETENTION_SETUP.md](./FIREBASE_RETENTION_SETUP.md) for required
Firebase indexes, scheduled-function deployment, and validation steps.