import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .select("id, phone, name, role, wa_opt_in, digital_id, education_level, exam_target, school_name, created_at")
    .order("digital_id", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const allowed = ["role", "wa_opt_in", "name"];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .update(filtered)
    .eq("id", id)
    .select("id, phone, name, role, wa_opt_in, digital_id, education_level, exam_target, school_name, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
