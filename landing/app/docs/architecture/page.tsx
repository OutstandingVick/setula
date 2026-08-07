import { Callout } from "../../../components/docs/Callout";
import { CodeBlock } from "../../../components/docs/CodeBlock";

export default function ArchitecturePage() {
  return (
    <>
      <h1>Architecture</h1>

      <p>
        Setula uses a two-tier deployment architecture with a Next.js frontend on Vercel
        and a Node.js backend on Railway. The frontend proxies all API and payment-demo
        requests to the backend through Next.js rewrites, keeping the browser on a single origin.
      </p>

      <h2>Deployment architecture</h2>

      <CodeBlock language="text">
{`Browser ──→ Vercel (Next.js landing page)
              │  /pay/*  ──→ Railway backend (Node.js HTTP server)
              │  /api/*  ──→ Railway backend
              │
              └── Next.js rewrites proxy to DEMO_BACKEND_ORIGIN`}
      </CodeBlock>

      <h2>Data flow</h2>

      <CodeBlock language="text">
{`Next.js frontend → Setula backend → Circle Wallets → Arc Testnet → simulated payout provider`}
      </CodeBlock>

      <h2>Frontend (Vercel)</h2>

      <ul>
        <li><strong>Framework:</strong> Next.js 16 (App Router, Turbopack)</li>
        <li><strong>UI:</strong> React 19 with CSS custom properties</li>
        <li><strong>Routing:</strong> Landing page at <code>/</code>, payment demo proxied at <code>/pay</code></li>
        <li><strong>API proxy:</strong> Next.js <code>rewrites()</code> forwards <code>/api/*</code> and <code>/pay/*</code> to the backend</li>
        <li><strong>Deployment:</strong> Vercel, with <code>DEMO_BACKEND_ORIGIN</code> as the only sensitive env var</li>
      </ul>

      <h2>Backend (Railway)</h2>

      <ul>
        <li><strong>Runtime:</strong> Node.js 22 with TypeScript (run via <code>tsx</code>)</li>
        <li><strong>HTTP server:</strong> Raw <code>node:http</code> — no Express or framework</li>
        <li><strong>Validation:</strong> Zod 4 for request schemas and env parsing</li>
        <li><strong>Persistence:</strong> Atomic JSON file (<code>.setula-data.json</code>)</li>
        <li><strong>State machine:</strong> Enforces valid payment status transitions</li>
        <li><strong>Idempotency:</strong> All POST endpoints require an <code>Idempotency-Key</code> header</li>
        <li><strong>CORS:</strong> Configurable via <code>CORS_ORIGIN</code> env var; not needed in normal flow due to the proxy</li>
        <li><strong>Deployment:</strong> Railway, with all Circle credentials and secrets server-side</li>
      </ul>

      <h2>Settlement layer</h2>

      <ul>
        <li><strong>Circle SDK:</strong> <code>@circle-fin/developer-controlled-wallets</code> v10.8</li>
        <li><strong>Wallet type:</strong> Developer-controlled EOAs on Arc Testnet</li>
        <li><strong>Transfer:</strong> USDC transfer from sender wallet to recipient wallet</li>
        <li><strong>Polling:</strong> Circle transaction status polled until <code>COMPLETE</code></li>
        <li><strong>Evidence:</strong> Transaction hash stored and linked to ArcScan</li>
        <li><strong>Balance check:</strong> Sender balance verified before transfer submission</li>
      </ul>

      <h2>Simulated fiat rails</h2>

      <ul>
        <li><strong>AED funding:</strong> Simulated — no real fiat collected</li>
        <li><strong>Quote:</strong> Fixed sandbox rate of 22.75 INR/AED</li>
        <li><strong>INR payout:</strong> Simulated callback — no real INR bank transfer</li>
      </ul>

      <Callout variant="warning">
        <p><strong>Production note:</strong> Licensed UAE funding and India payout partners would replace the simulated fiat rails in production. KYC/KYB controls and legal approval would be required in both jurisdictions.</p>
      </Callout>

      <h2>Diagram</h2>

      <p>
        <a href="/docs/setula-architecture.svg">
          <img src="/docs/setula-architecture.svg" alt="Setula architecture diagram" style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid var(--line)" }} />
        </a>
      </p>

      <h2>Security model</h2>

      <ul>
        <li>Circle API keys and entity secret are stored only on Railway (server-side env vars).</li>
        <li>The payout callback secret (<code>PAYOUT_CALLBACK_SECRET</code>) is shared only between the backend and the payout provider.</li>
        <li>The Vercel frontend receives only <code>DEMO_BACKEND_ORIGIN</code> — the backend URL.</li>
        <li>No personal data or invoice details are written to the blockchain.</li>
        <li>The Arc transaction hash is the only on-chain artifact — used solely for settlement proof.</li>
        <li>Fiat payout confirmation is independent of chain settlement — a callback with a shared secret is required for <code>DELIVERED</code>.</li>
      </ul>

      <h2>Technology stack</h2>

      <table>
        <thead>
          <tr><th>Category</th><th>Technology</th></tr>
        </thead>
        <tbody>
          <tr><td>Language</td><td>TypeScript 7</td></tr>
          <tr><td>Runtime</td><td>Node.js 22</td></tr>
          <tr><td>Frontend</td><td>Next.js 16 (App Router), React 19, CSS</td></tr>
          <tr><td>Backend HTTP</td><td><code>node:http</code> (no framework)</td></tr>
          <tr><td>Validation</td><td>Zod 4</td></tr>
          <tr><td>Build (browser)</td><td>esbuild</td></tr>
          <tr><td>Runtime (TS)</td><td>tsx</td></tr>
          <tr><td>Blockchain SDK</td><td>Circle Developer-Controlled Wallets 10.8</td></tr>
          <tr><td>Network</td><td>Arc Testnet</td></tr>
          <tr><td>Settlement asset</td><td>USDC</td></tr>
          <tr><td>Hosting (frontend)</td><td>Vercel</td></tr>
          <tr><td>Hosting (backend)</td><td>Railway</td></tr>
          <tr><td>Testing</td><td>Vitest 4 (16 tests)</td></tr>
        </tbody>
      </table>
    </>
  );
}
