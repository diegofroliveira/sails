# Supabase — Sails

Este projeto usa o Supabase para autenticação e dados da plataforma. O schema inicial está em
`supabase/migrations/20260722115347_initial_sails_schema.sql`.

## Configuração local

1. Copie `.env.example` para `.env.local`.
2. Preencha apenas as variáveis necessárias. Nunca envie `SUPABASE_SERVICE_ROLE_KEY` ou a senha
   do banco ao Git.
3. Instale as dependências com `npm install`.
4. Para executar a stack local, instale e inicie o Docker e rode `npm run supabase:start`.

## Conectar ao projeto remoto

Autentique-se com uma conta que tenha acesso ao projeto e execute:

```powershell
npx supabase login
npx supabase link --project-ref lyhcvjyuwndcvyofzmjt
npx supabase db push --dry-run
npm run supabase:push
```

Revise sempre a saída do `--dry-run` antes de aplicar uma migração em produção. Depois do link,
gere os tipos do banco com `npm run supabase:types`.

## Segurança do schema

- Todas as tabelas expostas têm Row Level Security habilitado.
- O acesso é isolado por organização e função (`owner`, `admin`, `mentor`, `support`, `finance`).
- Pedidos, transações e razão financeira têm políticas mais restritas.
- Lançamentos no razão são imutáveis; correções devem ser feitas por lançamentos compensatórios.
- Processamento de webhooks deve ocorrer somente no servidor, usando credenciais secretas.
