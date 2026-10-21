# Planvisiq

**Turn project data into clear results.**

A browser-based planning and reporting workspace for construction, civil engineering, maintenance and refinery shutdown projects.

**Frontend first:** this project uses HTML, CSS and JavaScript. No server, API key, framework, paid service or build step is needed to use it. The backend is deliberately deferred.

## Run it

1. Extract this folder.
2. Open the folder in VS Code.
3. Open `index.html` with the Live Server extension.

Or run `python -m http.server 5500` in this folder, then visit `http://localhost:5500`.

Use a local web server, rather than double-clicking `index.html`, because browser JavaScript modules require an HTTP origin.

## Put it on GitHub Pages

1. Create a GitHub repository and upload this folder's contents. `index.html` must be at the repository root.
2. Include all five HTML pages, the `js`, `vendor` and `docs` folders, all six CSS files, `favicon.svg`, and `.nojekyll`.
3. In the repository's **Settings → Pages**, select **Deploy from a branch**.
4. Select your `main` branch and `/ (root)`, then save.
5. Open the Pages URL GitHub gives you. Relative asset paths also support a repository subpath.

Do not upload `node_modules`, your real project records, or workspace backup files to the repository. The included demonstration project is fictional.

## What works

- A guided **Upload → Check → Report** workflow, with My project, Files, Reports and Slides as the main navigation choices.
- Suggested file types for recognised spreadsheet layouts, automatic column matching and remembered confirmed matches for repeated uploads in the same project.
- Basic schedule checks with links to missing or conflicting source records, including missing progress, missing dates and contradictory completion status.
- Three common report choices: a progress update, weekly report and project close-out. The complete catalogue remains available under a disclosure.
- Ready-filled report layouts with advanced options collapsed; successful downloads remember format, audience and detail level for that project.
- Marketing home page with product walkthrough, report formats, proposed subscriptions and FAQs.
- Organisation sign-in preview with workspace lookup, owner/member email, password visibility, invitation acceptance, verification and password-reset flows.
- Four-step company setup: organisation details, owner, proposed plan and team invitation drafts.
- Organisation page with Company, People & access and owner Billing & usage sections; Admin, Planner and Viewer profiles remain local previews.
- Individual-account design: one organisation owner manages the company plan; workers will join through invitations.
- Company previews open their own local project namespace. Existing demo projects remain in their original browser workspace.
- Responsive project dashboard with calculated metrics, progress history and activity status.
- Multiple local projects; create a blank project or explore the fictional sample.
- Excel `.xlsx`, CSV and TSV imports with worksheet selection, editable column mapping, date validation and duplicate activity-ID checks.
- All **120 dataset types** and **120 report templates**, searchable by name and category.
- Dataset viewing, record editing, activity progress editing and version preservation.
- Historical dataset selection by reporting cut-off.
- Basic joins for budget, actual costs, labour hours and progress weights by activity ID.
- Chart style changes and grouping by discipline, area or contractor.
- Report title, audience, scope, activity finish-date period, detail level and commentary controls.
- Company name, client, colour and PNG/JPEG logo branding.
- Real **PDF**, **editable PowerPoint**, **Excel**, **CSV** and combined **ZIP** exports.
- Native editable PowerPoint charts, text and tables. PDF charts remain vector graphics.
- Close-out reports and slides include punch-list, acceptance and lessons-learned records when present.
- Supporting files stored in the browser; portable workspace ZIP backups include those files.
- Transparent local data checks, labelled clearly as rules-based rather than live AI.

## Presentation studio

Open **Slides** in the workspace. Choose **Create my project deck**, a close-out review, or a blank presentation. Edit the content fields, drag slides to rearrange them (or use the move buttons), and select **Present** or **PowerPoint**. The menu beside PowerPoint also downloads a PDF.

- Eight layouts: title, section divider, key figures, chart, talking points, two columns, table and photo.
- Three coordinated themes, editable chart figures, table cells, captions and speaker notes.
- Add, duplicate, delete and reorder slides; undo and redo edits.
- Multiple saved decks per project, automatic browser saving and workspace-backup support.
- Updated copies use the latest project figures while preserving previous decks and manual edits.
- Editable PowerPoint text, native tables and native charts when figures are complete. Missing chart values remain labelled as missing and use editable shapes.
- Landscape PDF exports retain the slide layout. Speaker notes are included in PowerPoint only.

See `docs/SLIDE-STUDIO.md` for limits, shortcuts and implementation details.

## Enterprise frontend additions

