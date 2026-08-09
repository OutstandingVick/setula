import { Callout } from "../../../components/docs/Callout";
import { CodeBlock } from "../../../components/docs/CodeBlock";

export default function LocalDevelopmentPage() {
  return (
    <>
      <h1>Local Development</h1>

      <h2>Requirements</h2>

      <ul>
        <li>Node.js 22 or newer</li>
        <li>Circle test API key and registered entity secret</li>
        <li>Two funded developer-controlled wallet IDs and addresses on <code>ARC-TESTNET</code></li>
      </ul>

      <h2>Install</h2>

      <CodeBlock language="sh">
        {`git clone https://github.com/OutstandingVick/setula.git
cd setula
npm install`}
      </CodeBlock>

      <h2>Configure</h2>

      <p>Copy <code>.env.example</code> to <code>.env</code> and populate:</p>

      <CodeBlock language="env">
{`CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
CIRCLE_WALLET_A_ID=
CIRCLE_WALLET_A_ADDRESS=
CIRCLE_WALLET_B_ID=
CIRCLE_WALLET_B_ADDRESS=
CIRCLE_BLOCKCHAIN=ARC-TESTNET
CIRCLE_USDC_TOKEN_ID=
PAYOUT_CALLBACK_SECRET=`}
      </CodeBlock>

      <p>Optional runtime controls:</p>

      <CodeBlock language="env">
{`HOST=0.0.0.0
PORT=4000
DATA_FILE=.setula-data.json
POLL_INTERVAL_MS=2000
POLL_TIMEOUT_MS=180000`}
      </CodeBlock>

      <Callout variant="danger">
        <p><strong>Never commit <code>.env</code>.</strong> It is listed in <code>.gitignore</code> and must never be tracked.</p>
      </Callout>

      <h2>Backend development server</h2>

      <CodeBlock language="sh">
        {`npm run dev`}
      </CodeBlock>

      <p>
        Opens <code>http://localhost:4000/pay</code>. The server binds to <code>0.0.0.0:4000</code> by default.
        Runtime data is persisted atomically to <code>.setula-data.json</code>.
      </p>

      <p>Open <code>http://localhost:4000/pay</code> to run the backend-served browser journey:</p>

      <CodeBlock language="text">
        {`Invoice details → Quote review → Arc settlement progress → Payout confirmation → Receipt`}
      </CodeBlock>

      <h2>Frontend development server</h2>

      <p>Keep the backend running on port <code>4000</code>, then in a second terminal:</p>

      <CodeBlock language="sh">
        {`npm run dev:landing`}
      </CodeBlock>

      <p>
        Opens <code>http://localhost:3001</code>. The landing page shows a static preview of the contractor
        payment screen. The demo link opens <code>http://localhost:3001/pay</code> with the sandbox quote pre-loaded.
      </p>

      <p>
        Set <code>DEMO_BACKEND_ORIGIN</code> if the backend proxy is hosted somewhere other than <code>http://127.0.0.1:4000</code>.
      </p>

      <h2>Tests</h2>

      <CodeBlock language="sh">
        {`npm test`}
      </CodeBlock>

      <p>
        16 tests covering the backend state machine, HTTP API, idempotency, failure paths,
        reference integrity, and landing-page quote utilities. Tests inject a settlement gateway
        and never spend real USDC.
      </p>

      <h3>Test breakdown</h3>

      <table>
        <thead>
          <tr><th>Suite</th><th>Tests</th><th>Coverage</th></tr>
        </thead>
        <tbody>
          <tr><td><code>tests/service.test.ts</code></td><td>9</td><td>State machine, idempotency, failure paths, reference integrity</td></tr>
          <tr><td><code>tests/http.test.ts</code></td><td>2</td><td>HTTP server integration</td></tr>
          <tr><td><code>landing/tests/quote.test.ts</code></td><td>5</td><td>Landing-page quote calculator</td></tr>
        </tbody>
      </table>

      <h2>TypeScript checks</h2>

      <CodeBlock language="sh">
        {`npm run typecheck           # backend and shared types
npm run typecheck:landing   # landing page`}
      </CodeBlock>

      <h2>Production build</h2>

      <CodeBlock language="sh">
        {`npm run build:landing   # Next.js landing page
npm run build:web       # browser bundle (esbuild)`}
      </CodeBlock>

      <h2>Golden-path verification</h2>

      <p>Runs a full end-to-end payment against a real Arc Testnet settlement:</p>

      <CodeBlock language="sh">
        {`npm run verify:golden-path`}
      </CodeBlock>

      <p>To target a deployed backend instead of a local server:</p>

      <CodeBlock language="sh">
        {`VERIFY_BASE_URL="https://ideal-alignment-production-912d.up.railway.app" npm run verify:golden-path`}
      </CodeBlock>

      <p>
        This creates a real 0.01 USDC transfer on Arc Testnet, confirms the ArcScan link returns HTTP 200,
        validates duplicate prevention (recipient delta 0), and verifies the insufficient-balance failure path
        (<code>SETTLEMENT_FAILED</code> with no ArcScan link).
      </p>

      <Callout variant="warning">
        <p><strong>This spends real Arc Testnet USDC.</strong> Ensure your sender wallet is funded and the <code>.env</code> is configured correctly before running.</p>
      </Callout>

      <h2>Repository structure</h2>

      <CodeBlock language="text">
{`setula/
├── src/                    # Backend source
│   ├── server.ts           # Entry point
│   ├── http.ts             # HTTP server with all API routes
│   ├── service.ts          # Core business logic (SetulaService)
│   ├── domain.ts           # TypeScript types
│   ├── state-machine.ts    # Payment status transition rules
│   ├── store.ts            # In-memory and JSON-file persistence
│   └── arc/                # Circle + Arc integration
├── web/app.ts              # Payment demo client (vanilla TS)
├── public/                 # Built browser assets
├── landing/                # Next.js landing page
│   ├── app/                # App Router pages and layout
│   ├── components/         # React components + docs
│   └── lib/                # Quote calculator utilities
├── tests/                  # Backend test suites
├── scripts/
│   └── run-golden-path.ts  # Arc Testnet E2E verification
├── docs/                   # Architecture diagrams
├── package.json
├── .env.example
└── .gitignore`}
      </CodeBlock>
    </>
  );
}
