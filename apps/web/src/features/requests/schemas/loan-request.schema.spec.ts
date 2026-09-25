import { describe, expect, it } from "vitest";

import { loanRequestSchema, validateLoanRequestForm } from "./loan-request.schema";

describe("loanRequestSchema", () => {
  it.each(["consultation", "loan", "info"])("accepts the %s request type", (type) => {
    const result = validateLoanRequestForm({ type, message: "Posso passare sabato?" });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual({ type, message: "Posso passare sabato?" });
  });

  it("rejects a missing type", () => {
    const result = validateLoanRequestForm({ message: "Ciao" });

    expect(result.isValid).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toHaveProperty("type");
  });

  it("rejects an unknown type", () => {
    const result = validateLoanRequestForm({ type: "purchase" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("type");
  });

  it("accepts a missing message", () => {
    const result = validateLoanRequestForm({ type: "loan" });

    expect(result.isValid).toBe(true);
    expect(result.data?.message).toBeUndefined();
  });

  it("trims the message and turns a blank one into undefined", () => {
    expect(loanRequestSchema.parse({ type: "loan", message: "  Ciao  " }).message).toBe("Ciao");
    expect(loanRequestSchema.parse({ type: "loan", message: "   " }).message).toBeUndefined();
  });

  it("accepts a message of exactly 800 characters", () => {
    expect(validateLoanRequestForm({ type: "info", message: "a".repeat(800) }).isValid).toBe(true);
  });

  it("rejects a message longer than 800 characters", () => {
    const result = validateLoanRequestForm({ type: "info", message: "a".repeat(801) });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(
      "message",
      expect.arrayContaining(["Il messaggio non può superare 800 caratteri."]),
    );
  });
});
