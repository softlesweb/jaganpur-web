import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendAnnouncementBroadcast } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: text, category, image_url, is_emergency } = body;

  if (!title || !text || !category) {
    return NextResponse.json({ error: "title, body, and category are required" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("announcements")
    .insert({ title, body: text, category, image_url: image_url || null, is_emergency: !!is_emergency, created_by: admin.id })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Broadcast to all opted-in residents (fire and forget)
  const appUrl = `${process.env.NEXT_PUBLIC_APP_URL}/hi`;
  db.from("profiles")
    .select("phone")
    .eq("wa_opt_in", true)
    .neq("role", "admin")
    .then(({ data: residents }) => {
      if (!residents?.length) return;
      const phones = residents.map((r) => r.phone);
      sendAnnouncementBroadcast(phones, title, category, appUrl).catch(console.error);
    });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  const db = createAdminClient();
  const { error } = await db.from("announcements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
