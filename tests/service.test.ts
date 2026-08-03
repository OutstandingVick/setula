import { describe, expect, it } from "vitest";
import { InsufficientBalanceError, UnauthorizedError, ValidationError } from "../src/errors.js";
import type {
  SettlementGateway,
  SettlementRequest,
  SettlementResult,
} from "../src/settlement.js";
import { SetulaService } from "../src/service.js";
import { MemoryStore } from "../src/store.js";

const TX_HASH = `0x${"a".repeat(64)}`;
const ARC_SCAN_URL = `https://testnet.arcscan.app/tx/${TX_HASH}`;
const CALLBACK_SECRET = "test-callback-secret";

class FakeSettlementGateway implements SettlementGateway {
  calls: SettlementRequest[] = [];

  constructor(private readonly failure?: Error) {}

  async transfer(request: SettlementRequest): Promise<SettlementResult> {
    this.calls.push(request);
    if (this.failure) throw this.failure;
    await new Promise((resolve) => setTimeout(resolve, 2));
    return {
      circleTransactionId: "circle-transaction-1",
      transactionHash: TX_HASH,
      arcScanUrl: ARC_SCAN_URL,
    };
  }
}

async function quotedPayment(service: SetulaService) {
  const beneficiary = await service.createBeneficiary(
    {
      name: "Asha Contractor",
      email: "asha@example.test",
      bankAccountLast4: "1234",
    },
    "beneficiary-1",
  );
  const invoice = await service.createInvoice(
    {
      beneficiaryId: beneficiary.id,
      reference: "INV-SETULA-001",
      amountInrMinor: 100_000,
      description: "Design services",
    },
    "invoice-1",
  );
  const quote = await service.createQuote(invoice.id, "quote-1");
  const payment = await service.createPayment(
    { invoiceId: invoice.id, quoteId: quote.id },
    "payment-1",
  );
  return { beneficiary, invoice, quote, payment };
}

async function pendingPayout(service: SetulaService) {
  const seeded = await quotedPayment(service);
  await service.confirmFunding(seeded.payment.id, "funding-1");
  const payment = await service.executeSettlement(seeded.payment.id, "settlement-1");
  return { ...seeded, payment };
}

