import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendRawBroadcast } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, title } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: residents } = await db
    .from("profiles")
    .select("phone")
    .eq("wa_opt_in", true);

  if (!residents?.length) {
    return NextResponse.json({ total: 0, failed: 0, message: "No opted-in residents" });
  }

  const phones = residents.map((r) => r.phone);
  const result = await sendRawBroadcast(phones, message);

  return NextResponse.json(result);
}
