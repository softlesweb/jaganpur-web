import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendOtp } from "@/lib/whatsapp";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const normalized = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const db = createAdminClient();

  // Invalidate previous OTPs for this phone
  await db.from("otp_codes").update({ used: true }).eq("phone", normalized).eq("used", false);

  // Insert new OTP
  const { error } = await db.from("otp_codes").insert({ phone: normalized, otp, expires_at: expiresAt });
  if (error) {
    return NextResponse.json({ error: "Failed to create OTP" }, { status: 500 });
  }

  // In development, return OTP directly for testing
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] OTP for ${normalized}: ${otp}`);
    return NextResponse.json({ success: true, dev_otp: otp });
  }

  try {
    await sendOtp(normalized, otp);
  } catch (err) {
    console.error("WhatsApp send failed:", err);
    // Still return success to not reveal if phone exists, but log the error
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
