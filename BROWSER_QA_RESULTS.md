# Browser QA Results

Date tested: 4 August 2026

## Coverage

- Landing page at `http://127.0.0.1:3001`
- Backend golden-path UI at `http://127.0.0.1:4000`
- Desktop viewport: 1440 × 1000
- Mobile viewport: 390 × 844

## Results

- Landing page rendered without horizontal overflow at both viewport sizes.
- Header, hero, product sections, proof content, calls to action, and footer remained readable and correctly stacked on mobile.
- The mobile landing footer collapsed to one column without clipping.
- The hero payment CTA opened the backend with `aedMinor=400000`, `inrMinor=9100000`, and `source=landing-quote` intact.
- The backend displayed the expected AED 4,000 to INR 91,000 quote context.
- The backend payment-entry screen rendered without horizontal overflow at both viewport sizes.
- The primary backend action remained visible and usable on mobile.
- Internal landing-page anchor targets resolved correctly.
- No browser console errors or warnings were observed during the desktop landing-page pass.

## Outcome

The local desktop and mobile browser QA pass is complete. No responsive or navigation defects requiring code changes were found.

## Remaining validation

- Repeat the same browser pass against the deployed demo once a public deployment is available.
- Complete the five-consecutive-run reliability check in the deployed environment.
