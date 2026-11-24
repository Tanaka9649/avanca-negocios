# Avança Negócios

Site institucional e painel da Avança Negócios: página principal, Eventos e Networking, e Compra e Venda de Empresas.

A plataforma imobiliária (Avança Imóveis) é um projeto separado, `Tanaka9649/Avan-aimoveis`. Este repositório não acessa o banco nem os usuários dela. A integração é só de navegação: o botão "Avança Imóveis" leva a `NEXT_PUBLIC_IMOVEIS_URL` (futuro `imoveis.avancanegocios.com.br`).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion, Drizzle ORM, Neon PostgreSQL, Zod e Lucide. Deploy na Vercel, região `gru1`.

Drizzle no lugar de Prisma, para usar o mesmo ORM da plataforma imobiliária.

## Banco (Neon)

Projeto Neon próprio: `avanca-negocios` (`restless-brook-09093482`, região São Paulo).

| Branch | Uso |
| --- | --- |
| `production` | Produção. Recebe somente migrations revisadas. |
| `development` | Desenvolvimento local e testes. |

`DATABASE_URL` usa a URL pooled; `DIRECT_URL`, a direct, só para migrations. Nunca use `drizzle-kit push` em produção.

## Desenvolvimento

1. `cp .env.example .env.local` e preencha com a branch `development`.
2. `npm ci`
3. `npm run dev`

Antes de abrir PR: `npm run typecheck && npm run lint && npm run build`.

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Porta de entrada com as três operações |
| `/eventos` | Grupo de networking empresarial de Frutal |
| `/compra-e-venda-de-empresas` | Captação de interessados em vender ou comprar empresas |
| `/privacidade` | Política de Privacidade |
| `/api/leads` | Gravação dos formulários (validação, honeypot, rate limit, consentimento) |
| `/api/whatsapp-click` | Contagem de cliques no WhatsApp, sem dados pessoais |
| `/admin` | Painel: dashboard, CRM, eventos, empresas, conteúdo, usuários e configurações |
| `/admin/primeiro-acesso` | Criação do primeiro administrador (exige `ADMIN_SETUP_TOKEN`; fecha após o uso) |
| `/midia/[id]` | Imagens enviadas pelo painel, otimizadas em WebP |

## Regras de conteúdo

- Nada de números, prêmios, cases, depoimentos ou empresas fictícias.
- Empresas participantes e próximos encontros só aparecem quando cadastrados e publicados no painel; sem cadastro, a seção não é exibida.
- Eventos de conversão (`generate_lead`, `whatsapp_click`) disparam só após a confirmação da ação e nunca levam dados do formulário.

## Painel

Perfis: Administrador (tudo), Gestor (tudo menos usuários), Atendimento (dashboard e leads), Editor de conteúdo (eventos, empresas e conteúdo). As permissões são verificadas no servidor em cada página e ação. Os usuários do painel não acessam a plataforma da Avança Imóveis.

Imagens ficam na tabela `media_assets`, já convertidas para WebP. O Neon Object Storage não está disponível na região de São Paulo e a criação de um Vercel Blob foi negada para a conexão usada no desenvolvimento; se o volume crescer, migre para Vercel Blob.

## Testes locais sem rede

`node scripts/pglite-server.mjs /tmp/an-pglite 54329` sobe um Postgres local (PGlite) com as migrations. Use `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/postgres` no `.env.local`.
