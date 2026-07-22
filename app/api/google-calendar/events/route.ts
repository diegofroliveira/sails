import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

const ORGANIZATION_ID = "df67d7ba-c5e5-4d51-b76f-40bf4052eee3";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authorization = request.headers.get("authorization");
  const sessionToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!supabaseUrl || !publicKey || !serviceKey || !sessionToken) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const publicClient = createClient<Database>(supabaseUrl, publicKey);
  const { data: { user } } = await publicClient.auth.getUser(sessionToken);
  if (!user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });

  const { appointmentId } = await request.json() as { appointmentId?: string };
  if (!appointmentId) return NextResponse.json({ error: "Agendamento ausente" }, { status: 400 });
  const admin = createClient<Database>(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: appointment } = await admin.from("appointments").select("id,attendee_name,attendee_email,starts_at,ends_at,timezone,meeting_types(name,kind)").eq("id", appointmentId).eq("organization_id", ORGANIZATION_ID).single();
  if (!appointment) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });

  const { data: credentials } = await admin.from("integration_credentials").select("access_token,refresh_token,expires_at").eq("organization_id", ORGANIZATION_ID).eq("provider", "google_calendar").single();
  if (!credentials || !clientId || !clientSecret) return NextResponse.json({ error: "Google Agenda ainda não conectado" }, { status: 409 });

  let accessToken = credentials.access_token;
  if (!accessToken || !credentials.expires_at || new Date(credentials.expires_at).getTime() < Date.now() + 60_000) {
    if (!credentials.refresh_token) return NextResponse.json({ error: "Reconecte o Google Agenda" }, { status: 409 });
    const refreshed = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: credentials.refresh_token, grant_type: "refresh_token" }),
    });
    if (!refreshed.ok) return NextResponse.json({ error: "Falha ao renovar acesso ao Google" }, { status: 502 });
    const token = await refreshed.json() as { access_token: string; expires_in: number };
    accessToken = token.access_token;
    await admin.from("integration_credentials").update({ access_token: accessToken, expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString() }).eq("organization_id", ORGANIZATION_ID).eq("provider", "google_calendar");
  }

  const meetingType = appointment.meeting_types as unknown as { name: string; kind: string } | null;
  const eventResponse = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: `${meetingType?.name || "FROM DATA"} · ${appointment.attendee_name}`,
      description: "Encontro criado pela Sails para a jornada FROM DATA.",
      start: { dateTime: appointment.starts_at, timeZone: appointment.timezone },
      end: { dateTime: appointment.ends_at, timeZone: appointment.timezone },
      attendees: [{ email: appointment.attendee_email, displayName: appointment.attendee_name }],
      conferenceData: { createRequest: { requestId: appointment.id, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    }),
  });
  if (!eventResponse.ok) return NextResponse.json({ error: "Google recusou a criação do evento" }, { status: 502 });
  const event = await eventResponse.json() as { id: string; htmlLink?: string; hangoutLink?: string };
  await admin.from("appointments").update({ google_event_id: event.id, conference_url: event.hangoutLink || event.htmlLink || null }).eq("id", appointment.id);
  return NextResponse.json({ eventId: event.id, eventUrl: event.htmlLink, meetingUrl: event.hangoutLink });
}
