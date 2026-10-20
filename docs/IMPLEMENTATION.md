# Frontend implementation status

This working frontend was extended on 18 October 2026 with the six enterprise frontend areas alongside the presentation studio and guided upload, check and report workflow. It preserves the complete scope in `full-catalogue.md`.

## Implemented

- Four main workspace sections, a visible three-step starting point and advanced options disclosed only when needed.
- Recognised file-type suggestions, remembered column mappings, direct data-review corrections and a short report chooser.
- A progress-summary recipe that needs only the activity schedule; optional source datasets are included when available.
- Existing catalogues, report formats, detailed controls and company setup remain available.
- Public product home, organisation sign-in preview, four-step registration preview and company management screens.
- Local company profiles, proposed plan selection and unsent team invitation drafts.
- Separate local project namespaces for company previews, preserving the existing demo workspace.
- Navigation, responsive dashboard, work register, dataset catalogue, report catalogue, insights and settings.
- Local project creation, activity updates, generic dataset record updates and historical versions.
- Spreadsheet import and column confirmation with real browser-side data processing.
- Complete dataset and report catalogue, with input requirements for every report.
- Project-level measures, work completion, overdue activities, grouped progress and source-provided progress history.
- Company branding and report-preview controls.
- Real PDF, native editable PowerPoint, Excel and CSV exports; combined ZIP.
- Close-out supporting sections for punch lists, acceptance and lessons learned.
- Project data and original supporting-file backups, with non-destructive restore as copies.
- Rules-based local assistant; no external AI requests or API secrets in the frontend.

## Six enterprise frontend areas

Saved report revisions/comparison/review notes; a multi-file review and retry queue; company/member/account and billing-preview screens; reusable company branding and report/slide styles; a contextual source-linked local assistant; and responsive/accessibility/error-state refinements are implemented. These preserve the simple primary navigation and disclose optional controls when needed.

33 automated calculation and DOM workflow checks pass. Real PDF, PPTX, XLSX and CSV files were generated and checked, including the new company cover and footer in PowerPoint. Browser visual checks and a trial with actual planners have not been performed in this environment. Use `FRONTEND-QA.md` before a customer rollout. This is a functional frontend, not a production authentication or billing service.

## Presentation studio

The Slides section supports project-generated decks and blank presentations, eight layouts, three themes, chart and table editing, image uploads, speaker notes, thumbnail reordering, undo/redo, deck duplication and updated snapshots. Presentations autosave to the existing project namespace and are included in workspace backups. PowerPoint exports contain editable text, native tables and charts; PDF exports contain landscape slide pages. See `SLIDE-STUDIO.md`.

## Specialist reporting is pending

The report readiness label indicates available inputs and the current template engine. It does not certify the work or validate the complete domain logic.

Templates marked `Template preview` include supporting records and a review notice. Specialist implementations must be added and checked against reference data: schedule quality/critical path and float; calendar-aware recovery and forecasts; earned value and cash flow; maintenance reliability; permit/isolation readiness; resource capacity and productivity; quality indicators; environmental thresholds; contract financial position; and portfolio aggregation.

The first structured reports provide progress summaries, activity look-ahead records, basic status registers and close-out evidence. Continue developing each report against an anonymised real input file and an expected stakeholder deliverable.

## Pricing and identity update

The homepage, onboarding and owner billing screens share a single fee model. Estimates separate the company fee from full/viewer licence charges, enforce proposed user-count boundaries and show the full annual payment when selected. Existing users retain their local profiles. Stable user IDs and role-coded licence references appear in account and people screens. See `PRICING.md`.

## Next backend stage

1. Choose the hosting and database architecture with the project owner.
2. Add authentication, verified email, secure invitations, recovery and server-enforced organisation/project access. Implement the model in `ORGANISATIONS.md`.
3. Move authoritative project records and uploads into durable server storage.
4. Parse larger spreadsheets and documents, with reviewable extraction results.
5. Validate source mappings and record relationships; preserve an audit history.
6. Connect an AI provider server-side using secrets. Send scoped records and verified calculations; return source-linked explanations.
7. Implement and validate specialist report calculations and report-specific input contracts.
8. Add organisation subscription billing, seat management, enforced roles, sharing, report sign-off, deployment monitoring and backups.

No backend, accounts, live AI, direct Primavera/SAP connection or document OCR is claimed to be functional in this frontend.