describe("Setula backend golden path", () => {
  it("completes a successful payment only after settlement and payout callback", async () => {
    const gateway = new FakeSettlementGateway();
    const service = new SetulaService(new MemoryStore(), gateway, CALLBACK_SECRET);
    const seeded = await pendingPayout(service);

    expect(seeded.payment.status).toBe("PAYOUT_PENDING");
    expect(seeded.payment.timeline.map(({ status }) => status)).toEqual([
      "DRAFT",
      "QUOTED",
      "FUNDED",
      "SETTLEMENT_PENDING",
      "SETTLED",
      "PAYOUT_PENDING",
    ]);

    const result = await service.receivePayoutCallback(
      {
        callbackId: "callback-success-1",
        paymentId: seeded.payment.id,
        reference: seeded.invoice.reference,
        amountInrMinor: seeded.invoice.amountInrMinor,
        status: "DELIVERED",
      },
      "payout-callback-1",
      CALLBACK_SECRET,
    );

    expect(result.payment.status).toBe("DELIVERED");
    expect(result.receipt?.transactionHash).toBe(TX_HASH);
    expect(result.receipt?.arcScanUrl).toBe(ARC_SCAN_URL);
    expect(gateway.calls).toHaveLength(1);
  });

  it("marks insufficient USDC balance as SETTLEMENT_FAILED and never SETTLED", async () => {
    const gateway = new FakeSettlementGateway(
      new InsufficientBalanceError("Insufficient Wallet A USDC"),
    );
    const service = new SetulaService(new MemoryStore(), gateway, CALLBACK_SECRET);
    const seeded = await quotedPayment(service);
    await service.confirmFunding(seeded.payment.id, "funding-1");

    const payment = await service.executeSettlement(seeded.payment.id, "settlement-1");
    const aggregate = await service.getPayment(payment.id);

    expect(payment.status).toBe("SETTLEMENT_FAILED");
    expect(payment.timeline.map(({ status }) => status)).not.toContain("SETTLED");
    expect(aggregate.settlement?.status).toBe("FAILED");
    expect(aggregate.settlement?.transactionHash).toBeUndefined();
  });

  it("returns one payment and executes one Arc transfer for duplicate requests", async () => {
    const gateway = new FakeSettlementGateway();
    const service = new SetulaService(new MemoryStore(), gateway, CALLBACK_SECRET);
    const seeded = await quotedPayment(service);
    const duplicate = await service.createPayment(
      { invoiceId: seeded.invoice.id, quoteId: seeded.quote.id },
      "payment-1",
    );
    expect(duplicate.id).toBe(seeded.payment.id);

    await service.confirmFunding(seeded.payment.id, "funding-1");
    const [first, second] = await Promise.all([
      service.executeSettlement(seeded.payment.id, "settlement-1"),
      service.executeSettlement(seeded.payment.id, "settlement-1"),
    ]);

    expect(first.id).toBe(second.id);
    expect(gateway.calls).toHaveLength(1);
    expect(gateway.calls[0]?.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("retries an uncertain settlement with the same Circle idempotency key", async () => {
    class RecoveringGateway implements SettlementGateway {
      calls: SettlementRequest[] = [];

      async transfer(request: SettlementRequest): Promise<SettlementResult> {
        this.calls.push(request);
        if (this.calls.length === 1) throw new Error("connection lost after submission");
        return {
          circleTransactionId: "circle-recovered-1",
          transactionHash: TX_HASH,
          arcScanUrl: ARC_SCAN_URL,
        };
      }
    }
    const gateway = new RecoveringGateway();
    const service = new SetulaService(new MemoryStore(), gateway, CALLBACK_SECRET);
    const seeded = await quotedPayment(service);
    await service.confirmFunding(seeded.payment.id, "funding-1");

    await expect(
      service.executeSettlement(seeded.payment.id, "settlement-1"),
    ).rejects.toThrow("connection lost");
    expect((await service.getPayment(seeded.payment.id)).payment.status).toBe(
      "SETTLEMENT_PENDING",
    );

    const recovered = await service.executeSettlement(
      seeded.payment.id,
      "settlement-retry",
    );
    expect(recovered.status).toBe("PAYOUT_PENDING");
    expect(gateway.calls).toHaveLength(2);
    expect(gateway.calls[1]?.idempotencyKey).toBe(
      gateway.calls[0]?.idempotencyKey,
    );
  });

  it("rejects an invalid payout callback without delivering the payment", async () => {
    const service = new SetulaService(
      new MemoryStore(),
      new FakeSettlementGateway(),
      CALLBACK_SECRET,
    );
    const seeded = await pendingPayout(service);

    await expect(
      service.receivePayoutCallback(
        {
          callbackId: "callback-invalid-1",
          paymentId: seeded.payment.id,
          reference: "WRONG-REFERENCE",
          amountInrMinor: seeded.invoice.amountInrMinor,
          status: "DELIVERED",
        },
        "payout-invalid-1",
        CALLBACK_SECRET,
      ),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      service.receivePayoutCallback(
        {
          callbackId: "callback-invalid-2",
          paymentId: seeded.payment.id,
          reference: seeded.invoice.reference,
          amountInrMinor: seeded.invoice.amountInrMinor,
          status: "DELIVERED",
        },
        "payout-invalid-2",
        "wrong-secret",
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect((await service.getPayment(seeded.payment.id)).payment.status).toBe(
      "PAYOUT_PENDING",
    );
  });

  it("returns the same receipt for a duplicate payout callback", async () => {
    const service = new SetulaService(
      new MemoryStore(),
      new FakeSettlementGateway(),
      CALLBACK_SECRET,
    );
    const seeded = await pendingPayout(service);
    const callback = {
      callbackId: "callback-duplicate-1",
      paymentId: seeded.payment.id,
      reference: seeded.invoice.reference,
      amountInrMinor: seeded.invoice.amountInrMinor,
      status: "DELIVERED" as const,
    };

    const first = await service.receivePayoutCallback(
      callback,
      "payout-duplicate-1",
      CALLBACK_SECRET,
    );
    const second = await service.receivePayoutCallback(
      callback,
      "payout-duplicate-2",
      CALLBACK_SECRET,
    );

    expect(second.receipt?.id).toBe(first.receipt?.id);
    expect(second.payment.timeline.filter(({ status }) => status === "DELIVERED")).toHaveLength(1);
  });

  it("rejects an invalid state transition", async () => {
    const service = new SetulaService(
      new MemoryStore(),
      new FakeSettlementGateway(),
      CALLBACK_SECRET,
    );
    const seeded = await quotedPayment(service);

    await expect(
      service.executeSettlement(seeded.payment.id, "settlement-too-early"),
    ).rejects.toMatchObject({
      code: "INVALID_STATE_TRANSITION",
    });
    expect((await service.getPayment(seeded.payment.id)).payment.status).toBe("QUOTED");
  });

  it("keeps the invoice, payment, payout, and receipt on one reference", async () => {
    const service = new SetulaService(
      new MemoryStore(),
      new FakeSettlementGateway(),
      CALLBACK_SECRET,
    );
    const seeded = await pendingPayout(service);
    const result = await service.receivePayoutCallback(
      {
        callbackId: "callback-reference-1",
        paymentId: seeded.payment.id,
        reference: seeded.invoice.reference,
        amountInrMinor: seeded.invoice.amountInrMinor,
        status: "DELIVERED",
      },
      "payout-reference-1",
      CALLBACK_SECRET,
    );

    expect([
      seeded.invoice.reference,
      result.payment.reference,
      result.payout.reference,
      result.receipt?.reference,
    ]).toEqual(Array(4).fill(seeded.invoice.reference));
    expect(result.receipt?.invoiceId).toBe(seeded.invoice.id);
    expect(result.receipt?.paymentId).toBe(seeded.payment.id);
  });
});
