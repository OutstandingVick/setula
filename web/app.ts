import { z } from "zod";

const paymentStatusSchema = z.enum([
  "DRAFT",
  "QUOTED",
  "FUNDED",
  "SETTLEMENT_PENDING",
  "SETTLED",
  "PAYOUT_PENDING",
  "DELIVERED",
  "SETTLEMENT_FAILED",
  "PAYOUT_REJECTED",
  "REFUND_PENDING",
  "REFUNDED",
]);

const timelineEntrySchema = z.object({
  status: paymentStatusSchema,
  at: z.string(),
  detail: z.string().optional(),
});

const beneficiarySchema = z.object({
  id: z.string().uuid(),
  reference: z.string(),
  name: z.string(),
  email: z.string(),
  bankAccountLast4: z.string(),
  createdAt: z.string(),
});

const invoiceSchema = z.object({
  id: z.string().uuid(),
  beneficiaryId: z.string().uuid(),
  reference: z.string(),
  amountInrMinor: z.number().int().positive(),
  description: z.string(),
  createdAt: z.string(),
});

const quoteSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  reference: z.string(),
  amountInrMinor: z.number().int().positive(),
  rateInrPerAed: z.string(),
  amountAedMinor: z.number().int().positive(),
  usdcAmount: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
});

const paymentSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  quoteId: z.string().uuid(),
  reference: z.string(),
  status: paymentStatusSchema,
  timeline: z.array(timelineEntrySchema),
  settlementId: z.string().uuid().optional(),
  payoutId: z.string().uuid().optional(),
  receiptId: z.string().uuid().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const settlementSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  reference: z.string(),
  amountUsdc: z.string(),
  status: z.enum(["PENDING", "COMPLETE", "FAILED"]),
  circleTransactionId: z.string().optional(),
  transactionHash: z.string().optional(),
  arcScanUrl: z.string().url().optional(),
  failureCode: z.string().optional(),
  failureMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const payoutSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  reference: z.string(),
  amountInrMinor: z.number().int().positive(),
  status: z.enum(["PENDING", "DELIVERED", "REJECTED"]),
  callbackId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const receiptSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  settlementId: z.string().uuid(),
  payoutId: z.string().uuid(),
  reference: z.string(),
  amountInrMinor: z.number().int().positive(),
  amountUsdc: z.string(),
  transactionHash: z.string(),
  arcScanUrl: z.string().url(),
  deliveredAt: z.string(),
});

const aggregateSchema = z.object({
  payment: paymentSchema,
  invoice: invoiceSchema,
  quote: quoteSchema,
  settlement: settlementSchema.optional(),
  payout: payoutSchema.optional(),
  receipt: receiptSchema.optional(),
});

const payoutResultSchema = z.object({
  payment: paymentSchema,
  payout: payoutSchema,
  receipt: receiptSchema.optional(),
});

type Beneficiary = z.infer<typeof beneficiarySchema>;
type Invoice = z.infer<typeof invoiceSchema>;
type Quote = z.infer<typeof quoteSchema>;
type Payment = z.infer<typeof paymentSchema>;
type Aggregate = z.infer<typeof aggregateSchema>;
type PaymentStatus = z.infer<typeof paymentStatusSchema>;

type View = "details" | "quote" | "progress" | "receipt" | "failure";

type Model = {
  view: View;
  beneficiary?: Beneficiary | undefined;
  invoice?: Invoice | undefined;
  quote?: Quote | undefined;
  payment?: Payment | undefined;
  aggregate?: Aggregate | undefined;
  error?: string | undefined;
  busy?: string | undefined;
};

type LandingPrefill = {
  amountAedMinor: number;
  amountInrMinor: number;
};

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("Setula app root is missing");
const app: HTMLDivElement = appRoot;

const CONTRACTOR = {
  name: "Asha Rao",
  email: "asha.rao@example.test",
  bankAccountLast4: "4821",
  bank: "HDFC Bank",
};

