# Setula Deployment Validation

Date: 2026-08-04

## Deployment

| Field | Result |
| --- | --- |
| Frontend URL | https://problems-danny-juice-conduct.trycloudflare.com |
| Backend URL | https://argue-scale-smoking-regular.trycloudflare.com |
| Branch | `main` |
| Deployed commit | `e882fd5` |
| Deployment method | Public Cloudflare validation tunnels |

## Environment variables configured

Values are intentionally omitted.

- Backend: `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `CIRCLE_WALLET_A_ID`, `CIRCLE_WALLET_A_ADDRESS`, `CIRCLE_WALLET_B_ID`, `CIRCLE_WALLET_B_ADDRESS`, `CIRCLE_BLOCKCHAIN`, `CIRCLE_USDC_TOKEN_ID`, `PAYOUT_CALLBACK_SECRET`, `HOST`, `PORT`, `DATA_FILE`, `POLL_INTERVAL_MS`, `POLL_TIMEOUT_MS`
- Frontend: `DEMO_BACKEND_ORIGIN`

## Route checks

| Check | Result |
| --- | --- |
| Frontend `/` | `200 text/html` |
| Frontend `/pay` | `200 text/html` |
| `/pay/styles.css` | `200 text/css` |
| `/pay/app.js` | `200 text/javascript` |
| `/pay/favicon.svg` | `200 image/svg+xml` |
| Backend `/health` | `200 application/json`, `{"status":"ok"}` |
| Frontend API proxy | Reached backend and returned backend JSON `404 Payment not found` for a deliberately unknown UUID |
| Quote calculator | INR `91,000.00`, AED `4,000.00`, settlement proof `0.01 USDC` |
| Payment progress | Rendered `PAYOUT_PENDING` after Circle settlement; delivery remained waiting |
| Receipt page | Rendered `Payment delivered` with reference and ArcScan evidence after payout callback |
| Receipt refresh | Reload restored the delivered receipt and original ArcScan link |

## Five-run results

Every run observed, in order:

`DRAFT → QUOTED → FUNDED → SETTLEMENT_PENDING → SETTLED → PAYOUT_PENDING → DELIVERED`

| Run | Payment reference | Circle status | Transaction hash / ArcScan | Final state | Receipt ID | References match |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `INV-SETULA-CB426ADD` | `COMPLETE` | [`0x8cd5c289495e07a81dc0047e2e55a7c9a3263001b6a79420ddba506087bb20a2`](https://testnet.arcscan.app/tx/0x8cd5c289495e07a81dc0047e2e55a7c9a3263001b6a79420ddba506087bb20a2) | `DELIVERED` | `2c4da94c-d5be-4e74-a5b5-ebf73e5475cf` | Yes |
| 2 | `INV-SETULA-4EE19337` | `COMPLETE` | [`0x0b03d23b983a3d282a3b866bc65a052f49efd596e96f63a954a7e9f447f2a7be`](https://testnet.arcscan.app/tx/0x0b03d23b983a3d282a3b866bc65a052f49efd596e96f63a954a7e9f447f2a7be) | `DELIVERED` | `36db2d93-7187-4673-b587-45725faaa6f1` | Yes |
| 3 | `INV-SETULA-C937FF0A` | `COMPLETE` | [`0x508d8a037216445242d3c51c220ca580fae12ee48a1e8a84c0a8952bdbeeabe4`](https://testnet.arcscan.app/tx/0x508d8a037216445242d3c51c220ca580fae12ee48a1e8a84c0a8952bdbeeabe4) | `DELIVERED` | `847c4c3e-4f4e-4f6d-8cfa-e790bd0a2e48` | Yes |
| 4 | `INV-SETULA-0805BE4F` | `COMPLETE` | [`0x089ae37c07ce681662fb84aed0a04b25a140df7fd66e7ad7e5c9e1546f367aac`](https://testnet.arcscan.app/tx/0x089ae37c07ce681662fb84aed0a04b25a140df7fd66e7ad7e5c9e1546f367aac) | `DELIVERED` | `d89ebf16-88da-4b07-a2d4-91fad9a815d4` | Yes |
| 5 | `INV-SETULA-85659FE5` | `COMPLETE` | [`0x2654270160c6491224065f96ec4cf8158ea055e8578ee75b9f2683385f01d2cd`](https://testnet.arcscan.app/tx/0x2654270160c6491224065f96ec4cf8158ea055e8578ee75b9f2683385f01d2cd) | `DELIVERED` | `aee856f4-73f6-4fd9-bdbd-de4239e1f47d` | Yes |

All five runs used unique payment references and generated unique request
idempotency keys. Each ArcScan page returned HTTP `200`. Duplicate settlement
submissions retained the original Circle transaction and hash with recipient
duplicate delta `0`. Each run also exercised the insufficient-balance path:
final state `SETTLEMENT_FAILED`, never `SETTLED`, payout callback rejected,
no ArcScan link, and recipient delta `0`.

## Desktop and mobile QA

| Width | Landing overflow / clipping | Payment overflow / clipping | Monetary value | Buttons |
| ---: | --- | --- | --- | --- |
| `1440px` | None | None | Readable at `72px` | Inside viewport |
| `1024px` | None | None | Readable at `72px` | Inside viewport |
| `768px` | None | None | Readable at `61.44px` | Inside viewport |
| `390px` | None | None | Readable at `62px` | Inside viewport |
| `320px` | None | None | Readable at `51.2px` | Inside viewport |

- Mobile navigation reduced to the Setula brand and visible launch action; no
  navigation item was clipped.
- The Three.js enhancement was unavailable in the test browser, and the AED →
  USDC → INR fallback remained complete and readable at every width.
- Hero and next-section geometry was unchanged after load at `1440px` and
  `320px`; no late layout shift was observed.
- Keyboard focus displayed a `3px` solid outline with `4px` offset.
- Quote creation and approval displayed loading copy and disabled actions.
- A real UI payment rendered settlement progress, remained `PAYOUT_PENDING`
  before the payout callback, then rendered and restored the receipt after
  refresh.
- A double-click on approval immediately removed the approval action and left
  it disabled as `Approving…`; recipient balance increased by exactly `0.01`
  USDC, confirming no duplicate transfer.
- The insufficient-balance failure screen showed no completed settlement,
  receipt, or ArcScan link.
- No browser console warnings or errors were observed.

## Performance issues

Initial uncached tunnel responses ranged from approximately `0.66s` to `2.60s`.
No asset failures were observed. Account-less validation tunnels have no uptime
guarantee and are not a durable production host.

## Secret scan

PASS.

- `.env` is ignored and is not tracked.
- Actual configured values for `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, and
  `PAYOUT_CALLBACK_SECRET` were absent from all 52 tracked files and 15 built
  client assets.
- No private-key, common live/test secret-key, or AWS access-key patterns were
  found in tracked files.
- The browser receives neither Circle credentials nor the payout callback
  secret.

## Remaining blockers

None for the deployment-validation pass conditions. The account-less public
validation URLs depend on the running tunnel processes and have no uptime SLA;
they should be replaced by durable named hosting before long-term operation.

## Verdict

`READY_TO_SUBMIT`
