import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { getGoogleCalendarContext } from "@/lib/google-calendar";

type Slot = { starts_at: string; ends_at: string };
type FreeBusyResponse = { calendars?: Record<string, { busy?: Array<{ start: string; end: string }>; errors?: unknown[] }> };

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Data inválida" }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publicKey) return NextResponse.json({ error: "Agenda indisponível" }, { status: 503 });

  const publicClient = createClient<Database>(supabaseUrl, publicKey, { auth: { persistSession: false } });
  const { data, error } = await publicClient.rpc("get_from_data_available_slots", { p_date: date });
  if (error) return NextResponse.json({ error: "Não foi possível consultar os horários" }, { status: 502 });
  let slots = (data || []) as Slot[];

  const google = await getGoogleCalendarContext();
  if (!google || slots.length === 0) return NextResponse.json({ date, slots, checkedCalendars: 0, source: "from_data" }, { headers: { "Cache-Control": "no-store" } });

  const calendarIds = google.configuration.selected_calendar_ids?.length ? google.configuration.selected_calendar_ids : ["primary"];
  const timeMin = `${date}T00:00:00-03:00`;
  const timeMax = `${date}T23:59:59-03:00`;
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${google.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, timeZone: "America/Sao_Paulo", items: calendarIds.map((id) => ({ id })) }),
  });
  if (!response.ok) return NextResponse.json({ date, slots, checkedCalendars: 0, source: "from_data" }, { headers: { "Cache-Control": "no-store" } });

  const payload = await response.json() as FreeBusyResponse;
  const busy = Object.values(payload.calendars || {}).flatMap((calendar) => calendar.busy || []);
  slots = slots.filter((slot) => !busy.some((period) => new Date(slot.starts_at) < new Date(period.end) && new Date(slot.ends_at) > new Date(period.start)));
  return NextResponse.json({ date, slots, checkedCalendars: calendarIds.length, source: "google" }, { headers: { "Cache-Control": "no-store" } });
}
