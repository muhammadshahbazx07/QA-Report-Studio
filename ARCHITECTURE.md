# Architecture / Data Model

## Project

A top-level project can represent a company, client, system, or product group.

Fields:

- `name`
- `clientName`
- `colorKey`
- `copyrightText`

One project can have many templates.

## Template

A template represents one portal/product/report format inside the project.

Examples:

- Web Portal Daily QA
- Mobile App Regression
- Admin Portal Testing
- API Verification

Each template contains an ordered array of sections. Each section contains ordered fields.

Supported field types:

- Status
- Short Text
- Long Text
- Number
- Date
- URL
- Checkbox

## Global Statuses

Stored in `settings/statuses`.

Each status has:

- Name/label
- Fixed color key
- `requiresIssue`

If `requiresIssue` is enabled, selecting that status automatically opens the Issue/Remarks field in the daily report.

## Report

When a report is saved, it stores:

- Project identity snapshot
- Template identity snapshot
- Full sections/fields snapshot
- Date
- Original creation time (`createdAt`) and fixed two-year expiration (`expiresAt`)
- Tester name
- Responses
- Published/draft flag

This snapshot design is intentional. Editing tomorrow's template cannot alter yesterday's final report.

## Public URL

Published report URL:

```text
https://your-domain.com/r/{reportDocumentId}
```

The public page reads only the saved report snapshot. It does not expose the admin UI.

## PDF

The PDF generator receives only the `ReportPaper` component, not the page toolbar. Therefore admin buttons such as Save, Edit, Back, Publish and Download never appear inside the generated PDF.

## Retention

Reports are retained for two calendar years from their original creation time.
The scheduled cleanup deletes only expired documents in the top-level
`reports` collection, regardless of project or template. The immutable expiry
timestamp also prevents anonymous access to an expired public report before the
scheduled deletion has run.

Report list pages use Firestore queries ordered by report date, with a
ten-document cursor page and server-side aggregate counts. Project,
template, published/draft, and report-date range filters are applied before
pagination.
