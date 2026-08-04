# Setula landing page results

## Scope delivered

The Next.js landing page presents one primary journey: a UAE agency pays an India-based contractor an exact INR amount while USDC settles between payment partners on Arc Testnet. It does not add a payment product or change backend business logic.

Sections delivered:

1. Compact sticky navigation.
2. Wise-inspired split hero with an interactive AED-to-INR quote.
3. Three-step invoice, Arc settlement, and local-delivery journey.
4. Lazy AED → USDC on Arc → INR settlement visualization.
5. Validated product-proof panel with ArcScan evidence and matching references.
6. Payout rejection and controlled recovery-state explanation.
7. Reusable infrastructure and explicitly labelled future applications.
8. Narrow, demonstrated “Why Arc” explanation.
9. Final demo CTA and disclosure-focused footer.

## Reference adaptations

- **Wise:** split hero information architecture, high-emphasis receive amount, transparent quote breakdown, and calculator-led CTA. No Wise assets, copy, colours, pricing logic, or implementation were copied.
- **Airwallex:** benefit-first infrastructure narrative, alternating product-led sections, and platform-layer explanation after product proof. No Airwallex screenshots, claims, statistics, or catalogue were copied.
- **Linear:** restrained typography, fine borders, layered product surfaces, and motion used only to explain state. No Linear assets, components, motion code, or branding were copied.

Full analysis: `LANDING_PAGE_REFERENCE.md`.

## Three.js implementation

- `SettlementVisual.tsx` retains a semantic CSS route as the first render and fallback.
- Capability checks exclude mobile widths, reduced-motion preferences, devices with four or fewer logical processors, devices reporting 4 GB or less memory, and browsers without WebGL.
- An intersection observer delays rendering the client scene until it nears the viewport.
- `SettlementScene.tsx` dynamically imports Three.js, limits device pixel ratio to `1.5`, and uses seven small particles.
- Calculator interaction starts a finite `1.65 s` route animation. It does not autoplay continuously.
- Rendering pauses when the visual leaves the viewport or the document becomes hidden and disposes GPU resources on unmount.

## Rendered verification

Validated locally on 4 August 2026:

| Check | Result |
| --- | --- |
| Desktop viewport | `1440 × 900`, no horizontal overflow |
| Mobile viewport | `390 × 844`, no horizontal overflow, CSS fallback, no canvas |
| Default quote | `4,000 AED → 91,000 INR` |
| Fractional quote | `1,234.56 AED → 28,086.24 INR` |
| Invalid negative input | Rejected; CTA disabled and no demo URL |
| CTA handoff | Demo opened with `AED 4,000.00 → INR 91,000.00` visibly prefilled |
| Desktop WebGL | Loaded only when the settlement section approached the viewport |
| Product proof | Public ArcScan hash and matching invoice/payment/receipt reference shown |

## Lighthouse review

Production build audited locally with Lighthouse `13.0.1` against `http://localhost:3002`:

| Category / metric | Result |
| --- | ---: |
| Performance | `100` |
| Accessibility | `100` |
| Best practices | `100` |
| SEO | `100` |
| First Contentful Paint | `0.8 s` |
| Largest Contentful Paint | `1.9 s` |
| Total Blocking Time | `10 ms` |
| Cumulative Layout Shift | `0` |
| Total transferred | `149 KiB` |

Lighthouse is a local lab result and will vary by machine and deployment.

## Accessibility and performance fixes

- Added a skip link, global visible focus treatment, semantic regions and headings, live quote output, linked validation feedback, text equivalents for visual routes, and sufficient audited colour contrast.
- Removed horizontal overflow at mobile and desktop widths and added long-hash wrapping.
- Added reduced-motion overrides, static mobile fallback, background-tab/offscreen pausing, a small favicon, and a compressed `1200 × 630` social card.
- No unnecessary third-party browser scripts were added.

## Automated verification

Run:

```sh
npm run typecheck
npm run typecheck:landing
npm test
npm run build
npm run build:landing
```

The Vitest suite includes the existing backend golden-path coverage and landing calculator/CTA URL unit coverage.

## Remaining blockers

- The landing page has not been deployed in this task, so the full deployed experience and five consecutive deployed demo runs remain unverified.
- Real AED collection and real INR payout remain intentionally simulated under `MVP_SCOPE.md`.
- A real Arc settlement spends test USDC and remains an explicit verification action; normal automated tests inject the settlement gateway and do not send funds.

## Social preview asset

`landing/app/opengraph-image.jpg` was generated once with the built-in image-generation workflow, then cropped to `1200 × 630` and compressed. The prompt specified an original warm-ivory Setula card with an abstract AED → USDC on Arc → INR route, exact Setula copy, and explicit exclusions for third-party branding, coins, maps, fake claims, and credentials.
