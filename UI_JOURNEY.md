# Setula UI Journey and API Map

The UI uses only existing backend objects and fields. Presentation-only sandbox
copy such as “no Setula fee in this demo” is not represented as an API field.

## 1. Payment details

| Concern | Mapping |
| --- | --- |
| Backend requests | `POST /api/beneficiaries`, then `POST /api/invoices` |
| Request fields | Beneficiary: `name`, `email`, `bankAccountLast4`; invoice: `beneficiaryId`, `reference`, `amountInrMinor`, `description` |
| Response fields | Beneficiary: `id`, `name`, `bankAccountLast4`; invoice: `id`, `reference`, `amountInrMinor`, `description` |
| Loading state | Continue button disabled with “Creating invoice…” |
| Success state | Advance to quote review with created beneficiary and invoice retained |
| Failure state | Inline error summary; entered invoice values remain intact |
| User action | Review seeded contractor, enter invoice details, continue |

## 2. Quote review

| Concern | Mapping |
| --- | --- |
| Backend requests | `POST /api/invoices/:invoiceId/quotes`; approval uses `POST /api/payments` |
| Response fields | Quote: `id`, `reference`, `amountInrMinor`, `rateInrPerAed`, `amountAedMinor`, `usdcAmount`, `expiresAt`; payment: `id`, `reference`, `status`, `timeline` |
| Loading state | Quote skeleton, then approval button disabled while payment intent is created |
| Success state | Exact INR dominates; AED, rate, deterministic zero demo fees, delivery expectation, and expiry are shown |
| Failure state | Quote error with safe return to payment details; expired quote cannot be approved |
| User action | Approve payment |

## 3. Payment progress

| Concern | Mapping |
| --- | --- |
| Backend requests | `POST /api/payments/:id/funding-confirmations`; `POST /api/payments/:id/settlements`; `GET /api/payments/:id`; server-only `POST /api/payments/:id/demo-payouts` |
| Response fields | Payment: `reference`, `status`, `timeline`; settlement: `status`, `amountUsdc`, `circleTransactionId`, `transactionHash`, `arcScanUrl`; payout: `status` |
| Loading state | Current stage pulses, action is locked, and a bounded timeout message appears if settlement is still pending |
| Success state | Separate funding, Arc settlement, payout processing, and paid events with timestamps |
| Failure state | `SETTLEMENT_FAILED` shows insufficient-balance evidence and never renders an ArcScan link |
| User action | No repeated manual action; the approved payment advances through the backend flow once |

The demo payout endpoint is an integration bridge for the existing simulated
callback. It invokes the existing callback service on the server so
`PAYOUT_CALLBACK_SECRET` never reaches browser code. It does not alter payment
business rules or state transitions.

## 4. Receipt or failure

| Concern | Mapping |
| --- | --- |
| Backend requests | `GET /api/payments/:id`, `GET /api/receipts/:receiptId` |
| Response fields | Receipt: `reference`, `amountInrMinor`, `amountUsdc`, `transactionHash`, `arcScanUrl`, `deliveredAt`; related invoice and quote fields come from the payment aggregate |
| Loading state | Receipt surface skeleton while the aggregate is retrieved |
| Success state | Matching invoice/payment/receipt reference, contractor, AED, USDC, INR, rate, zero sandbox fees, hash, and timestamp |
| Failure state | Clear settlement or payout rejection message; no false proof link; start-new-payment action only |
| User action | Print or download via the browser print dialog; start a new payment |

## Idempotency and duplicate prevention

- Each mutation gets one UUID stored for the lifetime of that action.
- Buttons lock synchronously before the request begins.
- Retries reuse the same action key.
- Settlement is requested once per payment; double-clicks return the same in-flight promise.
- The backend remains the source of truth and already prevents two Arc transfers for one payment.
