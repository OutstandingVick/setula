export const DRAFT_STORAGE_KEY = "setula:phase1-payment-draft";
export const PAYMENTS_STORAGE_KEY = "setula:phase1-payments";

export const AED_TO_INR_RATE = 22.68;
export const SANDBOX_FEE_AED = 12;

export const beneficiary = {
  name: "Asha Rao",
  initials: "AR",
  role: "Design contractor",
  email: "asha.rao@example.test",
  bank: "HDFC Bank",
  account: "•••• 4821",
  location: "Bengaluru, India",
};

export type PaymentDraft = {
  amountInr: string;
  purpose: string;
  invoiceReference: string;
  createdAt: string;
};

export type LocalPayment = PaymentDraft & {
  id: string;
  status: "Draft" | "Ready for review";
};

export function inrToAed(amountInr: number): number {
  return amountInr / AED_TO_INR_RATE;
}

export function formatMoney(amount: number, currency: "AED" | "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
