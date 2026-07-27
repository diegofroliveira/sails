import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";

export const FROM_DATA_ORGANIZATION_ID = "df67d7ba-c5e5-4d51-b76f-40bf4052eee3";

type CalendarConfiguration = {
  booking_calendar_id?: string;
  selected_calendar_ids?: string[];
  timezone?: string;
};

export async function getGoogleCalendarContext() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!supabaseUrl || !serviceKey || !clientId || !clientSecret) return null;

  const admin = createClient<Database>(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const [{ data: credentials }, { data: connection }] = await Promise.all([
    admin.from("integration_credentials").select("access_token,refresh_token,expires_at").eq("organization_id", FROM_DATA_ORGANIZATION_ID).eq("provider", "google_calendar").maybeSingle(),
    admin.from("integration_connections").select("configuration,status").eq("organization_id", FROM_DATA_ORGANIZATION_ID).eq("provider", "google_calendar").maybeSingle(),
  ]);
  if (!credentials || connection?.status !== "connected") return null;

  let accessToken = credentials.access_token;
  if (!accessToken || !credentials.expires_at || new Date(credentials.expires_at).getTime() < Date.now() + 60_000) {
    if (!credentials.refresh_token) return null;
    const refreshed = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: credentials.refresh_token, grant_type: "refresh_token" }),
    });
    if (!refreshed.ok) return null;
    const token = await refreshed.json() as { access_token: string; expires_in: number };
    accessToken = token.access_token;
    await admin.from("integration_credentials").update({ access_token: accessToken, expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString() }).eq("organization_id", FROM_DATA_ORGANIZATION_ID).eq("provider", "google_calendar");
  }

  return {
    admin,
    accessToken,
    configuration: (connection?.configuration || {}) as CalendarConfiguration,
    asJson: (value: CalendarConfiguration) => value as unknown as Json,
  };
}