let runId = sessionStorage.getItem("setula:run-id") ?? crypto.randomUUID();
sessionStorage.setItem("setula:run-id", runId);
let defaultReference = `INV-SET-${runId.slice(0, 6).toUpperCase()}`;
let model: Model = { view: "details" };
let expiryTimer: number | undefined;
const inFlight = new Map<string, Promise<unknown>>();

function readLandingPrefill(): LandingPrefill | undefined {
  const params = new URLSearchParams(window.location.search);
  if (params.get("source") !== "landing-quote") return undefined;
  const aedMinor = Number(params.get("aedMinor"));
  const inrMinor = Number(params.get("inrMinor"));
  if (
    !Number.isSafeInteger(aedMinor) ||
    !Number.isSafeInteger(inrMinor) ||
    aedMinor <= 0 ||
    inrMinor <= 0
  ) return undefined;
  return { amountAedMinor: aedMinor, amountInrMinor: inrMinor };
}

let landingPrefill = readLandingPrefill();

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMinor(value: number, currency: "INR" | "AED"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function formatTime(value?: string): string {
  if (!value) return "Waiting";
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function parseInrMinor(value: string): number {
  if (!/^(0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)) {
    throw new Error("Enter a valid INR amount with no more than two decimal places.");
  }
  const [whole = "0", fraction = ""] = value.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor <= 0) {
    throw new Error("The recipient amount must be greater than zero.");
  }
  return minor;
}

function actionKey(name: string): string {
  const storageKey = `setula:idempotency:${runId}:${name}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const key = crypto.randomUUID();
  sessionStorage.setItem(storageKey, key);
  return key;
}

async function runOnce<T>(name: string, operation: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(name);
  if (existing) return existing as Promise<T>;
  const promise = operation().finally(() => inFlight.delete(name));
  inFlight.set(name, promise);
  return promise;
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: { method?: "GET" | "POST"; body?: unknown; key?: string; timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 20_000,
  );
  try {
    const response = await fetch(path, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body === undefined ? {} : { "content-type": "application/json" }),
        ...(options.key ? { "idempotency-key": options.key } : {}),
      },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      signal: controller.signal,
    });
    const raw = (await response.json()) as unknown;
    if (!response.ok) {
      const parsed = z
        .object({ error: z.object({ message: z.string() }) })
        .safeParse(raw);
      throw new Error(
        parsed.success ? parsed.data.error.message : `Request failed with HTTP ${response.status}`,
      );
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) throw new Error("The server returned an unexpected response.");
    return parsed.data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The request timed out. The payment may still be processing safely.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function shell(content: string): string {
  const hasPayment = Boolean(model.payment ?? model.aggregate?.payment);
  return `
    <div class="app-shell">
      <header class="topbar">
        <button class="brand nav-button" type="button" data-new-payment aria-label="Setula home, start a new payment">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>Setula</span>
        </button>
        <nav class="nav-actions" aria-label="Payment navigation">
          <button class="nav-button" type="button" data-new-payment ${model.view === "details" ? 'aria-current="page"' : ""}>New payment</button>
          <button class="nav-button" type="button" data-detail-nav ${!hasPayment ? "disabled" : ""} ${["progress", "receipt", "failure"].includes(model.view) ? 'aria-current="page"' : ""}>Payment details</button>
        </nav>
      </header>
      ${content}
      <div class="sr-only" aria-live="polite">${escapeHtml(model.busy ?? model.error ?? "")}</div>
    </div>`;
}

function errorAlert(): string {
  return model.error
    ? `<div class="alert" role="alert"><strong>We couldn’t continue.</strong><br>${escapeHtml(model.error)}</div>`
    : "";
}

function detailsView(): string {
  return shell(`
    <main class="page" id="main-content">
      <p class="eyebrow">New contractor payment</p>
      <h1 tabindex="-1" data-screen-heading>Who are we paying?</h1>
      <p class="lede">Create one invoice payment for the seeded India contractor. The contractor always receives the INR amount you enter.</p>
      ${errorAlert()}
      <div class="screen-grid">
        <form class="card" data-payment-form novalidate>
          <div class="card-body">
            <h2>Invoice details</h2>
            <div class="field-grid">
              <div class="field">
                <label for="invoice-reference">Invoice reference</label>
                <input id="invoice-reference" name="reference" value="${escapeHtml(model.invoice?.reference ?? defaultReference)}" maxlength="80" required autocomplete="off" />
              </div>
              <div class="field">
                <label for="invoice-amount">Recipient receives</label>
                <div class="amount-input">
                  <span>INR</span>
                  <input id="invoice-amount" name="amount" value="${model.invoice ? (model.invoice.amountInrMinor / 100).toFixed(2) : landingPrefill ? (landingPrefill.amountInrMinor / 100).toFixed(2) : "1.00"}" inputmode="decimal" required aria-describedby="amount-help" />
                </div>
                <p class="helper" id="amount-help">${landingPrefill ? `Prefilled from the landing quote: ${escapeHtml(formatMinor(landingPrefill.amountAedMinor, "AED"))} → ${escapeHtml(formatMinor(landingPrefill.amountInrMinor, "INR"))}.` : "Fixed contractor payout amount. Use INR 1.00 for the 0.01 USDC demo settlement."}</p>
              </div>
            </div>
            <div class="field">
              <label for="invoice-description">What is this payment for?</label>
              <textarea id="invoice-description" name="description" maxlength="240" required>Brand identity design services</textarea>
            </div>
            <div class="button-row">
              <button class="button button-primary" type="submit" ${model.busy ? "disabled" : ""}>
                ${model.busy === "Creating invoice and quote…" ? '<span class="spinner" aria-hidden="true"></span> Creating quote…' : "Continue to quote"}
              </button>
            </div>
          </div>
        </form>
        <aside class="card contractor-card" aria-label="Contractor summary">
          <div class="card-body">
            <div class="contractor-head">
              <div class="avatar" aria-hidden="true">AR</div>
              <div>
                <p class="contractor-name">${CONTRACTOR.name}</p>
                <span class="muted">India contractor</span>
              </div>
            </div>
            <dl class="info-list">
              <div class="info-row"><dt>Bank</dt><dd>${CONTRACTOR.bank}</dd></div>
              <div class="info-row"><dt>Account</dt><dd>•••• ${CONTRACTOR.bankAccountLast4}</dd></div>
              <div class="info-row"><dt>Payout</dt><dd>INR · simulated</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </main>`);
}

function quoteView(): string {
  const quote = model.quote;
  const invoice = model.invoice;
  if (!quote || !invoice) return detailsView();
  return shell(`
    <main class="page page-narrow" id="main-content">
      <p class="eyebrow">Quote review</p>
      <h1 tabindex="-1" data-screen-heading>Confirm the outcome</h1>
      <p class="lede">Review exactly what ${CONTRACTOR.name} receives and what the UAE agency funds.</p>
      ${errorAlert()}
      <section class="card quote-card" aria-labelledby="quote-title">
        <div class="quote-hero">
          <span class="quote-label">Sandbox partner quote</span>
          <p class="money-label" id="quote-title">Recipient receives</p>
          <div class="money-dominant">${escapeHtml(formatMinor(quote.amountInrMinor, "INR"))}</div>
          <p class="muted">Fixed amount to ${CONTRACTOR.name}</p>
          <p class="money-label money-secondary">Sender pays · ${escapeHtml(formatMinor(quote.amountAedMinor, "AED"))}</p>
        </div>
        <div class="quote-footer">
          <dl class="breakdown">
            <div class="breakdown-row"><dt>Exchange rate</dt><dd>1 AED = ${escapeHtml(quote.rateInrPerAed)} INR</dd></div>
            <div class="breakdown-row"><dt>Setula fee <span class="muted">· sandbox</span></dt><dd>AED 0.00</dd></div>
            <div class="breakdown-row"><dt>Partner / payout fee <span class="muted">· sandbox</span></dt><dd>AED 0.00</dd></div>
            <div class="breakdown-row"><dt>Estimated delivery</dt><dd>Under 2 minutes</dd></div>
          </dl>
          <div class="expiry" role="status">
            <span>Rate locked for this quote</span>
            <strong data-countdown>15:00 remaining</strong>
          </div>
          <div class="button-row">
            <button class="button button-secondary" type="button" data-edit-payment ${model.busy ? "disabled" : ""}>Back</button>
            <button class="button button-primary" type="button" data-approve-payment ${model.busy ? "disabled" : ""}>
              ${model.busy === "Approving payment…" ? '<span class="spinner" aria-hidden="true"></span> Approving…' : "Approve payment"}
            </button>
          </div>
          <p class="quote-note">AED funding and INR payout are simulated. USDC settlement executes for real on Arc Testnet.</p>
        </div>
      </section>
    </main>`);
}

const stageDefinitions: Array<{
  status: PaymentStatus;
  title: string;
  copy: string;
}> = [
  { status: "FUNDED", title: "AED funding confirmed", copy: "Simulated funding received from the UAE agency." },
  { status: "SETTLEMENT_PENDING", title: "USDC settlement pending", copy: "Circle is submitting and confirming the Arc Testnet transaction." },
  { status: "SETTLED", title: "USDC settled on Arc", copy: "Real onchain settlement confirmed by Circle." },
  { status: "PAYOUT_PENDING", title: "INR payout processing", copy: "Simulated local payout is being prepared." },
  { status: "DELIVERED", title: "Contractor paid", copy: `Simulated INR delivery confirmed for ${CONTRACTOR.name}.` },
];

function statusBadge(status: PaymentStatus): string {
  const failed = status === "SETTLEMENT_FAILED" || status === "PAYOUT_REJECTED";
  const succeeded = status === "DELIVERED";
  return `<span class="status-badge ${failed ? "status-failed" : succeeded ? "status-success" : "status-pending"}">${escapeHtml(status.replaceAll("_", " "))}</span>`;
}

function progressView(): string {
  const aggregate = model.aggregate;
  const payment = aggregate?.payment ?? model.payment;
  if (!payment) return detailsView();
  const reached = new Map(payment.timeline.map((entry, index) => [entry.status, { entry, index }]));
  const currentIndex = Math.max(
    0,
    ...stageDefinitions.map((stage, index) => (reached.has(stage.status) ? index : -1)),
  );
  const timeline = stageDefinitions
    .map((stage, index) => {
      const timelineEntry = reached.get(stage.status)?.entry;
      const complete = Boolean(timelineEntry);
      const current = !complete && index === currentIndex + 1;
      return `<li class="timeline-item ${complete ? "complete" : current ? "current" : ""}">
        <span class="timeline-dot" aria-hidden="true">✓</span>
        <div><p class="timeline-title">${stage.title}</p><p class="timeline-copy">${stage.copy}</p></div>
        <time class="timeline-time" ${timelineEntry ? `datetime="${escapeHtml(timelineEntry.at)}"` : ""}>${formatTime(timelineEntry?.at)}</time>
      </li>`;
    })
    .join("");
  const settlement = aggregate?.settlement;
  return shell(`
    <main class="page" id="main-content">
      <p class="eyebrow">Payment progress</p>
      <div class="progress-head">
        <div>
          <h1 tabindex="-1" data-screen-heading>Where is the payment now?</h1>
          <p class="lede">Payment <span class="reference">${escapeHtml(payment.reference)}</span></p>
        </div>
        ${statusBadge(payment.status)}
      </div>
      ${errorAlert()}
      <div class="screen-grid">
        <section class="card" aria-label="Payment events">
          <div class="card-body">
            <h2>Payment events</h2>
            <ol class="timeline">${timeline}</ol>
            ${model.busy ? `<div class="progress-message" role="status"><span class="spinner" aria-hidden="true"></span> ${escapeHtml(model.busy)} Do not close this page.</div>` : ""}
            ${payment.status === "PAYOUT_PENDING" && !model.busy ? `<div class="button-row"><button class="button button-primary" type="button" data-confirm-payout>Confirm simulated INR payout</button></div><p class="helper">This demo action sends the server-side simulated payout callback. No callback secret enters the browser.</p>` : ""}
          </div>
        </section>
        <aside class="card evidence-card" aria-label="Settlement evidence">
          <div class="card-body">
            <h2>Settlement evidence</h2>
            <dl class="info-list">
              <div class="info-row"><dt>Reference</dt><dd class="reference">${escapeHtml(payment.reference)}</dd></div>
              <div class="info-row"><dt>Network</dt><dd>Arc Testnet</dd></div>
              <div class="info-row"><dt>Amount settled</dt><dd>${settlement ? `${escapeHtml(settlement.amountUsdc)} USDC` : "Waiting"}</dd></div>
              ${settlement?.transactionHash ? `<div class="info-row"><dt>Transaction</dt><dd class="reference" title="${escapeHtml(settlement.transactionHash)}">${escapeHtml(settlement.transactionHash)}</dd></div>` : ""}
            </dl>
            ${settlement?.arcScanUrl ? `<p><a class="arc-link" href="${escapeHtml(settlement.arcScanUrl)}" target="_blank" rel="noreferrer">View transaction on ArcScan <span aria-hidden="true">↗</span></a></p>` : ""}
          </div>
        </aside>
      </div>
    </main>`);
}

function receiptView(): string {
  const aggregate = model.aggregate;
  const receipt = aggregate?.receipt;
  if (!aggregate || !receipt || !aggregate.settlement) return progressView();
  const { payment, invoice, quote, settlement } = aggregate;
  return shell(`
    <main class="page page-narrow" id="main-content">
      <p class="eyebrow">Payment receipt</p>
      <div class="receipt-head">
        <div>
          <h1 tabindex="-1" data-screen-heading>Payment delivered</h1>
          <p class="lede">This receipt links the invoice, payment, Arc settlement, and simulated INR payout.</p>
        </div>
        <button class="button button-secondary" type="button" data-print-receipt>Print / download</button>
      </div>
      <article class="card receipt-card">
        <div class="receipt-top">
          ${statusBadge(payment.status)}
          <div class="receipt-amount">${escapeHtml(formatMinor(receipt.amountInrMinor, "INR"))}</div>
          <p class="muted">Delivered to ${CONTRACTOR.name} · simulated local payout</p>
        </div>
        <div class="receipt-body">
          <p class="receipt-section-title">References</p>
          <dl class="receipt-list">
            <div class="receipt-row"><dt>Invoice reference</dt><dd class="reference">${escapeHtml(invoice.reference)}</dd></div>
            <div class="receipt-row"><dt>Payment reference</dt><dd class="reference">${escapeHtml(payment.reference)}</dd></div>
            <div class="receipt-row"><dt>Receipt reference</dt><dd class="reference">${escapeHtml(receipt.reference)}</dd></div>
            <div class="receipt-row"><dt>Contractor</dt><dd>${CONTRACTOR.name} · •••• ${CONTRACTOR.bankAccountLast4}</dd></div>
          </dl>
          <p class="receipt-section-title">Payment</p>
          <dl class="receipt-list">
            <div class="receipt-row"><dt>AED funded <span class="muted">· simulated</span></dt><dd>${escapeHtml(formatMinor(quote.amountAedMinor, "AED"))}</dd></div>
            <div class="receipt-row"><dt>USDC settled <span class="muted">· real</span></dt><dd>${escapeHtml(receipt.amountUsdc)} USDC</dd></div>
            <div class="receipt-row"><dt>INR delivered <span class="muted">· simulated</span></dt><dd>${escapeHtml(formatMinor(receipt.amountInrMinor, "INR"))}</dd></div>
            <div class="receipt-row"><dt>Exchange rate</dt><dd>1 AED = ${escapeHtml(quote.rateInrPerAed)} INR</dd></div>
            <div class="receipt-row"><dt>Setula fee <span class="muted">· sandbox</span></dt><dd>AED 0.00</dd></div>
            <div class="receipt-row"><dt>Partner / payout fee <span class="muted">· sandbox</span></dt><dd>AED 0.00</dd></div>
          </dl>
          <p class="receipt-section-title">Arc evidence</p>
          <dl class="receipt-list">
            <div class="receipt-row"><dt>Transaction hash</dt><dd class="reference">${escapeHtml(settlement.transactionHash)}</dd></div>
            <div class="receipt-row"><dt>Delivered</dt><dd>${escapeHtml(formatDateTime(receipt.deliveredAt))}</dd></div>
          </dl>
          <p><a class="arc-link" href="${escapeHtml(receipt.arcScanUrl)}" target="_blank" rel="noreferrer">View transaction on ArcScan <span aria-hidden="true">↗</span></a></p>
        </div>
      </article>
    </main>`);
}

function failureView(): string {
  const aggregate = model.aggregate;
  const status = aggregate?.payment.status ?? "SETTLEMENT_FAILED";
  const insufficient = status === "SETTLEMENT_FAILED";
  const title = insufficient ? "Settlement could not complete" : "Payout was rejected";
  const reason = insufficient
    ? "The Arc settlement account does not have enough USDC for this payment."
    : "The simulated INR payout callback rejected this payment.";
  return shell(`
    <main class="page page-narrow" id="main-content">
      <p class="eyebrow">Payment exception</p>
      <section class="card">
        <div class="card-body">
          <div class="failure-icon" aria-hidden="true">!</div>
          ${statusBadge(status)}
          <h1 tabindex="-1" data-screen-heading>${title}</h1>
          <p class="lede">${escapeHtml(reason)}</p>
          <div class="failure-proof">
            <p><strong>${insufficient ? "No settlement completed" : "Delivery not completed"}</strong></p>
            <p class="muted">${insufficient ? "No Arc settlement was marked complete, no contractor delivery was recorded, and no receipt was generated." : "The Arc settlement completed, but contractor delivery was not recorded and no receipt was generated."}</p>
            ${insufficient ? "<p class=\"muted\">There is no ArcScan link because no successful transaction exists.</p>" : aggregate?.settlement?.arcScanUrl ? `<p><a class="arc-link" href="${escapeHtml(aggregate.settlement.arcScanUrl)}" target="_blank" rel="noreferrer">View the completed Arc settlement <span aria-hidden="true">↗</span></a></p>` : ""}
          </div>
          <div class="button-row">
            <button class="button button-primary" type="button" data-new-payment>Start a new payment</button>
          </div>
          <p class="helper">This payment is in a terminal state, so Setula will not retry it automatically.</p>
        </div>
      </section>
    </main>`);
}

function render(focusHeading = false): void {
  if (expiryTimer !== undefined) window.clearInterval(expiryTimer);
  app.innerHTML =
    model.view === "details"
      ? detailsView()
      : model.view === "quote"
        ? quoteView()
        : model.view === "progress"
          ? progressView()
          : model.view === "receipt"
            ? receiptView()
            : failureView();
  bindEvents();
  if (model.view === "quote") startCountdown();
  if (focusHeading) document.querySelector<HTMLElement>("[data-screen-heading]")?.focus();
}

function resetPayment(): void {
  sessionStorage.removeItem(`setula:payment-id:${runId}`);
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith("setula:idempotency:")) sessionStorage.removeItem(key);
  }
  runId = crypto.randomUUID();
  sessionStorage.setItem("setula:run-id", runId);
  defaultReference = `INV-SET-${runId.slice(0, 6).toUpperCase()}`;
  landingPrefill = undefined;
  if (window.location.search) window.history.replaceState({}, "", "/");
  model = { view: "details" };
  render(true);
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-new-payment]").forEach((button) => {
    button.addEventListener("click", resetPayment);
  });
  document.querySelector<HTMLButtonElement>("[data-detail-nav]")?.addEventListener("click", () => {
    if (!model.payment && !model.aggregate) return;
    model.view = model.aggregate?.receipt ? "receipt" : model.aggregate?.payment.status.includes("FAILED") || model.aggregate?.payment.status === "PAYOUT_REJECTED" ? "failure" : "progress";
    render(true);
  });
  document.querySelector<HTMLFormElement>("[data-payment-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    void createInvoiceAndQuote(event.currentTarget as HTMLFormElement);
  });
  document.querySelector<HTMLButtonElement>("[data-edit-payment]")?.addEventListener("click", () => {
    model.view = "details";
    model.error = undefined;
    render(true);
  });
  document.querySelector<HTMLButtonElement>("[data-approve-payment]")?.addEventListener("click", () => {
    void approveAndSettle();
  });
  document.querySelector<HTMLButtonElement>("[data-confirm-payout]")?.addEventListener("click", () => {
    void completePayout();
  });
  document.querySelector<HTMLButtonElement>("[data-print-receipt]")?.addEventListener("click", () => window.print());
}

function startCountdown(): void {
  const update = () => {
    const element = document.querySelector<HTMLElement>("[data-countdown]");
    if (!element || !model.quote) return;
    const remaining = Math.max(0, new Date(model.quote.expiresAt).getTime() - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    element.textContent = `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
    if (remaining === 0) {
      element.textContent = "Quote expired";
      const button = document.querySelector<HTMLButtonElement>("[data-approve-payment]");
      if (button) button.disabled = true;
    }
  };
  update();
  expiryTimer = window.setInterval(update, 1_000);
}

