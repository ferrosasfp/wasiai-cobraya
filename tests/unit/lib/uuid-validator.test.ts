import { describe, it, expect } from "vitest";
import { isValidUuidV4 } from "@/lib/uuid-validator";

describe("isValidUuidV4 — WKH-COBRAYA-DAPP-SHELL W9 (CD-33 regression)", () => {
  it("accepts a standard v4 UUID", () => {
    expect(isValidUuidV4("abcdef12-3456-4789-89ab-cdef12345678")).toBe(true);
  });

  it("rejects an empty string / null / undefined", () => {
    expect(isValidUuidV4("")).toBe(false);
    expect(isValidUuidV4(null)).toBe(false);
    expect(isValidUuidV4(undefined)).toBe(false);
  });

  it("rejects a string with trailing CRLF (defense vs header injection)", () => {
    expect(
      isValidUuidV4("abcdef12-3456-4789-89ab-cdef12345678\r\n"),
    ).toBe(false);
  });

  it("rejects a string with embedded CRLF", () => {
    expect(
      isValidUuidV4("abcdef12-3456-4789-89ab-cdef12345678\r\nSet-Cookie:x"),
    ).toBe(false);
  });

  it("rejects shorter / longer strings", () => {
    expect(isValidUuidV4("abcdef12-3456-4789-89ab-cdef1234567")).toBe(false);
    expect(isValidUuidV4("abcdef12-3456-4789-89ab-cdef123456789")).toBe(false);
  });
});
