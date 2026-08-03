# Setula Hackathon MVP Scope

## Product definition

A UAE agency can pay one India-based contractor an exact INR invoice amount using USDC settlement on Arc, proven by a real Arc transaction and an invoice-linked receipt.

## Primary user

A finance manager at a small UAE agency paying an overseas contractor.

## Golden path

1. User enters contractor and invoice details.
2. Setula generates a sandbox AED-to-INR quote.
3. User approves the payment.
4. AED funding is simulated.
5. A real USDC transfer executes on Arc Testnet.
6. INR payout is simulated.
7. Setula shows the payment as delivered.
8. User views the ArcScan transaction and receipt.

## Building

- One business
- One contractor
- One invoice
- AED-to-INR quote
- Mock AED funding
- Real Arc USDC transfer
- Mock INR payout
- Payment status timeline
- ArcScan transaction link
- Invoice-linked receipt
- Idempotency protection
- Insufficient-balance failure state

## Not building

- Batch payments
- Multiple contractors
- Multiple corridors
- Live AED collection
- Live INR payout
- KYC or KYB
- Consumer remittances
- Payroll
- Supplier payments
- CCTP
- Gateway
- Paymaster
- Nanopayments
- Escrow
- Route optimisation
- Admin dashboard
- Analytics
- Mobile app
- AI features

## Definition of done

The MVP is complete only when:

- One payment completes end to end.
- A real USDC transaction succeeds on Arc Testnet.
- The transaction appears on ArcScan.
- The recipient payout simulation updates the correct payment.
- Duplicate submissions cannot send twice.
- Insufficient balance does not show `SETTLED`.
- The invoice and receipt reference the same payment.
- The deployed demo works five consecutive times.

## Scope rule

Do not add a feature unless it is required for the golden path, judging criteria, or demo reliability.

Any new feature must replace an existing feature rather than expand the scope.