async function createInvoiceAndQuote(form: HTMLFormElement): Promise<void> {
  await runOnce("create-invoice", async () => {
    const data = new FormData(form);
    try {
      const reference = String(data.get("reference") ?? "").trim();
      const description = String(data.get("description") ?? "").trim();
      const amountInrMinor = parseInrMinor(String(data.get("amount") ?? ""));
      if (!reference || !description) throw new Error("Invoice reference and description are required.");
      model = { ...model, busy: "Creating invoice and quote…", error: undefined };
      render();
      const beneficiary = await request("/api/beneficiaries", beneficiarySchema, {
        method: "POST",
        key: actionKey("beneficiary"),
        body: {
          name: CONTRACTOR.name,
          email: CONTRACTOR.email,
          bankAccountLast4: CONTRACTOR.bankAccountLast4,
        },
      });
      const invoice = await request("/api/invoices", invoiceSchema, {
        method: "POST",
        key: actionKey("invoice"),
        body: { beneficiaryId: beneficiary.id, reference, amountInrMinor, description },
      });
      const quote = await request(`/api/invoices/${invoice.id}/quotes`, quoteSchema, {
        method: "POST",
        key: actionKey("quote"),
        body: {},
      });
      model = { view: "quote", beneficiary, invoice, quote };
      render(true);
    } catch (error) {
      model = {
        ...model,
        view: "details",
        busy: undefined,
        error: error instanceof Error ? error.message : "Unable to create the quote.",
      };
      render(true);
    }
  });
}

