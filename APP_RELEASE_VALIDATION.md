# Setula application release validation

Validation date: 2026-11-07  
Branch: `main`  
Validated baseline: `da56e73` plus the Phase 3 working changes documented here  
Local frontend: `http://localhost:3022`  
Local backend default: `http://127.0.0.1:4000`

## Release verdict

**Local release candidate: PASS. Public production release: NOT READY.**

The application compiles, tests, and behaves correctly within the local Phase 3 scope. Public deployment verification and a real Circle/Arc settlement were not performed because this change set has not been pushed or deployed and no production financial action is authorized. The existing backend, settlement adapter, state machine, landing page, and golden path were not changed.

## Scope and routes

Validated application routes:

- `/app`
- `/app/pay`
- `/app/pay/review`
- `/app/pay/[paymentId]`
- `/app/pay/[paymentId]/receipt`

The application intentionally uses the requested centered mobile canvas at all viewport widths. The desktop canvas is capped at 430px and surrounded by the near-black application background.

## Build and automated tests

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run typecheck:landing` | PASS |
| `npm run build:landing` | PASS; 16 routes generated |
| `npm test` | PASS; 6 files, 40 tests |
| `git diff --check` | PASS |

The production build includes all five application routes. The largest emitted static JavaScript chunk was 284 KB on disk before transfer compression.

## Responsive and visual QA

Inspected the dashboard, payment form, review transition, backend-unavailable state, fixed bottom navigation, and mobile-only desktop presentation at the requested widths:

| Viewport | Result |
| --- | --- |
| 1440px | PASS; centered 430px application canvas |
| 1024px | PASS; centered 430px application canvas |
| 768px | PASS; centered mobile presentation |
| 390px | PASS; no document overflow |
| 320px | PASS; no document overflow; actions remain in view |
| 844px × 390px landscape | PASS; centered mobile presentation |

The 320px emulation reported document width equal to viewport width, a 16px payment-purpose input, a responsive amount input, and the review button entirely inside the viewport. Monetary values use wrapping-safe containers and tabular numerals.

## Accessibility QA

- Native links, buttons, labels, and inputs remain in use.
- Skip link and labelled primary navigation are exposed to assistive technology.
- Keyboard focus uses a high-contrast Setula-green outline.
- Form errors are associated with their fields through `aria-describedby` and `aria-invalid`.
- Loading regions expose status labels without animated shimmer.
- Disabled button text contrast is at least 4.69:1 against its effective background.
- Mobile form inputs are at least 16px.
- Copy controls have text labels and a minimum 44px target height.
- `prefers-reduced-motion` remains respected; no unnecessary animation was added.

## Reliability and failure states

- Draft data is stored locally before review navigation and the application reads it again on a direct review load.
- Backend-unavailable states provide a visible explanation and retry action.
- API path identifiers are URL encoded before requests or route navigation.
- Settlement retries reuse their operation key and duplicate settlement protection remains covered by tests.
- Settlement polling runs only while pending, clears on state change/unmount, and guards asynchronous state updates after navigation.
- ArcScan evidence is shown only for a completed settlement with a transaction hash.
- Failed settlement does not expose payout or ArcScan actions.
- Transaction hashes can be copied and external explorer links use `noopener noreferrer`.

## Security review

- `.env*` files are ignored by Git.
- No private-key signature or populated Circle credential was found in tracked source by the release scan.
- No server-only secret names (`CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `PAYOUT_CALLBACK_SECRET`, `CIRCLE_WALLET_A_ID`) were found in the emitted client bundles.
- `DEMO_BACKEND_ORIGIN` is restricted to credential-free HTTP(S) origins with no path component.
- The browser never receives the payout callback secret.

Environment variable names required by the existing integration are documented without values: `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `CIRCLE_WALLET_A_ID`, `CIRCLE_WALLET_B_ID`, `CIRCLE_USDC_TOKEN_ID`, `PAYOUT_CALLBACK_SECRET`, and `DEMO_BACKEND_ORIGIN`.

## Deployment checks deferred

The following must be completed after an explicitly authorized push and deployment:

1. Confirm public `/app` routes return HTTPS 200 responses.
2. Confirm production frontend-to-backend routing and CORS behavior.
3. Repeat responsive, keyboard, and refresh checks against the deployed URL.
4. Run the existing golden path with authorized sandbox credentials.
5. Verify a real sandbox Circle transfer on Arc and match its transaction hash to the receipt.
6. Record host logs, public URLs, deployment revision, and observed settlement identifiers in this file.

No purchase, transfer, settlement, payout, push, or production deployment is part of this local validation.

## Local run command

```bash
cd /Users/macbook/setula && npm run dev:landing
```

Then open `http://localhost:3022/app`.
