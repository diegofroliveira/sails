import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

type BrandingPayload = {
  mentorshipName: string;
  portalName: string;
  tagline: string;
  primaryColor: string;
  customDomain: string;
  emailSender: string;
  hideSailsBranding: boolean;
};

async function resolveMembership(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) } as const;

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return { error: NextResponse.json({ error: "Nenhuma organização encontrada para este usuário" }, { status: 404 }) } as const;

  return { membership } as const;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const resolved = await resolveMembership(supabase);
  if ("error" in resolved) return resolved.error;
  const { organization_id: organizationId, role } = resolved.membership;

  const [{ data: branding }, { data: addon }] = await Promise.all([
    supabase.from("organization_branding").select("*").eq("organization_id", organizationId).maybeSingle(),
    supabase
      .from("organization_addons")
      .select("status")
      .eq("organization_id", organizationId)
      .eq("addon_code", "custom_branding")
      .maybeSingle(),
  ]);

  return NextResponse.json({
    role,
    addonStatus: addon?.status ?? "unavailable",
    branding: branding
      ? {
          mentorshipName: branding.mentorship_name ?? branding.portal_name,
          portalName: branding.portal_name,
          tagline: branding.tagline ?? "",
          primaryColor: branding.primary_color,
          customDomain: branding.custom_domain ?? "",
          emailSender: branding.email_sender_name ?? "",
          hideSailsBranding: branding.hide_sails_branding,
        }
      : null,
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const resolved = await resolveMembership(supabase);
  if ("error" in resolved) return resolved.error;
  const { organization_id: organizationId, role } = resolved.membership;

  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ error: "Apenas owner ou admin podem alterar a personalização" }, { status: 403 });
  }

  let body: Partial<BrandingPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const mentorshipName = String(body.mentorshipName ?? "").trim();
  const portalName = String(body.portalName ?? "").trim();
  const tagline = String(body.tagline ?? "").trim();
  const primaryColor = String(body.primaryColor ?? "").trim();
  const customDomain = String(body.customDomain ?? "").trim();
  const emailSender = String(body.emailSender ?? "").trim();
  const hideSailsBranding = Boolean(body.hideSailsBranding);

  if (!portalName) return NextResponse.json({ error: "Nome exibido no portal é obrigatório" }, { status: 400 });
  if (!HEX_COLOR.test(primaryColor)) return NextResponse.json({ error: "Cor principal inválida (use #rrggbb)" }, { status: 400 });

  const fields = {
    mentorship_name: mentorshipName || null,
    portal_name: portalName,
    tagline: tagline || null,
    primary_color: primaryColor,
    custom_domain: customDomain || null,
    email_sender_name: emailSender || null,
    hide_sails_branding: hideSailsBranding,
  };

  const { data: existing } = await supabase
    .from("organization_branding")
    .select("organization_id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("organization_branding").update(fields).eq("organization_id", organizationId)
    : await supabase.from("organization_branding").insert({ organization_id: organizationId, ...fields });

  if (error) return NextResponse.json({ error: "Não foi possível salvar a personalização" }, { status: 502 });

  return NextResponse.json({ ok: true });
}
