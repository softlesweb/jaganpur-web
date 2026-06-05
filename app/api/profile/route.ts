import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSession, createSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data } = await db.from("profiles").select("*").eq("id", session.id).single();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim() || null;
  if (body.wa_opt_in !== undefined) updates.wa_opt_in = Boolean(body.wa_opt_in);

  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .update(updates)
    .eq("id", session.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Refresh JWT with updated name
  if (body.name !== undefined) {
    const updated = { ...session, name: data.name };
    const token = await createSession(updated);
    const response = NextResponse.json(data);
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  }

  return NextResponse.json(data);
}