- **Saved reports:** reopen drafts, duplicate them, compare revisions, add review notes and track Draft / In review / Ready to share. Each revision retains its reporting date, source dataset versions and branding; downloads regenerate those saved figures.
- **Multi-file queue:** drag in up to 20 files / 50 MB per batch, review each worksheet, add recognised files together, retry or replace failed files, and see completion totals. Per-file limits still apply. Keep the tab open until the queue finishes.
- **People and billing:** invitation acceptance, verification and password-reset previews; editable roles, deactivation and intended project access; owner-only billing preferences, seat counts and a clearly labelled invoice layout preview.
- **Company styles:** shared logo, colours, cover label, footer and slide theme. Save reusable report settings or presentation styles. New decks use current project figures; styles do not copy old figures or private commentary.
- **Contextual assistant:** available beside charts, reports and slides, with links to source datasets and an explicit action to apply drafted report commentary. It uses local calculations, not live AI.
- **Interaction polish:** responsive layouts, focus indicators, keyboard-accessible controls, reduced-motion support, skip navigation and recoverable errors. Live-browser and real-planner usability checks are still pending; see `docs/FRONTEND-QA.md`.

Company styles and saved reports are included in workspace backups. Account, membership and billing preview settings are separate browser records and are not included.

## Proposed pricing and user licences

Monthly company fees: Essentials **R499** (up to 10 active users), Team **R1,499** (up to 50), Enterprise **R3,999** (up to 200). Add **R149 per full user** (Owner/Admin/Planner) or **R49 per Viewer** per month. The owner needs one full licence. Prices are proposed launch fees in ZAR, excluding applicable tax. More than 200 users needs a custom quote. Annual payment receives 10% off and is paid upfront.

The home page has a live calculator and carries the selection into signup. Company Billing shows both the current active-team estimate and separately saved budget quantities. Draft invitations and inactive profiles are excluded from the next-period team estimate. No joining fee, payments, prorated refunds, or live subscriptions are created. User IDs stay stable across role changes; licence references carry OWN/ADM/PLN/VWR role codes and are not passwords or activation keys. See `docs/PRICING.md` for the model, examples and backend requirements.

## What is still to be built

The complete catalogue is represented in the frontend. Listing a template does not mean its specialist analytics are finished. A template labelled **Template preview** exports its input records with review notes. Critical-path calculation, schedule recovery, earned value, shutdown readiness rules, reliability measures and other specialist calculations need additional implementation and domain validation. Presence of required datasets alone is not evidence of correctness or approval.

Backend stage: secure accounts and organisation permissions, invitation email delivery, email verification and password recovery, subscription billing, shared projects, durable cloud file storage, live grounded AI, document extraction/OCR, full report-specific calculations, large-file processing, import adapters for Primavera and other enterprise systems, source linking beyond exact activity IDs, and enterprise auditing.

## Try the organisation flow

1. Open `index.html` and choose **Create organisation**.
2. Use sample company and owner details. Choose a proposed plan and add optional invitation drafts.
3. Open **View organisation setup**. Under **People & access**, use **Preview joining** on an invitation to create a local member profile. Owners can adjust roles, project selections and billing preferences.
4. Open the planning workspace to start with an empty company project.
5. To preview a returning user, open `signin.html`, enter the workspace address and the owner or accepted member email you used, and enter any sample password of at least eight characters.

The sample organisation address is **nextgen-planning**, with owner email **alex@example.com**. **Explore the demo** opens the fictional planning project without a form.

These screens do **not authenticate users**. Passwords are never persisted or verified. No emails are sent, roles grant no permissions, and no subscription or payment is created. Organisation profiles and invitation drafts are stored in `localStorage`; the current preview selection is stored in `sessionStorage`. Anyone using the same browser profile can inspect or change this data. A local project namespace is for convenient separation, not tenant security. Use sample details only. See `docs/ORGANISATIONS.md` for the intended account and subscription model.

## Data and calculations

- The quick **Progress update** requires an activity schedule. Available budget, cost, risk and issue files are included when present. The full Executive Progress Report retains its original input requirements.
- File-type suggestions use known column patterns and a few explicit filename clues. Unknown layouts ask for a selection. Import confirmation does not certify that a guessed file type or column mapping is correct.
- Saved mappings are per project and match the exact set of column headings. Review the displayed file type when different kinds of files use identical headers. The import date selected by the user becomes the project reporting date.
- Basic review checks are not domain validation, client acceptance or approval. Missing progress remains missing and is not silently replaced with zero.
- Only format, audience, detail and chart grouping are remembered for report downloads. Previous commentary and date filters are not copied into a new report.
- Project records are stored locally with **IndexedDB**. There is no cloud sync or multi-user access.
- Changing browsers, using a different origin (local, preview or GitHub Pages), clearing browser data, or using private browsing can make records unavailable. Export a workspace backup from Settings.
- Limits: 10 MB per input file and 5,000 rows per dataset. This is a frontend working version, not a production enterprise data store.
- Dates must be unambiguous `YYYY-MM-DD`. Excel date cells are converted to that format; percentage-formatted numeric cells are converted to 0–100.
- For each dataset type, the latest version at or before the cut-off is selected. Older versions remain available.
- Progress is the supplied-weight average where valid weights exist, otherwise the unweighted average of available activity percentages. Missing percentages are excluded, not treated as zero.
- An activity is overdue when its planned finish is before the reporting cut-off and it is neither complete nor cancelled/deferred.
- A status of completed/closed or 100% progress is treated as recorded completion. This is separate from acceptance, inspection or operational authorisation.
- Datasets 51, 52, 43 and 24 can contribute budget, actual cost, actual hours and weights using mapped activity IDs. Numeric values are summed by activity ID. When no matching supporting value exists, an activity's own value is used.
- Actual costs are recorded values, not an estimate of final cost. Commitments and forecasts require their own logic.
- All currency displays currently use ZAR. Currency conversion and mixed-currency datasets are not supported.
- The time-series chart uses dataset 21 as supplied project-level progress snapshots. It is not inferred from current task progress. Project-wide history stays labelled when activity scope filters are used.
- Source rows, filenames, dates, calculation descriptions and review gaps accompany report exports.
- CSV exports contain the selected report's primary table. Excel contains additional source-data sheets; combined ZIP includes separate source-dataset CSV files.
- PowerPoint executive presentations show up to 12 main records and the first six columns. Detailed presentations split all main records across slides. Excel/CSV preserve every column.

