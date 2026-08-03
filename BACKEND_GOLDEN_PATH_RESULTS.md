# Setula Backend Golden Path Results

## Test metadata

| Field | Result |
| --- | --- |
| Date tested | 2026-08-03 |
| Network | Arc Testnet (`ARC-TESTNET`) |
| Wallet type | Circle developer-controlled EOA |
| Node.js | `25.8.1` |
| npm | `11.11.0` |
| Circle SDK | `@circle-fin/developer-controlled-wallets@10.8.0` |
| TypeScript | `7.0.2` |
| tsx | `4.23.1` |
| Vitest | `4.1.10` |

No API keys, entity secrets, callback secrets, or other credentials are included
in this document.

## Successful real settlement

| Field | Result |
| --- | --- |
| Amount | `0.01 USDC` |
| Circle terminal status | `COMPLETE` |
| Circle transaction ID | `011251e4-8fa5-519d-91e5-329717f5c4c1` |
| Transaction hash | `0x347ac773f6d280952fb84ad41347e0e8f543bc93262465904e0e55db022d4900` |
| ArcScan | https://testnet.arcscan.app/tx/0x347ac773f6d280952fb84ad41347e0e8f543bc93262465904e0e55db022d4900 |
| ArcScan HTTP result | `200` |
| Arc RPC receipt status | `0x1` (success) |
| Receipt ID | `128fbc16-4499-49bf-b10e-5c8cbca5df0b` |

Observed payment states, in order:

```text
DRAFT
QUOTED
FUNDED
SETTLEMENT_PENDING
SETTLED
PAYOUT_PENDING
DELIVERED
```

`SETTLED` was recorded only after Circle reported `COMPLETE` and supplied the
transaction hash. `DELIVERED` was recorded only after the authenticated simulated
INR payout callback.

## Balance confirmation

| Wallet | Before | After successful settlement | Change |
| --- | ---: | ---: | ---: |
| Sender | `19.963809 USDC` | `19.952496 USDC` | Transfer plus Arc gas |
| Recipient | `0.03 USDC` | `0.04 USDC` | `+0.01 USDC` |

After submitting the same settlement request again, the recipient remained at
`0.04 USDC`, proving a duplicate delta of `0`.

## Insufficient-balance result

| Field | Result |
| --- | --- |
| Attempted settlement | `20.9525 USDC` |
| Final payment state | `SETTLEMENT_FAILED` |
| `SETTLED` observed | No |
| Payout callback accepted | No; HTTP `409` |
| Transaction hash generated | No |
| ArcScan link generated | No |
| Recipient balance change | `0` |

The adapter checked Circle's current sender balance and rejected the transfer
before a transaction could be submitted with an impossible amount. The payment
remained failed after an attempted payout callback.

## Duplicate-submission result

Repeating the successful payment's settlement endpoint with the same payment and
HTTP idempotency key returned the already-settled payment. The original Circle
transaction ID and transaction hash remained attached, and the recipient received
no second transfer.

Result: **PASS**.

## Reference integrity

The invoice, payment, payout, and receipt all used:

```text
INV-SETULA-671C5954
```

The receipt also linked directly to the same invoice ID and payment ID.

Result: **PASS**.

## Automated checks

```text
TypeScript typecheck: PASS
Test files: 2 passed
Tests: 9 passed
```

## Remaining blockers

There are no remaining blockers for the locally validated backend golden path.
The broader MVP definition still requires deployment and five consecutive
successful runs in the deployed demo environment.

## Verification command

```sh
cd /Users/macbook/setula && npm run verify:golden-path
```
