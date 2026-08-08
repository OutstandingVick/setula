import { Callout } from "../../../components/docs/Callout";
import { CodeBlock } from "../../../components/docs/CodeBlock";

export default function OverviewPage() {
  return (
    <>
      <h1>Overview</h1>

      <p>
        Setula helps UAE agencies pay overseas contractors in local currency, with USDC settling on Arc under the hood.
      </p>

      <p>
        <a href="https://setula-app.vercel.app"><strong>Live demo</strong></a>
        {" · "}
        <a href="https://github.com/OutstandingVick/setula"><strong>GitHub repository</strong></a>
        {" · "}
        <a href="https://testnet.arcscan.app/tx/0xd033f753ccae0b55585a94a754657a6154f2a6690748b55adbdbb469e2b2afec"><strong>ArcScan proof</strong></a>
      </p>

      <h2>The problem</h2>

      <p>Cross-border contractor payments are fragile:</p>

      <ul>
        <li>The recipient cannot be certain what amount will arrive after FX and fees.</li>
        <li>Invoices and payment records live in separate systems.</li>
        <li>Payment stages are opaque — the sender does not know whether settlement completed, whether the payout reached the recipient, or where the failure occurred.</li>
        <li>Failures require manual investigation across payment partners, bank statements, and ledger entries.</li>
      </ul>

      <h2>The solution</h2>

      <p>Setula turns a cross-border contractor payment into a single tracked journey:</p>

      <CodeBlock language="flow">
        {`AED quote → AED funding → USDC settlement on Arc → INR payout → invoice-linked receipt`}
      </CodeBlock>

      <p>
        The finance user sees only the AED amount they approve and the INR amount the contractor receives.
        USDC settlement is handled by the payment partner infrastructure — Circle wallets transfer value on
        Arc Testnet, and Setula surfaces the Arc transaction as machine-verifiable proof.
      </p>

      <h2>Primary user</h2>

      <p>A finance manager at a small UAE agency paying an overseas contractor.</p>

      <h2>Hackathon scope</h2>

      <ul>
        <li>One UAE agency</li>
        <li>One India-based contractor</li>
        <li>One invoice (INR 91,000)</li>
        <li>Sandbox AED-to-INR quote (fixed 22.75 INR/AED)</li>
        <li>Simulated AED funding</li>
        <li>Real USDC settlement on Arc Testnet (0.01 USDC)</li>
        <li>Simulated INR bank payout</li>
        <li>Invoice-linked payment tracking and receipt</li>
        <li>Duplicate and failure protection</li>
      </ul>

      <h2>Golden path</h2>

      <p>The happy-path journey follows seven payment states:</p>

      <CodeBlock>
        {`DRAFT → QUOTED → FUNDED → SETTLEMENT_PENDING → SETTLED → PAYOUT_PENDING → DELIVERED`}
      </CodeBlock>

      <ol>
        <li>User enters contractor and invoice details.</li>
        <li>Setula generates a sandbox AED-to-INR quote.</li>
        <li>User approves the payment.</li>
        <li>AED funding is simulated.</li>
        <li>A real USDC transfer executes on Arc Testnet.</li>
        <li>INR payout is simulated.</li>
        <li>Setula shows the payment as delivered.</li>
        <li>User views the ArcScan transaction and receipt.</li>
      </ol>

      <h2>What is real and simulated</h2>

      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Quote generation</td><td><span className="docs-status-sim">SANDBOX</span> (fixed 22.75 INR/AED rate)</td></tr>
          <tr><td>AED collection</td><td><span className="docs-status-sim">SIMULATED</span></td></tr>
          <tr><td>Circle wallet settlement</td><td><span className="docs-status-real">REAL</span></td></tr>
          <tr><td>USDC transfer on Arc Testnet</td><td><span className="docs-status-real">REAL</span></td></tr>
          <tr><td>Arc transaction proof</td><td><span className="docs-status-real">REAL</span></td></tr>
          <tr><td>INR bank payout</td><td><span className="docs-status-sim">SIMULATED</span></td></tr>
          <tr><td>Invoice and receipt reconciliation</td><td><span className="docs-status-real">REAL</span> (application logic)</td></tr>
        </tbody>
      </table>

      <Callout variant="info">
        <p><strong>AED funding and INR delivery are simulated demo flows.</strong> USDC settlement on Arc Testnet is a real on-chain transfer. The browser never receives Circle credentials or the payout callback secret.</p>
      </Callout>

      <h2>Architecture diagram</h2>

      <p>
        <a href="/docs/setula-architecture.svg">
          <img src="/docs/setula-architecture.svg" alt="Setula architecture diagram" style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid var(--line)" }} />
        </a>
      </p>

      <h2>Why Arc</h2>

      <ul>
        <li><strong>USDC settlement</strong> — a stable, widely-supported digital dollar.</li>
        <li><strong>Deterministic transaction confirmation</strong> — the settlement outcome is unambiguous.</li>
        <li><strong>Predictable USDC-denominated execution cost</strong> — no surprise fees during transfer.</li>
        <li><strong>Machine-verifiable settlement evidence</strong> — every transfer produces a transaction hash retrievable on ArcScan.</li>
        <li><strong>Reconciliation through transaction hashes</strong> — the hash uniquely links the payment record to the on-chain settlement.</li>
      </ul>

      <Callout variant="warning">
        <p>Arc does not perform AED collection or INR delivery. Setula handles those legs through simulated funding and payout in this prototype.</p>
      </Callout>

      <h2>Not in scope</h2>

      <p>The hackathon MVP intentionally excludes:</p>

      <ul>
        <li>Batch payments or multiple contractors</li>
        <li>Live AED collection or INR payout</li>
        <li>KYC / KYB or regulatory compliance</li>
        <li>CCTP, gateway, or paymaster features</li>
        <li>Admin dashboard or analytics</li>
      </ul>
    </>
  );
}
