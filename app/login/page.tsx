"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("diego.fjddf@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("E-mail ou senha inválidos. Confira os dados e tente novamente.");
      setLoading(false);
      return;
    }

    window.location.assign("/portal");
  }

  return (
    <main className="fd-login-page">
      <section className="fd-login-brand">
        <Link href="/" className="fd-back">← Voltar para Sails</Link>
        <div className="fd-brand-copy">
          <span className="fd-code-label">SELECT career FROM data;</span>
          <Image src="/from-data-logo.png" alt="FROM DATA" width={560} height={560} priority />
          <p>Every career starts with a FROM.</p>
        </div>
        <small>Ambiente piloto · Powered by Sails</small>
      </section>

      <section className="fd-login-panel">
        <form onSubmit={signIn}>
          <span className="fd-eyebrow">ÁREA DO MENTOR</span>
          <h1>Bem-vindo, Diego.</h1>
          <p>Acesse sua operação, agenda e planos de ação da FROM DATA.</p>

          <label>
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>

          {error && <div className="fd-auth-error" role="alert">{error}</div>}

          <button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar na FROM DATA →"}</button>
          <small>Conta protegida pelo Supabase Auth.</small>
        </form>
      </section>
    </main>
  );
}