async function approveAndSettle(): Promise<void> {
  await runOnce("approve-payment", async () => {
    if (!model.invoice || !model.quote) return;
    const invoice = model.invoice;
    const quote = model.quote;
    try {
      model = { ...model, busy: "Approving payment…", error: undefined };
      render();
      const payment = await request("/api/payments", paymentSchema, {
        method: "POST",
        key: actionKey("payment"),
        body: { invoiceId: invoice.id, quoteId: quote.id },
      });
      sessionStorage.setItem(`setula:payment-id:${runId}`, payment.id);
      await request(`/api/payments/${payment.id}/funding-confirmations`, paymentSchema, {
        method: "POST",
        key: actionKey("funding"),
        body: {},
      });
      let aggregate = await request(`/api/payments/${payment.id}`, aggregateSchema);
      model = { ...model, view: "progress", payment, aggregate, busy: "Settling USDC on Arc Testnet…" };
      render(true);

      const settlementPromise = request(
        `/api/payments/${payment.id}/settlements`,
        paymentSchema,
        {
          method: "POST",
          key: actionKey("settlement"),
          body: {},
          timeoutMs: 190_000,
        },
      );
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      aggregate = await request(`/api/payments/${payment.id}`, aggregateSchema);
      model = { ...model, aggregate, busy: "Settling USDC on Arc Testnet…" };
      render();
      await settlementPromise;
      aggregate = await request(`/api/payments/${payment.id}`, aggregateSchema);
      model = { ...model, aggregate, busy: undefined };
      if (aggregate.payment.status === "SETTLEMENT_FAILED") {
        model.view = "failure";
        render(true);
        return;
      }
      render(true);
    } catch (error) {
      let aggregate = model.aggregate;
      if (model.payment) {
        try {
          aggregate = await request(`/api/payments/${model.payment.id}`, aggregateSchema);
        } catch {
          // Preserve the last confirmed state when status reconciliation is unavailable.
        }
      }
      model = {
        ...model,
        aggregate,
        view:
          aggregate?.payment.status === "SETTLEMENT_FAILED" ||
          aggregate?.payment.status === "PAYOUT_REJECTED"
            ? "failure"
            : "progress",
        busy: undefined,
        error: error instanceof Error ? error.message : "Payment processing was interrupted.",
      };
      render(true);
    }
  });
}

