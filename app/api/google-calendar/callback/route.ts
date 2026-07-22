import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

const ORGANIZATION_ID = "df67d7ba-c5e5-4d51-b76f-40bf4052eee3";

export async function GET(request: NextRequest) {
  const target = new URL("/portal", request.url);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("google_oauth_state")?.value;
  if (!code || !state || state !== savedState) {
    target.searchParams.set("google", "invalid_state");
    return NextResponse.redirect(target);
  }

  const browserSession = await createSupabaseServerClient();
  const { data: { user } } = await browserSession.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || new URL("/api/google-calendar/callback", request.url).toString();
  if (!clientId || !clientSecret || !serviceKey || !supabaseUrl) {
    target.searchParams.set("google", "not_configured");
    return NextResponse.redirect(target);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  if (!tokenResponse.ok) {
    target.searchParams.set("google", "token_error");
    return NextResponse.redirect(target);
  }

  const token = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in: number; scope?: string };
  const admin = createClient<Database>(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: prior } = await admin.from("integration_credentials").select("refresh_token").eq("organization_id", ORGANIZATION_ID).eq("provider", "google_calendar").maybeSingle();
  await admin.from("integration_credentials").upsert({
    organization_id: ORGANIZATION_ID,
    provider: "google_calendar",
    access_token: token.access_token,
    refresh_token: token.refresh_token || prior?.refresh_token || null,
    expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    scopes: token.scope?.split(" ") || [],
    metadata: { connected_by: user.id },
  }, { onConflict: "organization_id,provider" });
  await admin.from("integration_connections").update({ status: "connected", account_label: user.email || "Google Agenda", last_synced_at: new Date().toISOString(), last_error: null }).eq("organization_id", ORGANIZATION_ID).eq("provider", "google_calendar");

  target.searchParams.set("google", "connected");
  const response = NextResponse.redirect(target);
  response.cookies.delete("google_oauth_state");
  return response;
}
