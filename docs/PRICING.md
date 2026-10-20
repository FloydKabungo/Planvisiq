# Planvisiq proposed launch pricing

Recommendation dated 18 October 2026. These are planning assumptions for a future paid release, not validated margins or active subscriptions.

## Monthly fees in ZAR

| Company plan | Platform fee per month | Maximum active users |
| --- | ---: | ---: |
| Essentials | R499 | 10 |
| Team | R1,499 | 50 |
| Enterprise | R3,999 | 200 |

Every plan also charges R149 per active Owner, Admin or Planner, and R49 per active Viewer per month. The owner counts as one full user. Both full users and viewers count toward the plan maximum. A company may choose a larger plan before it reaches the threshold. More than 200 users requires a custom quote; the calculator does not extrapolate an unsupported price.

The company fee covers the platform and workspace; individual licences cover access for named users. One combined invoice lists both. There is no separate joining, ID-creation or one-time activation fee. People who only receive exported files need no account or licence. All amounts exclude applicable tax; no tax amount is assumed in the frontend.

Annual payment is the monthly company-plus-licence total multiplied by 12, less 10%, payable upfront. This is not a monthly instalment. Proration, seat changes during an annual commitment, refunds, tax and renewal dates must be defined and calculated by the billing service.

## Examples

| Configuration (owner included) | Monthly before tax | Annual upfront before tax |
| --- | ---: | ---: |
| Essentials, 1 full user | R648 | R6,998.40 |
| Essentials, 5 full users + 2 viewers | R1,342 | R14,493.60 |
| Team, 10 full users + 5 viewers | R3,234 | R34,927.20 |
| Enterprise, 50 full users + 20 viewers | R12,429 | R134,233.20 |

## Profile and licence IDs

A company has a `PV-ORG-…` reference. Each person has a stable `PV-U-…` ID. The owner reference derives from the company identity; member references derive from their stored UUID. Licence references use `PV-OWN-…`, `PV-ADM-…`, `PV-PLN-…` or `PV-VWR-…` according to the current role. Changing a role changes the licence reference/category while preserving the user ID. These are preview reference identifiers, not passwords, payment evidence, access tokens or activation keys. Backend identity and paid entitlement must be separate records.

The current-team estimate uses active profiles, including the owner. Invitation drafts and deactivated profiles are excluded. Saved budget quantities represent future staffing and do not create users or charges. The next-period estimate does not calculate refunds for an already paid period. A Viewer-to-Planner role change affects the next estimate; it does not collect payment.

## Commercial rationale and limits

The fixed company fee creates a baseline for servicing each organisation; per-user charges grow with adoption. A lower Viewer rate recognises read-only use. All plans keep the core reports, charts and presentation tools, with user capacity distinguishing these proposed tiers. This is a starting hypothesis: confirm willingness to pay and measure support time, cloud storage, export workloads, live AI consumption and payment costs before launch. Do not promise unlimited AI or unlimited storage. Define and display any usage allowances before sales; no such quotas or billing are enforced in this frontend.

Official reference pages checked on 18 October 2026:

- [Microsoft Power BI pricing](https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing): Pro US$14 per user/month and Premium Per User US$24 per user/month, paid yearly on the displayed US page. These are reference prices, not South African conversion estimates.
- [Smartsheet pricing](https://www.smartsheet.com/pricing): displayed ZAR Pro R230 monthly / R170 per month billed yearly; Business R450 monthly / R359 per month billed yearly. Plans have different features and user arrangements, so these are benchmarks rather than claims of equivalence.

## Backend work before charging customers

Implement authenticated memberships, server-enforced roles and entitlements, verified invitation acceptance, unique user/licence records, company ownership controls, billable seat reconciliation, tax configuration, payment provider checkout/portal and idempotent billing webhooks. Confirm charges and effective dates before applying paid changes. Preserve auditable billing events; reconcile cancellation and deactivation to the contractual billing period. Monthly totals here are estimates only. No money is collected by this frontend.
