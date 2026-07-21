import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "Vela — A mentoria nunca apaga",
    description: "A plataforma de mentoria que avisa antes do aluno desistir — não depois.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    robots: { index: false, follow: false },
    openGraph: {
      title: "Vela — A mentoria nunca apaga",
      description: "Detectar, explicar e agir antes do aluno desistir.",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vela — A mentoria que avisa antes do aluno desistir" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Vela — A mentoria nunca apaga",
      description: "Detectar, explicar e agir antes do aluno desistir.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
