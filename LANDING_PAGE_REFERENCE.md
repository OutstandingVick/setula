# Setula landing page reference analysis

Reviewed on 4 August 2026. This document records the limited, reference-led patterns used for Setula. It is not a licence to copy brand assets, source code, or product claims.

## Reference matrix

| Specific pattern | Source | Setula adaptation | Deliberately not copied |
| --- | --- | --- | --- |
| A spacious split hero pairs a benefit-led message with a working transfer form. | Wise send-money | Setula leads with the UAE-agency contractor-payment promise on the left and an AED-to-INR sandbox quote on the right. The quote remains the most interactive object above the fold. | Wise branding, green palette, type treatment, copy, currency set, icons, imagery, fee claims, and component/CSS implementation. |
| The receive amount is the strongest value, with rate, fees, and arrival details grouped beneath it. | Wise send-money | INR receives the strongest numerical emphasis. The sandbox rate, Setula fee, partner/payout fee, and estimate are presented as one readable quote summary. | Wise pricing logic, exchange-rate claims, discounts, delivery promises, and field styling. |
| The conversion tool is part of the acquisition journey, not a decorative mock-up. | Wise send-money | A validated AED input recalculates INR with integer-safe minor-unit arithmetic and carries both values into the existing demo. | Wise account creation flow, recipient selection flow, and any proprietary transfer behaviour. |
| Infrastructure is introduced after the core benefit is clear, using alternating product-led sections. | Airwallex global | Setula first proves one contractor payment, then explains the quote, settlement, payout, ledger, and recovery layers. Alternating compositions keep the narrative moving without adding products. | Airwallex product catalogue, screenshots, customer proof, statistics, AI claims, visual identity, and platform breadth. |
| Product surfaces are shown inside the story instead of separated into a gallery. | Airwallex global | Existing Setula dashboard concepts—quote, Arc status, ArcScan evidence, payout status, and receipt—appear as an embedded proof panel using validated test data. | Airwallex device mock-ups, dashboard imagery, proprietary assets, and marketing claims. |
| A restrained dark canvas, fine borders, large editorial type, and layered interface depth keep the product dominant. | Linear | Setula uses warm neutral surfaces, a deep ink contrast section, soft borders, and limited depth. Product records and the settlement route remain more visually important than decoration. | Linear's logo, black-and-white identity, exact typography, application screenshots, motion code, and component styling. |
| Motion explains state and hierarchy while copy remains stable and readable. | Linear | Gentle reveals, calculator value feedback, and a single lazy settlement scene illustrate quote-to-delivery progression. Motion is reduced or removed when requested or when device constraints suggest it. | Continuous decorative motion, Linear's transitions, interaction timing, and interface choreography. |

## Setula composition decisions

- The primary story stays singular: a UAE agency pays one India-based contractor an exact INR invoice amount.
- The hero follows Wise's information architecture, but uses Setula's own warm-neutral and coral-on-ink visual system.
- The infrastructure story follows product proof, as in Airwallex, so the platform layer does not obscure the initial payment use case.
- Linear's restraint guides motion and depth: one purposeful Three.js scene, low particle count, no floating coins, no neon, and no motion unrelated to payment state.
- The page is complete and understandable before WebGL loads. A semantic AED → USDC on Arc → INR fallback carries the same explanation.
- Claims distinguish real Arc Testnet settlement from simulated AED funding and INR payout. Arc is never presented as the local payout rail.

## Evidence and claim boundaries

- Safe product proof may use the validated `0.01 USDC` Arc Testnet settlement, its public transaction hash, ArcScan link, `COMPLETE` Circle status, and payment reference from `BACKEND_GOLDEN_PATH_RESULTS.md`.
- Wallet identifiers, addresses, Circle credentials, callback secrets, and local runtime data are excluded.
- Contractor payouts are the only current application. Supplier payments, tuition payments, and family remittances may appear only under an explicit `Future applications` label.
- No production-readiness, live fiat collection, live INR payout, customer, volume, speed, or savings claim is added.

## Responsive and motion model

- Desktop: compact sticky navigation, two-column hero, calculator visually balanced with the headline, and alternating proof sections.
- Mobile: stacked hero with copy first and calculator second; the settlement story uses a static lightweight route rather than WebGL.
- Reduced motion: no particle travel, no scroll choreography, and no animated value transitions that obscure the updated result.
- Hidden/offscreen: the WebGL render loop pauses when the document is hidden or its section leaves the viewport.

