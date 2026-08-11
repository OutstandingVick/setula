import { Callout } from "../../../components/docs/Callout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Steps, Step } from "../../../components/docs/Steps";

export default function QuickstartPage() {
  return (
    <>
      <h1>Quickstart</h1>

      <p>Follow these steps to run the live demo and complete a cross-border contractor payment on Arc Testnet.</p>

      <Callout variant="info">
        <p>The live demo is available at <a href="https://setula.vercel.app">setula.vercel.app</a>.</p>
      </Callout>

      <h2>Live demo walkthrough</h2>

      <Steps>
        <Step>
          <p><strong>Open the demo.</strong> The landing page shows a contractor invoice for INR 91,000 with a pre-filled sandbox quote of AED 4,000.</p>
        </Step>
        <Step>
          <p><strong>Select Start a payment.</strong> The payment page loads with the invoice and the AED-to-INR quote pre-configured.</p>
          <p><span className="docs-status-sim">SANDBOX QUOTE</span> — The exchange rate is fixed at 22.75 INR per AED. The quote is deterministic and does not use a live FX provider.</p>
        </Step>
        <Step>
          <p><strong>Click Approve payment.</strong> AED funding is simulated and the payment moves from <code>QUOTED</code> to <code>FUNDED</code>.</p>
          <p><span className="docs-status-sim">SIMULATED</span> — No real AED is collected. Funding confirmation is immediate.</p>
        </Step>
        <Step>
          <p><strong>Watch settlement execute.</strong> A real 0.01 USDC transfer executes on Arc Testnet through Circle developer-controlled wallets. The status moves through <code>SETTLEMENT_PENDING</code> → <code>SETTLED</code>.</p>
          <p><span className="docs-status-real">REAL</span> — This is a live on-chain transfer. Circle reports the transaction as <code>COMPLETE</code>.</p>
        </Step>
        <Step>
          <p><strong>Open the ArcScan link.</strong> When the settlement completes, an ArcScan link appears. Click it to view the confirmed transaction and transaction hash on the Arc testnet explorer.</p>
          <p><span className="docs-status-real">REAL</span> — The transaction hash is publicly verifiable on ArcScan.</p>
        </Step>
        <Step>
          <p><strong>Observe the payout status.</strong> After settlement, the payment enters <code>PAYOUT_PENDING</code>. The INR delivery is waiting for confirmation from the payout provider.</p>
          <p><span className="docs-status-sim">SIMULATED</span> — No real INR is transferred. The payout callback is initiated from the demo UI.</p>
        </Step>
        <Step>
          <p><strong>Click Confirm delivery.</strong> The simulated INR payout callback fires and the payment reaches <code>DELIVERED</code>.</p>
        </Step>
        <Step>
          <p><strong>View the receipt.</strong> The receipt page shows the payment reference, settlement amount, ArcScan link, and INR amount received — all linked to the original invoice.</p>
        </Step>
      </Steps>

      <h2>Expected payment states</h2>

      <CodeBlock>
        {`DRAFT → QUOTED → FUNDED → SETTLEMENT_PENDING → SETTLED → PAYOUT_PENDING → DELIVERED`}
      </CodeBlock>

      <table>
        <thead>
          <tr><th>State</th><th>Trigger</th><th>Proof</th></tr>
        </thead>
        <tbody>
          <tr><td><code>QUOTED</code></td><td>Quote generated from the invoice</td><td>Deterministic AED/INR calculation</td></tr>
          <tr><td><code>FUNDED</code></td><td>Simulated AED funding confirmation</td><td>Funding confirmation response</td></tr>
          <tr><td><code>SETTLEMENT_PENDING</code></td><td>Settlement initiated with Circle</td><td>Circle transaction ID</td></tr>
          <tr><td><code>SETTLED</code></td><td>Circle reports <code>COMPLETE</code></td><td>Transaction hash + ArcScan link</td></tr>
          <tr><td><code>PAYOUT_PENDING</code></td><td>Settlement completed, awaiting payout</td><td>Payout reference created</td></tr>
          <tr><td><code>DELIVERED</code></td><td>Payout callback confirms delivery</td><td>Invoice-linked receipt with all references</td></tr>
        </tbody>
      </table>

      <Callout variant="check">
        <p><strong>Verification:</strong> The same demo was run five consecutive times on the deployed environment and reached <code>DELIVERED</code> every time. See <a href="/docs/deployment">Deployment</a> for validation records.</p>
      </Callout>
    </>
  );
}
