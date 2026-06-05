import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createSession, getOrCreateUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json();

  if (!phone || !otp) {
    return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
  }

  const normalized = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
  const db = createAdminClient();

  const { data: otpRecord } = await db
    .from("otp_codes")
    .select("*")
    .eq("phone", normalized)
    .eq("otp", otp)
    .eq("used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!otpRecord) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
  }

  await db.from("otp_codes").update({ used: true }).eq("id", otpRecord.id);

  const user = await getOrCreateUser(normalized);
  const token = await createSession(user);

  const response = NextResponse.json({ success: true, user });
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
