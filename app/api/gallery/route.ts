import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data, error } = await db
    .from("gallery_photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const photos = (data ?? []).map((p) => ({
    ...p,
    public_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${p.storage_path}`,
  }));

  return NextResponse.json(photos);
}
