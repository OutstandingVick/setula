import { Callout } from "../../../components/docs/Callout";
import { CodeBlock } from "../../../components/docs/CodeBlock";

export default function DeploymentPage() {
  return (
    <>
      <h1>Deployment</h1>

      <h2>Production URLs</h2>

      <table>
        <thead>
          <tr><th>Service</th><th>URL</th></tr>
        </thead>
        <tbody>
          <tr><td>Frontend</td><td><a href="https://setula-app.vercel.app">setula-app.vercel.app</a></td></tr>
          <tr><td>Backend</td><td><a href="https://ideal-alignment-production-912d.up.railway.app/health">ideal-alignment-production-912d.up.railway.app</a></td></tr>
          <tr><td>ArcScan proof</td><td><a href="https://testnet.arcscan.app/tx/0xd033f753ccae0b55585a94a754657a6154f2a6690748b55adbdbb469e2b2afec">0xd033…b2afec</a></td></tr>
        </tbody>
      </table>

      <h2>Hosting platforms</h2>

      <table>
        <thead>
          <tr><th>Layer</th><th>Platform</th></tr>
        </thead>
        <tbody>
          <tr><td>Frontend</td><td>Vercel</td></tr>
          <tr><td>Backend</td><td>Railway</td></tr>
        </tbody>
      </table>

      <h2>Build and start commands</h2>

      <table>
        <thead>
          <tr><th>Platform</th><th>Build command</th><th>Start command</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Railway (backend)</td>
            <td><code>npm install &amp;&amp; npm run build:web</code></td>
            <td><code>npm run start:prod</code></td>
          </tr>
          <tr>
            <td>Vercel (frontend)</td>
            <td><code>npm run build:landing</code></td>
            <td>Next.js default</td>
          </tr>
        </tbody>
      </table>

      <h2>Environment variables</h2>

      <p>Values are intentionally omitted.</p>

      <h3>Backend (Railway)</h3>

      <CodeBlock language="env">
{`CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
CIRCLE_WALLET_A_ID=
CIRCLE_WALLET_A_ADDRESS=
CIRCLE_WALLET_B_ID=
CIRCLE_WALLET_B_ADDRESS=
CIRCLE_BLOCKCHAIN=ARC-TESTNET
CIRCLE_USDC_TOKEN_ID=
PAYOUT_CALLBACK_SECRET=
HOST=0.0.0.0
DATA_FILE=.setula-data.json
POLL_INTERVAL_MS=2000
POLL_TIMEOUT_MS=180000
CORS_ORIGIN=...`}
      </CodeBlock>

      <h3>Frontend (Vercel)</h3>

      <CodeBlock language="env">
        {`DEMO_BACKEND_ORIGIN=https://ideal-alignment-production-912d.up.railway.app`}
      </CodeBlock>

      <Callout variant="info">
        <p>All Circle credentials and the payout callback secret are server-side only. The Vercel frontend receives only <code>DEMO_BACKEND_ORIGIN</code>.</p>
      </Callout>

      <h2>CORS configuration</h2>

      <p>The backend sets CORS headers for origins listed in <code>CORS_ORIGIN</code> (comma-separated):</p>

      <ul>
        <li><code>http://localhost:3001</code> — landing page dev</li>
        <li><code>http://localhost:4000</code> — backend dev</li>
        <li><code>https://setula-app.vercel.app</code> — production</li>
      </ul>

      <p>The Next.js proxy makes CORS unnecessary in the normal browser flow — all requests are same-origin.</p>

      <h2>Validation evidence</h2>

      <p>The deployed environment was validated with a full golden-path run:</p>

      <table>
        <thead>
          <tr><th>Check</th><th>Result</th></tr>
        </thead>
        <tbody>
          <tr><td>Five consecutive deployed runs</td><td>All passed: <code>DRAFT → DELIVERED</code></td></tr>
          <tr><td>Circle transaction status</td><td><code>COMPLETE</code></td></tr>
          <tr><td>ArcScan HTTP status</td><td>200</td></tr>
          <tr><td>Duplicate settlement protection</td><td>Passed (recipient delta 0)</td></tr>
          <tr><td>Insufficient-balance failure</td><td>Passed (<code>SETTLEMENT_FAILED</code>, no ArcScan link)</td></tr>
          <tr><td>Invalid payout callback</td><td>Rejected</td></tr>
          <tr><td>Desktop QA (1440 px)</td><td>No overflow, values readable</td></tr>
          <tr><td>Mobile QA (390 px)</td><td>No overflow, navigation adapted</td></tr>
          <tr><td>Secret scan</td><td>Passed — no credentials in tracked files or client assets</td></tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr><th>Field</th><th>Value</th></tr>
        </thead>
        <tbody>
          <tr><td>Payment reference</td><td><code>INV-SETULA-775E5BEC</code></td></tr>
          <tr><td>Amount settled</td><td>0.01 USDC</td></tr>
          <tr><td>Transaction hash</td><td><code>0xd033f753ccae0b55585a94a754657a6154f2a6690748b55adbdbb469e2b2afec</code></td></tr>
          <tr><td>Receipt ID</td><td><code>1aabd12a-26c0-4f7e-98c6-080b2c07a952</code></td></tr>
          <tr><td>References match</td><td>Yes</td></tr>
        </tbody>
      </table>

      <Callout variant="check">
        <p>Verdict: <strong>STABLE_DEPLOYMENT_READY</strong>. See the <a href="https://github.com/OutstandingVick/setula/blob/main/STABLE_DEPLOYMENT_VALIDATION.md">full validation record</a>.</p>
      </Callout>
    </>
  );
}
