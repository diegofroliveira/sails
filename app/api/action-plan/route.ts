import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type BriefingInput = {
  currentRole?: string;
  experienceLevel?: string;
  careerGoal: string;
  currentChallenge: string;
  desiredOutcome?: string;
  weeklyAvailabilityHours?: number;
  skills?: string[];
  meetingSummary?: string;
};

type ActionPlan = {
  objective: string;
  diagnosisSummary: string;
  milestones: Array<{ title: string; deadline: string }>;
  nextActions: Array<{ action: string; owner: "mentorado" | "mentor"; timeframe: string }>;
  successMetrics: string[];
  risks: string[];
  provider: "gemini" | "template";
  model: string;
};

function fallbackPlan(input: BriefingInput): ActionPlan {
  const hours = input.weeklyAvailabilityHours ?? 5;
  return {
    objective: input.careerGoal,
    diagnosisSummary: `${input.currentRole || "Profissional em transição"} buscando ${input.careerGoal}. O bloqueio prioritário informado é: ${input.currentChallenge}.`,
    milestones: [
      { title: "Diagnóstico e posicionamento", deadline: "7 dias" },
      { title: "Projeto de portfólio com narrativa de negócio", deadline: "30 dias" },
      { title: "Preparação para oportunidades e entrevistas", deadline: "60 dias" },
    ],
    nextActions: [
      { action: `Reservar ${hours}h semanais no calendário para execução`, owner: "mentorado", timeframe: "esta semana" },
      { action: "Definir um projeto conectado ao objetivo de carreira", owner: "mentorado", timeframe: "7 dias" },
      { action: "Revisar diagnóstico, escopo e critérios de sucesso", owner: "mentor", timeframe: "próxima sessão" },
    ],
    successMetrics: ["Rotina semanal cumprida", "Projeto publicável concluído", "Narrativa profissional validada"],
    risks: ["Escopo excessivo", "Baixa consistência semanal", "Objetivo sem evidência prática"],
    provider: "template",
    model: "from-data-action-plan-v1",
  };
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });

  const supabase = createClient(url, publishableKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });

  const input = await request.json() as BriefingInput;
  if (!input.careerGoal?.trim() || !input.currentChallenge?.trim()) {
    return NextResponse.json({ error: "Objetivo e desafio atual são obrigatórios" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json(fallbackPlan(input));

  const prompt = `Você é um mentor sênior de carreira em Dados da FROM DATA. Gere um plano de ação realista, ético e explicável. Não prometa emprego nem resultados garantidos. O plano será revisado pelo mentor antes de ser compartilhado.\n\nBriefing:\n${JSON.stringify(input)}\n\nResponda somente JSON com: objective, diagnosisSummary, milestones[{title,deadline}], nextActions[{action,owner,timeframe}], successMetrics[], risks[].`;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) return NextResponse.json(fallbackPlan(input));
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return NextResponse.json(fallbackPlan(input));

  try {
    const plan = JSON.parse(text) as Omit<ActionPlan, "provider" | "model">;
    return NextResponse.json({ ...plan, provider: "gemini", model: "gemini-3.5-flash-lite" });
  } catch {
    return NextResponse.json(fallbackPlan(input));
  }
}
