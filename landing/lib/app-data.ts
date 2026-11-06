export const DRAFT_STORAGE_KEY = "setula:phase2-payment-draft";
export const PAYMENT_IDS_STORAGE_KEY = "setula:phase2-payment-ids";
export const SANDBOX_FEE_AED = 0;

export const beneficiary = { name: "Asha Rao", initials: "AR", role: "Design contractor", email: "asha.rao@example.test", bank: "HDFC Bank", account: "•••• 4821", bankAccountLast4: "4821", location: "Bengaluru, India" };

export type OperationKeys = { beneficiary: string; invoice: string; quote: string; payment: string; funding: string; settlement: string; payout: string };
export type PaymentDraft = { amountInr: string; purpose: string; invoiceReference: string; createdAt: string; keys: OperationKeys; beneficiaryId?: string; invoiceId?: string; quoteId?: string; paymentId?: string };

export function createOperationKeys(): OperationKeys { return { beneficiary: crypto.randomUUID(), invoice: crypto.randomUUID(), quote: crypto.randomUUID(), payment: crypto.randomUUID(), funding: crypto.randomUUID(), settlement: crypto.randomUUID(), payout: crypto.randomUUID() }; }
export function readDraft(): PaymentDraft | null { try { return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) ?? "null") as PaymentDraft | null; } catch { return null; } }
export function saveDraft(draft: PaymentDraft) { localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft)); }
export function readPaymentIds(): string[] { try { const value = JSON.parse(localStorage.getItem(PAYMENT_IDS_STORAGE_KEY) ?? "[]") as unknown; return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []; } catch { return []; } }
export function rememberPaymentId(paymentId: string) { const ids = readPaymentIds().filter(id => id !== paymentId); localStorage.setItem(PAYMENT_IDS_STORAGE_KEY, JSON.stringify([paymentId, ...ids].slice(0, 10))); }
export function paymentOperationKey(paymentId: string, operation: "settlement" | "payout") { const storageKey = `setula:phase2:${paymentId}:${operation}`; const existing = localStorage.getItem(storageKey); if (existing) return existing; const created = crypto.randomUUID(); localStorage.setItem(storageKey, created); return created; }
export function formatMoney(amount: number, currency: "AED" | "INR") { return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-AE", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount); }
export function formatDate(value: string) { return new Intl.DateTimeFormat("en-AE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
