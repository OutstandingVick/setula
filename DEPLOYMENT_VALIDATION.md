# Setula Deployment Validation

Date: 2026-08-04

## Deployment

| Field | Result |
| --- | --- |
| Frontend URL | https://problems-danny-juice-conduct.trycloudflare.com |
| Backend URL | https://argue-scale-smoking-regular.trycloudflare.com |
| Branch | `main` |
| Deployed commit | `748aa03` |
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

## Five-run results

Every run observed, in order:

`DRAFT → QUOTED → FUNDED → SETTLEMENT_PENDING → SETTLED → PAYOUT_PENDING → DELIVERED`

| Run | Payment reference | Circle status | Transaction hash / ArcScan | Final state | Receipt ID | References match |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `INV-SETULA-BA366676` | `COMPLETE` | [`0x5ec54a157d4fd8bf60371ecd346ba37c9b8f3ab16074e79a30f473921e286117`](https://testnet.arcscan.app/tx/0x5ec54a157d4fd8bf60371ecd346ba37c9b8f3ab16074e79a30f473921e286117) | `DELIVERED` | `0a528fcc-aa20-468b-afe8-6964b57fa8aa` | Yes |
| 2 | `INV-SETULA-E250F246` | `COMPLETE` | [`0xfa127f8f6ac613b4c2e332e5da102d5bef76585daee258d6c50895be4fd88f4d`](https://testnet.arcscan.app/tx/0xfa127f8f6ac613b4c2e332e5da102d5bef76585daee258d6c50895be4fd88f4d) | `DELIVERED` | `6d264e9b-3364-4b44-b795-c068281481a9` | Yes |
| 3 | `INV-SETULA-8DF36523` | `COMPLETE` | [`0x611c9144aff5d38b85a5e98bf3cc0becb80f45cc19b3cf80ea8a331a03a0ea5f`](https://testnet.arcscan.app/tx/0x611c9144aff5d38b85a5e98bf3cc0becb80f45cc19b3cf80ea8a331a03a0ea5f) | `DELIVERED` | `3389814f-03bc-46bc-ade4-ccb3af11682e` | Yes |
| 4 | `INV-SETULA-54805388` | `COMPLETE` | [`0xcfcf274b47e7e1483ef86d50d5a14fc64f342958de4e1244b76aa527490a0367`](https://testnet.arcscan.app/tx/0xcfcf274b47e7e1483ef86d50d5a14fc64f342958de4e1244b76aa527490a0367) | `DELIVERED` | `548f825e-b731-4f5f-864e-c18d628b9650` | Yes |
| 5 | `INV-SETULA-9261B6EF` | `COMPLETE` | [`0xe1f45014072cbd531007c72c814fd39a4984f2d6d46fdd1743e2519e16332e3c`](https://testnet.arcscan.app/tx/0xe1f45014072cbd531007c72c814fd39a4984f2d6d46fdd1743e2519e16332e3c) | `DELIVERED` | `2983cb4a-5dc0-4b73-ba94-5c0f76cdfc01` | Yes |

All five runs used unique payment references and generated unique request
idempotency keys. Each ArcScan page returned HTTP `200`. Duplicate settlement
submissions retained the original Circle transaction and hash with recipient
duplicate delta `0`. Each run also exercised the insufficient-balance path:
final state `SETTLEMENT_FAILED`, never `SETTLED`, payout callback rejected,
no ArcScan link, and recipient delta `0`.

## Desktop and mobile QA

Pending deployment.

## Performance issues

Initial uncached tunnel responses ranged from approximately `0.66s` to `2.60s`.
No asset failures were observed. Account-less validation tunnels have no uptime
guarantee and are not a durable production host.

## Secret scan

Pending deployment.

## Remaining blockers

Responsive QA and the secret scan remain in progress.
