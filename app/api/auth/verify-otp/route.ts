import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createSession, getOrCreateUser } from "@/lib/auth";
import { getContactName } from "@/lib/whatsapp";

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

  const { user: existingCheck } = await (async () => {
    const { data } = await db.from("profiles").select("id").eq("phone", normalized).single();
    return { user: data };
  })();
  const isNewUser = !existingCheck;

  let user = await getOrCreateUser(normalized);

  // Auto-populate name from WhatsApp bridge if not set yet
  if (!user.name) {
    const waName = await getContactName(normalized);
    if (waName) {
      await db.from("profiles").update({ name: waName }).eq("id", user.id);
      user = { ...user, name: waName };
    }
  }

  // Fetch full profile
  const { data: profile } = await db
    .from("profiles")
    .select("digital_id, education_level, exam_target, school_name")
    .eq("id", user.id)
    .single();

  const token = await createSession(user);

  const response = NextResponse.json({
    success: true,
    user: { ...user, digital_id: profile?.digital_id, education_level: profile?.education_level ?? null },
    is_new_user: isNewUser,
  });
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
