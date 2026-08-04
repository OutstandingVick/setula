import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z, ZodError } from "zod";
import { AppError, ValidationError } from "./errors.js";
import type { SetulaService } from "./service.js";

const beneficiarySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  bankAccountLast4: z.string().regex(/^\d{4}$/),
});

const invoiceSchema = z.object({
  beneficiaryId: z.string().uuid(),
  reference: z.string().trim().min(1).max(80),
  amountInrMinor: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  description: z.string().trim().min(1).max(240),
});

const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  quoteId: z.string().uuid(),
});

const payoutCallbackSchema = z.object({
  callbackId: z.string().trim().min(1).max(100),
  paymentId: z.string().uuid(),
  reference: z.string().trim().min(1).max(80),
  amountInrMinor: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  status: z.enum(["DELIVERED", "REJECTED"]),
});

const demoPayoutSchema = z.object({
  status: z.enum(["DELIVERED", "REJECTED"]).default("DELIVERED"),
});

function send(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(body)}\n`);
}

async function sendPublicFile(
  response: ServerResponse,
  fileName: "index.html" | "styles.css" | "app.js" | "favicon.svg",
): Promise<void> {
  const mimeTypes = {
    "index.html": "text/html; charset=utf-8",
    "styles.css": "text/css; charset=utf-8",
    "app.js": "text/javascript; charset=utf-8",
    "favicon.svg": "image/svg+xml",
  } as const;
  const file = await readFile(resolve("public", fileName));
  response.writeHead(200, {
    "content-type": mimeTypes[fileName],
    "cache-control": "no-store",
  });
  response.end(file);
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    length += buffer.length;
    if (length > 1_000_000) throw new ValidationError("Request body is too large");
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
}

function idempotencyKey(request: IncomingMessage): string {
  const value = request.headers["idempotency-key"];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createHttpServer(service: SetulaService) {
  return createServer(async (request, response) => {
    try {
      const method = request.method ?? "GET";
      const url = new URL(request.url ?? "/", "http://localhost");
      const path = url.pathname;

      if (method === "GET" && path === "/") {
        response.writeHead(302, { location: "/pay" });
        response.end();
        return;
      }

      const publicFile =
        path === "/pay"
          ? "index.html"
          : path === "/pay/styles.css"
            ? "styles.css"
            : path === "/pay/app.js"
              ? "app.js"
              : path === "/pay/favicon.svg"
                ? "favicon.svg"
              : undefined;
      if (method === "GET" && publicFile) {
        await sendPublicFile(response, publicFile);
        return;
      }

      if (method === "GET" && path === "/health") {
        send(response, 200, { status: "ok" });
        return;
      }

      if (method === "POST" && path === "/api/beneficiaries") {
        const result = await service.createBeneficiary(
          beneficiarySchema.parse(await readJson(request)),
          idempotencyKey(request),
        );
        send(response, 201, result);
        return;
      }

      if (method === "POST" && path === "/api/invoices") {
        const result = await service.createInvoice(
          invoiceSchema.parse(await readJson(request)),
          idempotencyKey(request),
        );
        send(response, 201, result);
        return;
      }

      const quoteMatch = /^\/api\/invoices\/([0-9a-f-]+)\/quotes$/.exec(path);
      if (method === "POST" && quoteMatch) {
        const result = await service.createQuote(
          z.string().uuid().parse(quoteMatch[1]),
          idempotencyKey(request),
        );
        send(response, 201, result);
        return;
      }

      if (method === "POST" && path === "/api/payments") {
        const result = await service.createPayment(
          paymentSchema.parse(await readJson(request)),
          idempotencyKey(request),
        );
        send(response, 201, result);
        return;
      }

      const fundingMatch = /^\/api\/payments\/([0-9a-f-]+)\/funding-confirmations$/.exec(path);
      if (method === "POST" && fundingMatch) {
        const result = await service.confirmFunding(
          z.string().uuid().parse(fundingMatch[1]),
          idempotencyKey(request),
        );
        send(response, 200, result);
        return;
      }

      const settlementMatch = /^\/api\/payments\/([0-9a-f-]+)\/settlements$/.exec(path);
      if (method === "POST" && settlementMatch) {
        const result = await service.executeSettlement(
          z.string().uuid().parse(settlementMatch[1]),
          idempotencyKey(request),
        );
        send(response, 200, result);
        return;
      }

      if (method === "POST" && path === "/api/payout-callbacks") {
        const callbackSecret = request.headers["x-payout-callback-secret"];
        const result = await service.receivePayoutCallback(
          payoutCallbackSchema.parse(await readJson(request)),
          idempotencyKey(request),
          Array.isArray(callbackSecret)
            ? (callbackSecret[0] ?? "")
            : (callbackSecret ?? ""),
        );
        send(response, 200, result);
        return;
      }

      const demoPayoutMatch = /^\/api\/payments\/([0-9a-f-]+)\/demo-payouts$/.exec(path);
      if (method === "POST" && demoPayoutMatch) {
        const body = demoPayoutSchema.parse(await readJson(request));
        const result = await service.simulatePayout(
          z.string().uuid().parse(demoPayoutMatch[1]),
          body.status,
          idempotencyKey(request),
        );
        send(response, 200, result);
        return;
      }

      const paymentMatch = /^\/api\/payments\/([0-9a-f-]+)$/.exec(path);
      if (method === "GET" && paymentMatch) {
        send(
          response,
          200,
          await service.getPayment(z.string().uuid().parse(paymentMatch[1])),
        );
        return;
      }

      const receiptMatch = /^\/api\/receipts\/([0-9a-f-]+)$/.exec(path);
      if (method === "GET" && receiptMatch) {
        send(
          response,
          200,
          await service.getReceipt(z.string().uuid().parse(receiptMatch[1])),
        );
        return;
      }

      send(response, 404, { error: { code: "NOT_FOUND", message: "Route not found" } });
    } catch (error) {
      if (error instanceof ZodError) {
        send(response, 400, {
          error: { code: "VALIDATION_ERROR", message: z.prettifyError(error) },
        });
        return;
      }
      if (error instanceof AppError) {
        send(response, error.statusCode, {
          error: { code: error.code, message: error.message },
        });
        return;
      }
      console.error(error);
      send(response, 500, {
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      });
    }
  });
}
