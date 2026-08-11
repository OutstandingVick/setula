import { describe, expect, it } from "vitest";
import { idempotencyStorageKey } from "../web/idempotency.js";

describe("browser idempotency key scoping", () => {
  it("reuses the key for an identical logical request", () => {
    const first = idempotencyStorageKey("run-1", "invoice", {
      reference: "INV-001",
      amountInrMinor: 9_100_000,
    });
    const retry = idempotencyStorageKey("run-1", "invoice", {
      reference: "INV-001",
      amountInrMinor: 9_100_000,
    });
    expect(retry).toBe(first);
  });

  it("uses a different key when the invoice amount changes", () => {
    const original = idempotencyStorageKey("run-1", "invoice", {
      reference: "INV-001",
      amountInrMinor: 9_100_000,
    });
    const edited = idempotencyStorageKey("run-1", "invoice", {
      reference: "INV-001",
      amountInrMinor: 12_500_000,
    });
    expect(edited).not.toBe(original);
  });

  it("isolates keys across payment runs and actions", () => {
    expect(idempotencyStorageKey("run-1", "quote", "invoice-1")).not.toBe(
      idempotencyStorageKey("run-2", "quote", "invoice-1"),
    );
    expect(idempotencyStorageKey("run-1", "quote", "invoice-1")).not.toBe(
      idempotencyStorageKey("run-1", "settlement", "invoice-1"),
    );
  });
});
