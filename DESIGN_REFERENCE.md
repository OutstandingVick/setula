# Setula Demo UI Design Reference

This document records reusable interaction and visual principles observed on
2026-08-03. It intentionally adapts principles only; no reference brand assets,
copy, illustrations, proprietary icons, or complete layouts are reused.

## Wise

| Relevant screen or component | Pattern worth adapting | Why it helps Setula | What must not be copied | Setula screen |
| --- | --- | --- | --- | --- |
| Send-money quote card | Paired sender/recipient amounts with the recipient result given stronger visual weight | Finance managers can verify the contractor's exact INR outcome before approving | Wise currency controls, wording, logo, green palette, fee promotions, or card composition | Quote review |
| Rate and fee breakdown | Short labelled rows beneath the main amount rather than explanatory paragraphs | Makes sandbox pricing legible and reviewable in seconds | Wise fee names, discounts, live rates, or proprietary claims | Quote review |
| Arrival estimate | A single direct delivery expectation beside the quote | Clarifies the difference between Arc settlement and simulated local payout | Wise delivery guarantees or date calculation | Quote review |
| Predictable quote treatment | Visible expiry and locked-rate language | Prevents approval of an expired sandbox quote | Wise countdown styling or wording | Quote review |

## Stripe Dashboard

| Relevant screen or component | Pattern worth adapting | Why it helps Setula | What must not be copied | Setula screen |
| --- | --- | --- | --- | --- |
| Payment detail page | Strong page title, compact status badge, and two-column evidence/detail hierarchy | Lets the operator see outcome first and technical proof second | Stripe navigation, colour system, icons, field names, or complete detail layout | Payment progress and receipt |
| Transaction metadata | Monospaced, selectable identifiers with explicit labels | Makes payment references and Arc hashes auditable without dominating the interface | Stripe object IDs, terminology, or code components | Payment progress and receipt |
| Event history | Chronological status timeline with timestamps | Preserves the critical distinction between `SETTLED` and `DELIVERED` | Stripe event names or timeline styling | Payment progress |
| Status vocabulary | Restrained semantic badges for pending, succeeded, and failed | Makes failure unmistakable without crypto-dashboard visual noise | Stripe badge colours or status wording | Payment progress and failure |

## Mercury

| Relevant screen or component | Pattern worth adapting | Why it helps Setula | What must not be copied | Setula screen |
| --- | --- | --- | --- | --- |
| Business-finance presentation | Calm neutral surface, generous spacing, dark readable type, and a restrained blue accent | Positions Setula as serious finance software rather than a crypto product | Mercury logo, hero artwork, gradients, headlines, or full navigation | All screens |
| Minimal top navigation | Brand plus a very small set of task-oriented links | Keeps the demo focused on one payment | Mercury product menus or marketing navigation | Application shell |
| Financial forms | Clear labels, large controls, and short contextual help | Makes invoice entry fast and reduces demo mistakes | Mercury form copy or component styling | Payment details |
| Progressive task framing | One primary action per viewport | Each screen answers one decision question and keeps the demo under three minutes | Mercury onboarding steps or marketing copy | All screens |

## Setula visual synthesis

- Warm off-white application background with white financial surfaces.
- Ink text, muted secondary text, and one deep blue accent.
- Monetary values use large tabular numerals.
- Borders and shadows remain subtle; no gradients, glass effects, or decorative imagery.
- Desktop uses a centred two-column detail layout where useful; mobile collapses to one column.
- Navigation contains only Setula, New payment, and Payment details.
