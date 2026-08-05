export function SettlementVisual() {
  return (
    <div className="settlement-visual">
      <div className="settlement-fallback" aria-label="Payment route: AED funding, USDC settlement on Arc, then INR payout">
        <span><strong>AED</strong><small>Agency funds</small></span>
        <i aria-hidden="true" />
        <span className="settlement-core"><strong>USDC</strong><small>Settles on Arc</small></span>
        <i aria-hidden="true" />
        <span><strong>INR</strong><small>Contractor receives</small></span>
      </div>
      <p className="visual-hint">Change the AED quote to trace value through the settlement route.</p>
    </div>
  );
}
