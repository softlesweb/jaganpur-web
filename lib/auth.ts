import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createAdminClient } from "./supabase/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-in-prod");

export interface SessionUser {
  id: string;
  phone: string;
  name: string | null;
  role: "resident" | "admin";
}

export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getOrCreateUser(phone: string): Promise<SessionUser> {
  const db = createAdminClient();
  const normalized = phone.startsWith("+") ? phone : `+91${phone}`;

  const { data: existing } = await db
    .from("profiles")
    .select("*")
    .eq("phone", normalized)
    .single();

  if (existing) {
    return { id: existing.id, phone: existing.phone, name: existing.name, role: existing.role };
  }

  const { data: created, error } = await db
    .from("profiles")
    .insert({ phone: normalized, role: "resident" })
    .select("*")
    .single();

  if (error || !created) throw new Error("Failed to create user");
  return { id: created.id, phone: created.phone, name: created.name, role: created.role };
}
