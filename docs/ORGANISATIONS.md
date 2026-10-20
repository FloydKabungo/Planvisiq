# Company accounts and subscriptions

The intended commercial model is a company subscription with individual employee accounts. The company is the organisation (tenant). Projects, source files, reports, members and billing belong to that organisation.

## User journey

1. The company representative selects **Create organisation** from the home page.
2. They provide the company name, unique workspace address, industry, country and company size.
3. They provide their own name and work email and become the organisation owner. The production app will verify the email and establish a secure individual account.
4. They choose a company subscription. Essentials, Team and Enterprise use the proposed company fees and user limits in `PRICING.md`, plus individual monthly licences. No live billing is connected.
5. The owner or an admin invites workers by email and assigns a role.
6. Each worker accepts a secure invitation and sets up their own login. Workers do not share the owner’s password.
7. Returning users find their organisation by workspace address and sign in using their own credentials. Users with memberships in multiple organisations will be able to choose a workspace after authentication.

## Proposed permissions

| Role | Intended responsibility |
| --- | --- |
| Owner | Company profile, subscription, billing, members, access, and all planning work. One initial owner; ownership transfer needs an explicit workflow. |
| Admin | Manage team invitations, memberships and projects. Billing stays with the owner unless delegated explicitly. |
| Planner | Upload and edit project records, customise charts, prepare and export reports for assigned projects. |
| Viewer | Read project information and reports shared with them. Export access can be set by organisation policy. |

These are design decisions, not permissions enforced by this frontend.

## Current implementation

- `index.html` explains the product and links to setup, sign-in and the working planning demo.
- `signin.html` checks a workspace against local preview records, then previews an owner or active-member sign-in. The sample password is discarded, not checked. Invitation acceptance, verification and password-reset completion have normal, expired and unavailable preview states. No email is sent and no ownership or password is verified.
- `create-organisation.html` records company/owner details, the selected proposed plan and optional invitation drafts. It never collects payment information or creates a real employee login.
- `organisation.html` edits the local company profile and invitation drafts, previews joining, manages member roles/status and project selections, and provides owner billing preferences, seat usage and a sample invoice layout. These are UI distinctions, not access enforcement.
- Company profiles, members, billing preferences and invitation drafts use `localStorage`. The current preview selection uses `sessionStorage` and ends when that browser session closes or the user chooses **Sign out of preview**. Ending the session does not erase local projects.
- Company projects use distinct IndexedDB workspace keys. The original fictional demo retains its existing key. This is not a security boundary; all records remain accessible to the browser profile.
- Directly opening `workspace.html` without a selected company opens the existing demo. No route in this frontend is protected by authentication.
- The company profile, invitation drafts and plan preference are not part of the project backup ZIP. Clear-browser-data operations can remove them. In production they will be stored on the server.

## Backend implementation requirements

- Model users, organisations, memberships, invitations, projects, subscriptions and audit events separately. Every project and file must have an organisation identifier.
- Enforce organisation membership and project permissions on every server operation, including downloads and exports. Never trust browser-selected roles or workspace identifiers.
- Use a supported authentication service or a properly implemented server-side auth system. Verify email ownership, protect sessions, implement password recovery and apply rate limits.
- Invitation tokens must be expiring and single use, scoped to an organisation, intended email and permitted role. Accepting an invitation should create a membership, not a shared account. Revoking membership must revoke access.
- Validate the proposed fees in `PRICING.md` against actual operating costs and pilot feedback before collecting payments. Finalise tax treatment, proration, renewal/cancellation terms and usage limits. The current UI calculates estimates only.
- Connect checkout and the billing portal server-side. Verify billing webhooks, process them idempotently, and keep entitlements aligned with actual subscription state. Handle renewals, failed payments, cancellations and seat changes explicitly.
- Add company switching only after authenticated membership lookup. Do not allow organisation discovery to expose private company or employee records.
- Add cloud storage, company backups, removal/retention workflows and audit history before accepting real customer data.

Build and test the frontend experience first, then implement these services. Marketing claims and plan descriptions must be revised to match what is actually available at launch.
