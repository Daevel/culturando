import { describe, expect, it } from "vitest";

import { isAdminSession } from "./authorization";

describe("isAdminSession", () => {
  it("returns true for a session with the admin role", () => {
    expect(isAdminSession({ user: { role: "admin" } } as never)).toBe(true);
  });

  it("returns false for a session with the plain user role", () => {
    expect(isAdminSession({ user: { role: "user" } } as never)).toBe(false);
  });

  it("returns false when the session has no user", () => {
    expect(isAdminSession({ user: undefined } as never)).toBe(false);
  });

  it("returns false for a null session", () => {
    expect(isAdminSession(null)).toBe(false);
  });

  it("returns false for an undefined session", () => {
    expect(isAdminSession(undefined)).toBe(false);
  });
});
