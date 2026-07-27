import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Sails landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Sails — Você guia a jornada<\/title>/i);
  assert.match(html, /Você guia a jornada/);
  assert.match(html, /A Sails cuida do resto/);
  assert.match(html, /href="\/portal"/);
  assert.match(html, /Cursos &amp; trilhas/);
  assert.match(html, /Funil &amp; leads/);
});

test("server-renders the platform portal", async () => {
  const response = await render("/portal");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Sails/);
  assert.match(html, /Bom dia, Diego/);
  assert.match(html, /Cursos/);
  assert.match(html, /Marketing/);
  assert.match(html, /Agenda/);
  assert.match(html, /Negócio/);
});

test("server-renders the FROM DATA landing page", async () => {
  const response = await render("/from-data");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /FROM DATA/);
  assert.match(html, /Every career/);
  assert.match(html, /starts with a/);
  assert.match(html, /\+100/);
  assert.match(html, /Postal Saúde/);
  assert.match(html, /Vertem Engagement/);
  assert.match(html, /anteriormente LTM/);
  assert.doesNotMatch(html, /LTM Fidelidade/);
  assert.match(html, /Banco do Brasil/);
  assert.match(html, /from-data-wordmark\.png/);
  assert.doesNotMatch(html, /from-data-logo\.png/);
  assert.match(html, /href="\/from-data\/agendar"/);
});

test("server-renders the FROM DATA booking briefing", async () => {
  const response = await render("/from-data/agendar");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /BRIEF CALL/i);
  assert.match(html, /Conte sobre o seu momento/);
  assert.match(html, /from-data-wordmark\.png/);
  assert.doesNotMatch(html, /from-data-logo\.png/);
  assert.match(html, /Escolha um hor/);
  assert.match(html, /Consultando agenda/);
  assert.match(html, /Agendar brief call/);
  assert.match(html, /Voltar para a página/);
  assert.match(html, /Prefiro continuar pelo WhatsApp/);
  assert.match(html, /WhatsApp com DDD/);
});
