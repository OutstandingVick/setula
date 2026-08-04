import type { AddressInfo } from "node:net";
import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";
import type { Beneficiary, Invoice, Payment, Quote, Receipt } from "../src/domain.js";
import { createHttpServer } from "../src/http.js";
import type { SettlementGateway } from "../src/settlement.js";
import { SetulaService } from "../src/service.js";
import { MemoryStore } from "../src/store.js";

const servers: ReturnType<typeof createHttpServer>[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        ),
    ),
  );
});

describe("Setula HTTP API", () => {
  it("exposes the complete backend golden path", async () => {
    const gateway: SettlementGateway = {
      async transfer() {
        const transactionHash = `0x${"b".repeat(64)}`;
        return {
          circleTransactionId: "circle-http-1",
          transactionHash,
          arcScanUrl: `https://testnet.arcscan.app/tx/${transactionHash}`,
        };
      },
    };
    const service = new SetulaService(
      new MemoryStore(),
      gateway,
      "http-callback-secret",
    );
    const server = createHttpServer(service);
    servers.push(server);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;

    async function post<T>(
      path: string,
      key: string,
      body: unknown = {},
      headers: Record<string, string> = {},
    ): Promise<T> {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": key,
          ...headers,
        },
        body: JSON.stringify(body),
      });
      expect(response.status).toBeLessThan(300);
      return (await response.json()) as T;
    }

    const beneficiary = await post<Beneficiary>(
      "/api/beneficiaries",
      "http-beneficiary-1",
      {
        name: "Asha Contractor",
        email: "asha@example.test",
        bankAccountLast4: "1234",
      },
    );
    const invoice = await post<Invoice>("/api/invoices", "http-invoice-1", {
      beneficiaryId: beneficiary.id,
      reference: "INV-HTTP-001",
      amountInrMinor: 100_000,
      description: "Design services",
    });
    const quote = await post<Quote>(
      `/api/invoices/${invoice.id}/quotes`,
      "http-quote-1",
    );
    const payment = await post<Payment>("/api/payments", "http-payment-1", {
      invoiceId: invoice.id,
      quoteId: quote.id,
    });
    await post<Payment>(
      `/api/payments/${payment.id}/funding-confirmations`,
      "http-funding-1",
    );
    const pendingPayout = await post<Payment>(
      `/api/payments/${payment.id}/settlements`,
      "http-settlement-1",
    );
    expect(pendingPayout.status).toBe("PAYOUT_PENDING");

    const callback = await post<{ payment: Payment; receipt: Receipt }>(
      `/api/payments/${payment.id}/demo-payouts`,
      "http-payout-1",
      {
        status: "DELIVERED",
      },
    );
    expect(callback.payment.status).toBe("DELIVERED");

    const receiptResponse = await fetch(
      `${baseUrl}/api/receipts/${callback.receipt.id}`,
    );
    expect(receiptResponse.status).toBe(200);
    expect((await receiptResponse.json()) as Receipt).toMatchObject({
      id: callback.receipt.id,
      reference: invoice.reference,
      paymentId: payment.id,
      invoiceId: invoice.id,
    });
  });
});
