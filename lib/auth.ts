import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { makeToken, passwordMatches, tokenIsValid } from "./session";

const COOKIE = "vs_admin";
const TTL_S = 60 * 60 * 24 * 7;
const password = () => process.env.ADMIN_PASSWORD ?? "";

export const checkPassword = (input: string) => passwordMatches(input, password());

export async function startSession() {
  (await cookies()).set(COOKIE, makeToken(password(), TTL_S * 1000), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: TTL_S,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isAdmin() {
  return tokenIsValid((await cookies()).get(COOKIE)?.value, password());
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
