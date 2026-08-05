# Setula Stable Deployment Validation

Date: 2026-08-05

## Deployment

| Field | Result |
| --- | --- |
| Frontend URL | https://setula.vercel.app |
| Backend URL | https://ideal-alignment-production-912d.up.railway.app |
| Branch | `main` |
| Deployed commit | `72057d8` |
| Hosting platforms | Vercel (frontend), Railway (backend) |

## Environment variables configured

Values are intentionally omitted.

- Backend (Railway): `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `CIRCLE_WALLET_A_ID`, `CIRCLE_WALLET_A_ADDRESS`, `CIRCLE_WALLET_B_ID`, `CIRCLE_WALLET_B_ADDRESS`, `CIRCLE_BLOCKCHAIN`, `CIRCLE_USDC_TOKEN_ID`, `PAYOUT_CALLBACK_SECRET`, `HOST`, `DATA_FILE`, `POLL_INTERVAL_MS`, `POLL_TIMEOUT_MS`, `CORS_ORIGIN`
- Frontend (Vercel): `DEMO_BACKEND_ORIGIN`

## Build and start commands

| Platform | Build Command | Start Command |
| --- | --- | --- |
| Railway (backend) | `npm install && npm run build:web` | `npm run start:prod` |
| Vercel (frontend) | `npm run build:landing` | Next.js default |

## CORS configuration

The backend sets CORS headers for origins listed in the `CORS_ORIGIN` environment variable (comma-separated). Allowed origins:

- `http://localhost:3001` (landing page dev)
- `http://localhost:4000` (backend dev)
- `https://setula.vercel.app` (production)
- `https://setula-ahizkdd7g-chinedu-ogbonnas-projects.vercel.app` (deployment preview)

The Next.js landing page proxies all `/api/*` and `/pay/*` requests through `rewrites()`, so the browser never makes a cross-origin request to the backend in normal operation.

## Route checks

| Check | Result |
| --- | --- |
| Frontend `/` | `200 text/html` |
| Frontend `/pay` | `200 text/html` |
| Frontend `/pay/app.js` | `200 text/javascript` |
| Frontend `/pay/styles.css` | `200 text/css` |
| Frontend `/pay/favicon.svg` | `200 image/svg+xml` |
| Backend `/health` | `200 application/json`, `{"status":"ok"}` |
| Frontend API proxy | Reached backend, returned backend JSON `404 Payment not found` |
| Quote calculator | AED `4,000.00`, INR `91,000.00`, settlement proof `0.01 USDC` |

## Golden-path result

Full state progression observed:

`DRAFT → QUOTED → FUNDED → SETTLEMENT_PENDING → SETTLED → PAYOUT_PENDING → DELIVERED`

| Field | Result |
| --- | --- |
| Payment reference | `INV-SETULA-775E5BEC` |
| Circle transaction status | `COMPLETE` |
| Transaction hash | `0xd033f753ccae0b55585a94a754657a6154f2a6690748b55adbdbb469e2b2afec` |
| ArcScan URL | https://testnet.arcscan.app/tx/0xd033f753ccae0b55585a94a754657a6154f2a6690748b55adbdbb469e2b2afec |
| ArcScan HTTP status | `200` |
| Final payment state | `DELIVERED` |
| Receipt ID | `1aabd12a-26c0-4f7e-98c6-080b2c07a952` |
| References match | Yes |
| Amount settled | `0.01 USDC` |

## Edge case tests

| Test | Result |
| --- | --- |
| Double-click settlement protection | PASSED — duplicate settlement retained original transaction, recipient delta `0` |
| Insufficient-balance failure | PASSED — final state `SETTLEMENT_FAILED`, never settled, payout callback rejected, no ArcScan link |
| Payout callback auth | PASSED — invalid callback secrets rejected |
| Page refresh during progress | PASSED — receipt restored with original ArcScan link after refresh |
| Desktop width (1440px) | PASSED — no overflow, values readable |
| Mobile width (390px) | PASSED — no overflow, values readable, navigation adapted |

## Secret scan

PASS.

- `.env` is gitignored and not tracked.
- No Circle credentials, entity secrets, or payout callback secrets appear in tracked files or built client assets.
- The browser-facing Vercel deployment has only `DEMO_BACKEND_ORIGIN` as a sensitive env var.
- All secrets are server-side on Railway.

## Remaining blockers

None for the stable deployment pass conditions. The Railway free tier has an ephemeral disk that resets on deploy; a persistent database would be needed for production use beyond the demo.

## Verdict

`STABLE_DEPLOYMENT_READY`
