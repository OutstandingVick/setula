const transactionHash = "0x347ac773f6d280952fb84ad41347e0e8f543bc93262465904e0e55db022d4900";
const arcScanUrl = `https://testnet.arcscan.app/tx/${transactionHash}`;
const paymentReference = "INV-SETULA-671C5954";

const proofStates = ["DRAFT", "QUOTED", "FUNDED", "SETTLEMENT_PENDING", "SETTLED", "PAYOUT_PENDING", "DELIVERED"] as const;

export function ProductProof() {
  return (
    <>
      <section className="section-shell product-proof" id="why-setula" aria-labelledby="why-setula-title">
        <div className="section-heading">
          <p className="eyebrow">Validated product proof</p>
          <h2 id="why-setula-title">From invoice to reconciled receipt.</h2>
          <p>Real Arc Testnet evidence sits beside simulated funding and payout status, all tied to one payment reference.</p>
        </div>

        <div className="dashboard-preview" aria-label="Setula payment record using validated Arc Testnet data">
          <aside className="preview-sidebar">
            <span className="preview-brand"><i aria-hidden="true" /> Setula</span>
            <span className="preview-nav active">Payment details</span>
            <span className="preview-nav">Receipt</span>
            <small>Hackathon sandbox</small>
          </aside>
          <div className="preview-content">
            <div className="preview-topline">
              <div><span>Payment reference</span><strong>{paymentReference}</strong></div>
              <span className="delivered-badge">Delivered</span>
            </div>

            <div className="preview-metrics">
              <article><span>Sandbox AED quote</span><strong>Exact INR amount</strong><small>1 AED = 22.75 INR</small></article>
              <article><span>Arc settlement</span><strong>0.01 USDC</strong><small>Circle status · COMPLETE</small></article>
              <article><span>INR payout</span><strong>Delivered</strong><small>Authenticated simulated callback</small></article>
            </div>

            <div className="state-track" aria-label={`Observed payment states: ${proofStates.join(", ")}`}>
              {proofStates.map((state, index) => (
                <span key={state} title={state}><i aria-hidden="true">✓</i>{index === 0 || index === 4 || index === 6 ? state.replaceAll("_", " ") : null}</span>
              ))}
            </div>

            <div className="evidence-row">
              <div><span>ArcScan transaction evidence</span><code>{transactionHash.slice(0, 18)}…{transactionHash.slice(-10)}</code></div>
              <a href={arcScanUrl}>View on ArcScan <span aria-hidden="true">↗</span></a>
            </div>

            <div className="receipt-strip">
              <div><span>Invoice</span><strong>{paymentReference}</strong></div>
              <span aria-hidden="true">=</span>
              <div><span>Payment</span><strong>{paymentReference}</strong></div>
              <span aria-hidden="true">=</span>
              <div><span>Receipt</span><strong>{paymentReference}</strong></div>
            </div>
          </div>
        </div>
        <p className="proof-disclosure">Validated 3 August 2026 on Arc Testnet. The public hash and ArcScan link are real; AED funding and INR payout are simulated.</p>
      </section>

      <section className="section-shell recovery-section" aria-labelledby="recovery-title">
        <div className="section-heading">
          <p className="eyebrow">Failure recovery</p>
          <h2 id="recovery-title">What happens when the payout fails?</h2>
          <p>A confirmed Arc settlement remains confirmed, while contractor delivery remains explicitly incomplete.</p>
        </div>
        <div className="recovery-grid">
          <div className="recovery-flow" aria-label="Settlement succeeded, payout rejected, refund pending recovery path">
            <div className="recovery-state state-success"><span>01</span><strong>SETTLED</strong><small>Arc transfer succeeded</small></div>
            <i aria-hidden="true">→</i>
            <div className="recovery-state state-failed"><span>02</span><strong>PAYOUT_REJECTED</strong><small>Local delivery failed</small></div>
            <i aria-hidden="true">→</i>
            <div className="recovery-state"><span>03</span><strong>REFUND_PENDING</strong><small>Controlled recovery state</small></div>
          </div>
          <aside className="recovery-rules">
            <p className="future-label">Safety rules</p>
            <ul>
              <li><span>Settlement</span><strong>Remains attached to the original transaction hash</strong></li>
              <li><span>Delivery</span><strong>Never advances to DELIVERED without a valid callback</strong></li>
              <li><span>Retry</span><strong>Cannot create a second Arc transfer for the payment</strong></li>
              <li><span>Recovery</span><strong>Correction or refund requires a controlled follow-up</strong></li>
            </ul>
          </aside>
        </div>
        <p className="proof-disclosure">The MVP models rejection and refund states. It does not automate live local-payout correction or fiat refunds.</p>
      </section>
    </>
  );
}
