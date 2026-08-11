import type { Metadata } from "next";
import { Callout } from "../../../components/docs/Callout";

export const metadata: Metadata = {
  title: "Roadmap — Setula Documentation",
  description: "Setula's path from a validated Arc Testnet prototype to a production-ready contractor payment product.",
};

const phases = [
  {
    step: "Phase 01",
    status: "now",
    label: "Validated MVP",
    title: "Prove the payment journey",
    description:
      "Demonstrate one exact AED-to-INR contractor payment with real USDC settlement and complete reconciliation evidence.",
    items: [
      "One UAE agency, one India-based contractor, and one invoice",
      "Sandbox AED-to-INR quote with an exact recipient amount",
      "Real 0.01 USDC settlement on Arc Testnet through Circle wallets",
      "Simulated AED funding and INR payout",
      "Idempotency, failure handling, ArcScan proof, and an invoice-linked receipt",
    ],
  },
  {
    step: "Phase 02",
    status: "later",
    label: "Next",
    title: "Prepare a controlled pilot",
    description:
      "Turn the prototype into an operable pilot while preserving the same traceable payment state machine.",
    items: [
      "Business authentication, roles, and approval controls",
      "Persistent payment ledger, audit trail, and operational monitoring",
      "KYC/KYB and sanctions-screening integrations",
      "Secure provider webhooks, retry handling, and reconciliation tooling",
      "Pilot support procedures for rejected payouts, refunds, and incident recovery",
    ],
  },
  {
    step: "Phase 03",
    status: "later",
    label: "Then",
    title: "Activate the live corridor",
    description:
      "Replace the simulated fiat legs with regulated partners and validate the complete AED-to-INR flow with real money.",
    items: [
      "Live AED collection through an approved UAE payment partner",
      "Live INR contractor payout through an approved India payout partner",
      "Live FX and fee quotes with expiry and rate-lock behaviour",
      "Production settlement limits, treasury controls, and balance management",
      "End-to-end reconciliation, reporting, and customer support readiness",
    ],
  },
  {
    step: "Phase 04",
    status: "future",
    label: "Future",
    title: "Scale only after reliability",
    description:
      "Expand the product after the first corridor meets reliability, compliance, and unit-economics targets.",
    items: [
      "Multiple beneficiaries and reusable contractor profiles",
      "Batch contractor payments and approval workflows",
      "Additional business payment corridors",
      "Payment reporting, exports, and accounting integrations",
      "A partner API for programmatic payment initiation and status tracking",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <>
      <h1>Roadmap</h1>

      <p>
        Setula is currently a focused hackathon prototype. The roadmap below shows a gated path from
        technical proof to a controlled pilot, a live payment corridor, and responsible expansion.
      </p>

      <Callout variant="info">
        <p>
          <strong>Current product scope remains locked.</strong> Everything after Phase 01 is planned work,
          not functionality available in the present demo.
        </p>
      </Callout>

      <div className="docs-roadmap">
        {phases.map((phase) => (
          <section className="docs-roadmap-phase" data-status={phase.status} key={phase.step}>
            <div className="docs-roadmap-meta">
              <span className="docs-roadmap-step">{phase.step}</span>
              <span className="docs-roadmap-status">{phase.label}</span>
            </div>
            <div className="docs-roadmap-copy">
              <h2>{phase.title}</h2>
              <p>{phase.description}</p>
              <ul>
                {phase.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <h2>Release gates</h2>

      <p>Setula advances only when the previous phase satisfies its reliability and compliance gate.</p>

      <table>
        <thead>
          <tr>
            <th>Transition</th>
            <th>Required evidence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>MVP → Pilot</td>
            <td>Repeatable settlements, no duplicate transfers, complete references, and tested recovery paths</td>
          </tr>
          <tr>
            <td>Pilot → Live corridor</td>
            <td>Approved partners, compliance sign-off, operational monitoring, and production security review</td>
          </tr>
          <tr>
            <td>Live corridor → Scale</td>
            <td>Reliability targets, sustainable unit economics, support readiness, and successful reconciliation</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="warning">
        <p>
          Dates are intentionally omitted. Delivery depends on partner approvals, regulatory requirements,
          security reviews, and evidence that the current corridor is reliable.
        </p>
      </Callout>
    </>
  );
}
