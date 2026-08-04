"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const SettlementScene = dynamic(
  () => import("./SettlementScene").then((module) => module.SettlementScene),
  { ssr: false },
);

function canEnhanceSettlement(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(max-width: 767px)").matches) return false;
  const constrainedNavigator = navigator as Navigator & { deviceMemory?: number };
  if ((navigator.hardwareConcurrency || 8) <= 4) return false;
  if ((constrainedNavigator.deviceMemory ?? 8) <= 4) return false;
  const probe = document.createElement("canvas");
  return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
}

export function SettlementVisual() {
  const [enhanced, setEnhanced] = useState(false);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    setEnhanced(canEnhanceSettlement());
  }, []);

  return (
    <div className={`settlement-visual${ready ? " is-enhanced" : ""}`}>
      <div className="settlement-fallback" aria-label="Payment route: AED funding, USDC settlement on Arc, then INR payout">
        <span><strong>AED</strong><small>Agency funds</small></span>
        <i aria-hidden="true" />
        <span className="settlement-core"><strong>USDC</strong><small>Settles on Arc</small></span>
        <i aria-hidden="true" />
        <span><strong>INR</strong><small>Contractor receives</small></span>
      </div>
      {enhanced ? <SettlementScene onReady={handleReady} /> : null}
      <p className="visual-hint">Change the AED quote to trace value through the settlement route.</p>
    </div>
  );
}
