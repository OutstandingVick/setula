import { z } from "zod";

const statusSchema = z.enum(["DRAFT", "QUOTED", "FUNDED", "SETTLEMENT_PENDING", "SETTLED", "PAYOUT_PENDING", "DELIVERED", "SETTLEMENT_FAILED", "PAYOUT_REJECTED", "REFUND_PENDING", "REFUNDED"]);
const timelineSchema = z.object({ status: statusSchema, at: z.string(), detail: z.string().optional() });
export const beneficiarySchema = z.object({ id: z.string().uuid(), reference: z.string(), name: z.string(), email: z.string(), bankAccountLast4: z.string(), createdAt: z.string() });
export const invoiceSchema = z.object({ id: z.string().uuid(), beneficiaryId: z.string().uuid(), reference: z.string(), amountInrMinor: z.number().int(), description: z.string(), createdAt: z.string() });
export const quoteSchema = z.object({ id: z.string().uuid(), invoiceId: z.string().uuid(), reference: z.string(), amountInrMinor: z.number().int(), rateInrPerAed: z.string(), amountAedMinor: z.number().int(), usdcAmount: z.string(), expiresAt: z.string(), createdAt: z.string() });
export const paymentSchema = z.object({ id: z.string().uuid(), invoiceId: z.string().uuid(), quoteId: z.string().uuid(), reference: z.string(), status: statusSchema, timeline: z.array(timelineSchema), settlementId: z.string().uuid().optional(), payoutId: z.string().uuid().optional(), receiptId: z.string().uuid().optional(), createdAt: z.string(), updatedAt: z.string() });
export const settlementSchema = z.object({ id: z.string().uuid(), paymentId: z.string().uuid(), reference: z.string(), amountUsdc: z.string(), status: z.enum(["PENDING", "COMPLETE", "FAILED"]), circleTransactionId: z.string().optional(), transactionHash: z.string().optional(), arcScanUrl: z.string().url().optional(), failureCode: z.string().optional(), failureMessage: z.string().optional(), createdAt: z.string(), updatedAt: z.string() });
export const payoutSchema = z.object({ id: z.string().uuid(), paymentId: z.string().uuid(), reference: z.string(), amountInrMinor: z.number().int(), status: z.enum(["PENDING", "DELIVERED", "REJECTED"]), callbackId: z.string().optional(), createdAt: z.string(), updatedAt: z.string() });
export const receiptSchema = z.object({ id: z.string().uuid(), paymentId: z.string().uuid(), invoiceId: z.string().uuid(), settlementId: z.string().uuid(), payoutId: z.string().uuid(), reference: z.string(), amountInrMinor: z.number().int(), amountUsdc: z.string(), transactionHash: z.string(), arcScanUrl: z.string().url(), deliveredAt: z.string() });
export const aggregateSchema = z.object({ payment: paymentSchema, invoice: invoiceSchema, quote: quoteSchema, settlement: settlementSchema.optional(), payout: payoutSchema.optional(), receipt: receiptSchema.optional() });
const payoutResultSchema = z.object({ payment: paymentSchema, payout: payoutSchema, receipt: receiptSchema.optional() });

export type PaymentStatus = z.infer<typeof statusSchema>;
export type PaymentAggregate = z.infer<typeof aggregateSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
export class ApiError extends Error { constructor(message: string, readonly code: string, readonly status: number) { super(message); } }

type Fetcher = typeof fetch;
export class SetulaApi {
  constructor(private readonly fetcher: Fetcher = fetch) {}
  private async request<T>(path: string, schema: z.ZodType<T>, options: { method?: "GET" | "POST"; body?: unknown; key?: string } = {}): Promise<T> {
    let response: Response;
    try { const requestFetch = this.fetcher; response = await requestFetch(path, { method: options.method ?? "GET", headers: { ...(options.body === undefined ? {} : { "content-type": "application/json" }), ...(options.key ? { "idempotency-key": options.key } : {}) }, ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }) }); }
    catch { throw new ApiError("The Setula backend is unavailable. Check the connection and try again.", "NETWORK_ERROR", 0); }
    const raw = await response.json().catch(() => null) as unknown;
    if (!response.ok) { const parsed = z.object({ error: z.object({ code: z.string(), message: z.string() }) }).safeParse(raw); throw new ApiError(parsed.success ? parsed.data.error.message : `Request failed with HTTP ${response.status}. Try again.`, parsed.success ? parsed.data.error.code : "HTTP_ERROR", response.status); }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) throw new ApiError("The backend returned an unexpected response. Refresh and try again.", "INVALID_RESPONSE", response.status);
    return parsed.data;
  }
  health() { return this.request("/health", z.object({ status: z.literal("ok") })); }
  createBeneficiary(body: { name: string; email: string; bankAccountLast4: string }, key: string) { return this.request("/api/beneficiaries", beneficiarySchema, { method: "POST", body, key }); }
  createInvoice(body: { beneficiaryId: string; reference: string; amountInrMinor: number; description: string }, key: string) { return this.request("/api/invoices", invoiceSchema, { method: "POST", body, key }); }
  createQuote(invoiceId: string, key: string) { return this.request(`/api/invoices/${invoiceId}/quotes`, quoteSchema, { method: "POST", body: {}, key }); }
  createPayment(body: { invoiceId: string; quoteId: string }, key: string) { return this.request("/api/payments", paymentSchema, { method: "POST", body, key }); }
  confirmFunding(paymentId: string, key: string) { return this.request(`/api/payments/${paymentId}/funding-confirmations`, paymentSchema, { method: "POST", body: {}, key }); }
  executeSettlement(paymentId: string, key: string) { return this.request(`/api/payments/${paymentId}/settlements`, paymentSchema, { method: "POST", body: {}, key }); }
  getPayment(paymentId: string) { return this.request(`/api/payments/${paymentId}`, aggregateSchema); }
  completePayout(paymentId: string, key: string) { return this.request(`/api/payments/${paymentId}/demo-payouts`, payoutResultSchema, { method: "POST", body: { status: "DELIVERED" }, key }); }
  getReceipt(receiptId: string) { return this.request(`/api/receipts/${receiptId}`, receiptSchema); }
}
export const setulaApi = new SetulaApi();
