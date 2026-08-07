import { Callout } from "../../../components/docs/Callout";
import { CodeBlock } from "../../../components/docs/CodeBlock";

export default function ApiPage() {
  return (
    <>
      <h1>API &amp; State Machine</h1>

      <p>
        The Setula backend exposes a REST API over raw <code>node:http</code>.
        Every mutation endpoint requires an <code>Idempotency-Key</code> header.
        The payout callback additionally requires an <code>X-Payout-Callback-Secret</code> header.
      </p>

      <h2>API routes</h2>

      <table>
        <thead>
          <tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr><td><code>GET</code></td><td><code>/health</code></td><td>Health check</td></tr>
          <tr><td><code>POST</code></td><td><code>/api/beneficiaries</code></td><td>Create the India beneficiary</td></tr>
          <tr><td><code>POST</code></td><td><code>/api/invoices</code></td><td>Create the INR invoice</td></tr>
          <tr><td><code>POST</code></td><td><code>/api/invoices/:invoiceId/quotes</code></td><td>Generate the sandbox AED/INR quote</td></tr>
          <tr><td><code>POST</code></td><td><code>/api/payments</code></td><td>Create the payment intent in <code>QUOTED</code></td></tr>
          <tr><td><code>POST</code></td><td><code>/api/payments/:paymentId/funding-confirmations</code></td><td>Confirm simulated AED funding</td></tr>
          <tr><td><code>POST</code></td><td><code>/api/payments/:paymentId/settlements</code></td><td>Execute the Arc USDC transfer</td></tr>
          <tr><td><code>POST</code></td><td><code>/api/payout-callbacks</code></td><td>Simulate INR payout delivery or rejection</td></tr>
          <tr><td><code>POST</code></td><td><code>/api/payments/:paymentId/demo-payouts</code></td><td>Demo bridge to the simulated payout callback</td></tr>
          <tr><td><code>GET</code></td><td><code>/api/payments/:paymentId</code></td><td>Read payment and linked objects with timeline</td></tr>
          <tr><td><code>GET</code></td><td><code>/api/receipts/:receiptId</code></td><td>Read the invoice-linked receipt</td></tr>
        </tbody>
      </table>

      <Callout variant="info">
        <p>Amounts ending in <code>Minor</code> are integer minor units: <strong>paise</strong> for INR and <strong>fils</strong> for AED. The sandbox rate is fixed at <strong>22.75 INR/AED</strong>. The demo invoice of INR 91,000 maps to a real <strong>0.01 USDC</strong> Arc Testnet settlement.</p>
      </Callout>

      <h2>Data model</h2>

      <p>The backend manages seven entity types:</p>

      <table>
        <thead>
          <tr><th>Entity</th><th>Key fields</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Beneficiary</strong></td><td><code>id</code>, <code>name</code>, <code>email</code>, <code>bankAccountLast4</code></td></tr>
          <tr><td><strong>Invoice</strong></td><td><code>id</code>, <code>beneficiaryId</code>, <code>reference</code>, <code>amountInrMinor</code></td></tr>
          <tr><td><strong>Quote</strong></td><td><code>id</code>, <code>invoiceId</code>, <code>amountAedMinor</code>, <code>usdcAmount</code>, <code>rateInrPerAed</code></td></tr>
          <tr><td><strong>Payment</strong></td><td><code>id</code>, <code>status</code>, <code>timeline</code>, <code>settlementId</code>, <code>payoutId</code>, <code>receiptId</code></td></tr>
          <tr><td><strong>Settlement</strong></td><td><code>id</code>, <code>circleTransactionId</code>, <code>transactionHash</code>, <code>arcScanUrl</code></td></tr>
          <tr><td><strong>Payout</strong></td><td><code>id</code>, <code>reference</code>, <code>status</code> (<code>DELIVERED</code> / <code>REJECTED</code>)</td></tr>
          <tr><td><strong>Receipt</strong></td><td><code>id</code>, <code>paymentId</code>, <code>invoiceId</code>, <code>transactionHash</code>, <code>arcScanUrl</code></td></tr>
        </tbody>
      </table>

      <h2>Payment state machine</h2>

      <p>Every payment follows strict state-transition rules. Invalid transitions produce a <code>409 Conflict</code> response.</p>

      <CodeBlock language="text">
{`DRAFT
  └──→ QUOTED
         └──→ FUNDED
                └──→ SETTLEMENT_PENDING
                       ├──→ SETTLED             (Circle status COMPLETE)
                       │     └──→ PAYOUT_PENDING
                       │            ├──→ DELIVERED        (payout callback)
                       │            └──→ PAYOUT_REJECTED
                       └──→ SETTLEMENT_FAILED   (insufficient balance)`}
      </CodeBlock>

      <h3>Transition rules</h3>

      <table>
        <thead>
          <tr><th>From</th><th>To</th><th>Condition</th></tr>
        </thead>
        <tbody>
          <tr><td><code>SETTLEMENT_PENDING</code></td><td><code>SETTLED</code></td><td>Circle reports <code>COMPLETE</code> with transaction hash</td></tr>
          <tr><td><code>SETTLEMENT_PENDING</code></td><td><code>SETTLEMENT_FAILED</code></td><td>Insufficient sender balance or Circle transfer error</td></tr>
          <tr><td><code>PAYOUT_PENDING</code></td><td><code>DELIVERED</code></td><td>Authenticated payout callback with <code>DELIVERED</code> status</td></tr>
          <tr><td><code>PAYOUT_PENDING</code></td><td><code>PAYOUT_REJECTED</code></td><td>Authenticated payout callback with <code>REJECTED</code> status</td></tr>
          <tr><td><code>SETTLEMENT_FAILED</code></td><td><code>REFUND_PENDING</code></td><td>Operator-initiated refund flow (future)</td></tr>
          <tr><td><code>PAYOUT_REJECTED</code></td><td><code>REFUND_PENDING</code></td><td>Operator-initiated refund flow (future)</td></tr>
        </tbody>
      </table>

      <Callout variant="danger">
        <p><strong>Failed settlements produce no ArcScan link.</strong> The <code>SETTLEMENT_FAILED</code> state has no <code>transactionHash</code> or <code>arcScanUrl</code>. The payout callback is rejected with <code>409 Conflict</code>. The recipient balance is never changed.</p>
      </Callout>

      <h2>Idempotency</h2>

      <p>
        Every <code>POST</code> endpoint requires a unique <code>Idempotency-Key</code> header.
        Repeating the same request with the same key returns the original result without side effects.
      </p>

      <p>Key guarantees:</p>

      <ul>
        <li><strong>Settlement:</strong> Duplicate settlement submissions reuse the existing Circle transaction. The transaction hash is preserved and the recipient balance does not change (delta <code>0</code>).</li>
        <li><strong>Funding:</strong> Duplicate funding confirmations return the already-confirmed payment.</li>
        <li><strong>Payout:</strong> Duplicate payout callbacks return the already-recorded result.</li>
      </ul>

      <Callout variant="check">
        <p><strong>Validated:</strong> Duplicate-prevention was tested in the deployed environment. The recipient balance increased by exactly 0.01 USDC on the first settlement and 0 on all subsequent attempts.</p>
      </Callout>
    </>
  );
}
