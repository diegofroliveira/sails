import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const FROM_DATA_ORGANIZATION_ID = "df67d7ba-c5e5-4d51-b76f-40bf4052eee3";

type ReadWebhook = {
  session_id: string;
  request_id: string;
  trigger: "meeting_start" | "meeting_end";
  title?: string;
  start_time?: string;
  report_url?: string;
  summary?: string;
  action_items?: unknown[];
  topics?: unknown[];
};

function decodeBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-read-signature")?.toLowerCase();
  const signingKey = process.env.READ_AI_WEBHOOK_SIGNING_KEY;
  if (!signature || !signingKey) return NextResponse.json({ error: "Assinatura ausente" }, { status: 401 });

  const key = await crypto.subtle.importKey("raw", decodeBase64(signingKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  if (!safeEqual(hex(digest), signature)) return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });

  const payload = JSON.parse(rawBody) as ReadWebhook;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: "Integração não configurada" }, { status: 503 });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: eventError } = await supabase.from("webhook_events").insert({
    provider: "read_ai",
    provider_event_id: payload.request_id,
    event_type: payload.trigger,
    payload,
  });

  if (eventError?.code === "23505") return NextResponse.json({ received: true, duplicate: true });
  if (eventError) return NextResponse.json({ error: "Falha ao registrar evento" }, { status: 500 });
  if (payload.trigger !== "meeting_end" || !payload.start_time) return NextResponse.json({ received: true });

  const start = new Date(payload.start_time);
  const windowStart = new Date(start.getTime() - 15 * 60 * 1000).toISOString();
  const windowEnd = new Date(start.getTime() + 15 * 60 * 1000).toISOString();
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id")
    .eq("organization_id", FROM_DATA_ORGANIZATION_ID)
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd)
    .limit(1);

  const appointment = appointments?.[0];
  if (!appointment) return NextResponse.json({ received: true, matched: false }, { status: 202 });

  const { error: intelligenceError } = await supabase.from("meeting_intelligence").upsert({
    organization_id: FROM_DATA_ORGANIZATION_ID,
    appointment_id: appointment.id,
    read_meeting_id: payload.session_id,
    report_url: payload.report_url,
    summary: payload.summary,
    action_items: payload.action_items ?? [],
    key_topics: payload.topics ?? [],
    processed_at: new Date().toISOString(),
  }, { onConflict: "appointment_id" });

  if (intelligenceError) return NextResponse.json({ error: "Falha ao processar reunião" }, { status: 500 });

  await supabase.from("webhook_events").update({ status: "succeeded", processed_at: new Date().toISOString() })
    .eq("provider", "read_ai").eq("provider_event_id", payload.request_id);

  return NextResponse.json({ received: true, matched: true });
}