## Source layout

```text
index.html                Marketing home page
signin.html               Organisation sign-in and recovery previews
create-organisation.html  Four-step company setup
organisation.html         Company, plan and team draft management
workspace.html            Existing planning and reporting workspace
website.css               Marketing, account and onboarding design
styles.css                Planning workspace design
guided.css                Guided workflow and simple report controls
slides.css                Presentation gallery and editor design
enterprise.css            Report library, upload queue, team and assistant design
js/report-library.js      Saved revisions, comparisons and review notes
js/upload-queue.js        Multi-file reading, review and retry
js/company-templates.js   Shared branding and reusable styles
js/assistant-panel.js     Source-linked contextual explanations
js/account-flows.js       Invite, verify and reset previews
js/pricing.js             Company fees, licence rules, totals and identifiers
js/pricing-ui.js          Shared calculator, signup and billing estimates
pricing.css              Pricing and licence identity layouts
js/organisation-tools.js  Members, project selections and billing previews
js/slide-studio.js         Deck editing, autosave, history and presenting
js/slides-model.js         Layouts, project snapshots and preview scenes
js/slides-export.js        Editable PPTX and landscape PDF exports
js/guided.js              File suggestions, saved mappings and basic schedule checks
js/website.js             Home-page menu and demo entry
js/account.js             Account, company and invitation preview interactions
js/account-store.js       Local preview settings (never passwords)
js/app.js                 Screens, interactions, forms and local assistant
js/engine.js              Catalogue access, calculations, filters and CSV parsing
js/catalog.js             All 240 catalogue entries
js/imports.js             Spreadsheet reading and validation
js/exports.js             PDF, PPTX, XLSX, CSV and ZIP generation
js/storage.js             Local IndexedDB persistence
js/sample.js              Fictional demonstration records
js/ui.js                  Icons and SVG chart rendering
vendor/                   Bundled browser libraries; no CDN required
sample-data/              Example schedule CSV for testing imports
docs/full-catalogue.md     Complete requested dataset/report catalogue
docs/IMPLEMENTATION.md     Frontend completion and backend roadmap
tests/                    Calculation and DOM workflow checks
```

## Development checks

The app runs without npm. To run the development tests only:

```bash
npm install
npm test
```

The 33 checks cover core calculations, missing-data handling, CSV parsing, dates, version selection, filters, project interactions, company onboarding, sign-in preview, password disposal, invitations, plan changes, local workspace separation, relative page links, repeated imports, guided reports, data-review corrections, presentation generation, slide editing, undo/redo, presentation navigation, persistence and snapshot isolation. They also cover report revision preservation, comparisons, batch retry, company style reuse, contextual commentary, employee joining, verification/reset previews and intended access settings. Actual PDF/PPTX/XLSX/CSV outputs were generated and inspected during development. Browser visual testing was not available in the authoring environment, so confirm the responsive layout in your target browsers before using this with a client.

## Libraries

ExcelJS 4.4.0, pdf-lib 1.17.1, PptxGenJS 4.0.1 JSZip 3.10.1, @pdf-lib/fontkit 1.1.1, and DejaVu fonts are bundled under `vendor/`. Their licence files are included. Use the bundled versions for this first frontend; security reviews and dependency updates are part of production readiness.


### Learn Planvisiq (v0.8.0)
Open `learn.html` for the 3-minute-16-second narrated 3D walkthrough. It includes ten seekable chapters, captions, a transcript, eight section guides and direct workspace links. The video is self-hosted in `media/`; no video-service subscription, embedded player or API is needed.

To recreate the animation, see `docs/WALKTHROUGH.md`. Keep the entire `media/` folder when uploading to GitHub Pages or another static host.

The 1080p walkthrough uses the original saved Runway narration without local speed-up or loudness processing. Saved chapter audio is included so rebuilding needs no additional voice credits.
