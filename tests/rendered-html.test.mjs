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
  assert.match(html, /Financeiro/);
});
