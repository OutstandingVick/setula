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

Pending deployment.

## Desktop and mobile QA

Pending deployment.

## Performance issues

Initial uncached tunnel responses ranged from approximately `0.66s` to `2.60s`.
No asset failures were observed. Account-less validation tunnels have no uptime
guarantee and are not a durable production host.

## Secret scan

Pending deployment.

## Remaining blockers

Five consecutive golden-path runs, responsive QA, and the secret scan remain in
progress.