async function completePayout(): Promise<void> {
  await runOnce("complete-payout", async () => {
    const payment = model.aggregate?.payment ?? model.payment;
    if (!payment || payment.status !== "PAYOUT_PENDING") return;
    try {
      model = { ...model, busy: "Processing simulated INR payout…", error: undefined };
      render();
      const rejectPayout =
        new URLSearchParams(window.location.search).get("payout") === "rejected";
      await request(`/api/payments/${payment.id}/demo-payouts`, payoutResultSchema, {
        method: "POST",
        key: actionKey("payout"),
        body: { status: rejectPayout ? "REJECTED" : "DELIVERED" },
      });
      const aggregate = await request(`/api/payments/${payment.id}`, aggregateSchema);
      model = {
        ...model,
        aggregate,
        busy: undefined,
        view: aggregate.payment.status === "DELIVERED" ? "receipt" : "failure",
      };
      render(true);
    } catch (error) {
      model = {
        ...model,
        busy: undefined,
        error: error instanceof Error ? error.message : "The payout callback failed.",
      };
      render(true);
    }
  });
}

async function hydrate(): Promise<void> {
  const paymentId = sessionStorage.getItem(`setula:payment-id:${runId}`);
  if (!paymentId) {
    render();
    return;
  }
  try {
    const aggregate = await request(`/api/payments/${paymentId}`, aggregateSchema);
    model = {
      view:
        aggregate.payment.status === "DELIVERED"
          ? "receipt"
          : aggregate.payment.status === "SETTLEMENT_FAILED" ||
              aggregate.payment.status === "PAYOUT_REJECTED"
            ? "failure"
            : "progress",
      payment: aggregate.payment,
      invoice: aggregate.invoice,
      quote: aggregate.quote,
      aggregate,
    };
    render();
  } catch {
    sessionStorage.removeItem(`setula:payment-id:${runId}`);
    model = { view: "details" };
    render();
  }
}

void hydrate();
