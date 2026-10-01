import assert from "node:assert/strict";
import { test } from "node:test";
import { makeToken, passwordMatches, tokenIsValid } from "./session.ts";

test("session tokens", () => {
  const t = makeToken("hunter2", 60_000, 1_000);
  assert.ok(tokenIsValid(t, "hunter2", 2_000));
  assert.ok(!tokenIsValid(t, "hunter2", 61_001), "expired");
  assert.ok(!tokenIsValid(t, "other", 2_000), "different password");
  const [exp, sig] = t.split(".");
  assert.ok(!tokenIsValid(`${Number(exp) + 1}.${sig}`, "hunter2", 2_000), "tampered expiry");
  assert.ok(!tokenIsValid(`${exp}.${sig}x`, "hunter2", 2_000), "tampered signature");
  assert.ok(!tokenIsValid(undefined, "hunter2"));
  assert.ok(!tokenIsValid(t, "", 2_000), "no password configured");
});

test("password check", () => {
  assert.ok(passwordMatches("hunter2", "hunter2"));
  assert.ok(!passwordMatches("hunter", "hunter2"));
  assert.ok(!passwordMatches("", ""), "empty password never matches");
});
