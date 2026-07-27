import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { FROM_DATA_ORGANIZATION_ID, getGoogleCalendarContext } from "@/lib/google-calendar";

async function authenticate(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!supabaseUrl || !publicKey || !token) return false;
  const client = createClient<Database>(supabaseUrl, publicKey, { auth: { persistSession: false } });
  const { data: { user } } = await client.auth.getUser(token);
  return Boolean(user);
}

export async function GET(request: NextRequest) {
  if (!(await authenticate(request))) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const google = await getGoogleCalendarContext();
  if (!google) return NextResponse.json({ error: "Conecte o Google Agenda primeiro" }, { status: 409 });
  const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=freeBusyReader&maxResults=250", { headers: { Authorization: `Bearer ${google.accessToken}` } });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível listar suas agendas" }, { status: 502 });
  const payload = await response.json() as { items?: Array<{ id: string; summary: string; primary?: boolean; backgroundColor?: string; accessRole?: string }> };
  return NextResponse.json({
    calendars: payload.items || [],
    selectedCalendarIds: google.configuration.selected_calendar_ids || ["primary"],
    bookingCalendarId: google.configuration.booking_calendar_id || "primary",
  });
}

export async function POST(request: NextRequest) {
  if (!(await authenticate(request))) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const google = await getGoogleCalendarContext();
  if (!google) return NextResponse.json({ error: "Conecte o Google Agenda primeiro" }, { status: 409 });
  const body = await request.json() as { selectedCalendarIds?: string[]; bookingCalendarId?: string };
  const selected = [...new Set((body.selectedCalendarIds || []).filter((id) => typeof id === "string" && id.length < 500))].slice(0, 50);
  if (selected.length === 0) return NextResponse.json({ error: "Selecione ao menos uma agenda" }, { status: 400 });
  const configuration = { ...google.configuration, selected_calendar_ids: selected, booking_calendar_id: body.bookingCalendarId || "primary", timezone: "America/Sao_Paulo" };
  const { error } = await google.admin.from("integration_connections").update({ configuration: google.asJson(configuration), last_synced_at: new Date().toISOString() }).eq("organization_id", FROM_DATA_ORGANIZATION_ID).eq("provider", "google_calendar");
  if (error) return NextResponse.json({ error: "Não foi possível salvar as agendas" }, { status: 502 });
  return NextResponse.json({ selectedCalendarIds: selected, bookingCalendarId: configuration.booking_calendar_id });
}
