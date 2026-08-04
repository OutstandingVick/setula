# Setula MVP

Thin demo UI and backend golden path for one UAE agency paying an India-based contractor.
Fiat funding and payout are simulated; settlement uses a real USDC transfer on
Arc Testnet through Circle developer-controlled wallets.

The binding product boundary is [`MVP_SCOPE.md`](./MVP_SCOPE.md).

## Requirements

- Node.js 22 or newer
- Circle test API key and its registered entity secret
- Funded sender and recipient developer-controlled wallet IDs/addresses on `ARC-TESTNET`

Copy `.env.example` to `.env` and populate it locally. Never commit `.env`.

## Run

```sh
cd /Users/macbook/setula
npm install
npm start
```

The backend binds to `0.0.0.0:4000` by default so deployment platforms can
route traffic to it. It remains available locally at `http://127.0.0.1:4000`.
Set `HOST` to override the bind address. Runtime data is persisted atomically
to `.setula-data.json`.

Open `http://127.0.0.1:4000` to run the browser journey:

```text
Invoice details → Quote review → Arc settlement progress → Local payout confirmation → Receipt
```

The browser never receives Circle credentials or the payout callback secret.
Every mutation uses a preserved idempotency key and disables repeated actions
while a request is in flight.

### Run the public landing page

Keep the backend running on port `4000`, then start the Next.js landing page in
a second terminal:

```sh
cd /Users/macbook/setula
npm run dev:landing
```

Open `http://localhost:3001`. The hero shows a static preview of the contractor
payment screen. Its primary call to action opens the backend-served demo with
the fixed sandbox AED and INR quote encoded as validated minor-unit values. Set
`NEXT_PUBLIC_DEMO_URL` when the backend is hosted somewhere other than
`http://127.0.0.1:4000`.

## API routes

Every `POST` requires an `Idempotency-Key` header. The payout callback also
requires `X-Payout-Callback-Secret` matching `PAYOUT_CALLBACK_SECRET`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Local health check |
| `POST` | `/api/beneficiaries` | Create the India beneficiary |
| `POST` | `/api/invoices` | Create the INR invoice |
| `POST` | `/api/invoices/:invoiceId/quotes` | Generate the fixed sandbox AED/INR quote |
| `POST` | `/api/payments` | Create the payment intent in `QUOTED` |
| `POST` | `/api/payments/:paymentId/funding-confirmations` | Confirm simulated AED funding |
| `POST` | `/api/payments/:paymentId/settlements` | Execute/reconcile the Arc USDC transfer |
| `POST` | `/api/payout-callbacks` | Simulate INR payout delivery/rejection |
| `POST` | `/api/payments/:paymentId/demo-payouts` | Server-side demo bridge to the existing simulated payout callback |
| `GET` | `/api/payments/:paymentId` | Read payment and linked objects/timeline |
| `GET` | `/api/receipts/:receiptId` | Read the invoice-linked receipt |

Amounts ending in `Minor` are integer minor units: paise for INR and fils for
AED. The sandbox rates are fixed at `22.75 INR/AED` and `100.00 INR/USDC` so a
quote is deterministic and needs no external FX dependency.

## Verify

```sh
npm run typecheck
npm run typecheck:landing
npm test
npm run build:landing
```

Automated tests inject a settlement gateway and never spend Arc Testnet USDC.
The current suite contains 16 tests covering the backend state machine,
idempotency and failure paths, reference integrity, and landing quote-link
utilities.
The runtime server uses the real Circle/Arc adapter ported from
`setula-arc-spike`.
