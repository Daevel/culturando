import { describe, expect, it } from "vitest";

import { getClientIpFromHeaders, UNKNOWN_CLIENT_IP } from "./client-ip";

describe("getClientIpFromHeaders", () => {
  it("uses the first address of x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });

    expect(getClientIpFromHeaders(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": " 198.51.100.4 " });

    expect(getClientIpFromHeaders(headers)).toBe("198.51.100.4");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7",
      "x-real-ip": "198.51.100.4",
    });

    expect(getClientIpFromHeaders(headers)).toBe("203.0.113.7");
  });

  it("uses the explicit unknown bucket when no proxy header is present", () => {
    expect(getClientIpFromHeaders(new Headers())).toBe(UNKNOWN_CLIENT_IP);
  });

  it("ignores an empty x-forwarded-for", () => {
    expect(getClientIpFromHeaders(new Headers({ "x-forwarded-for": " , " }))).toBe(
      UNKNOWN_CLIENT_IP,
    );
  });
});
