# Slide Bar 📺

Plataforma de sinalização digital para restaurantes e bares com gerenciamento remoto de imagens.

## 🚀 Demonstração ao Vivo

**Produção:** https://slide-bar.vercel.app

- **Dashboard:** Upload e gerenciamento de imagens
- **Player:** https://slide-bar.vercel.app/player
- **Credenciais Demo:**
  - Email: `demo@example.com`
  - Senha: `demo-password-123`

## Início Rápido

### Pré-requisitos

- Docker Desktop (em execução)
- Node.js >= 22.21.1 (LTS)
- pnpm >= 10.20.0

### Instalação

```bash
# 1. Instalar dependências
pnpm install

# 2. Iniciar servidores de desenvolvimento (inicia Supabase local automaticamente)
pnpm start
```

**Pronto!** Acesse a aplicação em:

- 🌐 **Frontend:** http://localhost:5173
- 🔧 **Supabase Studio:** http://localhost:54323

### Parar Servidores

```bash
pnpm stop
```

---

## 📋 Comandos Disponíveis

| Comando                     | Descrição                                         |
| --------------------------- | ------------------------------------------------- |
| `pnpm start`                | Inicia frontend + Supabase local (stack completo) |
| `pnpm dev`                  | Inicia apenas frontend (requer Supabase rodando)  |
| `pnpm stop`                 | Para todos os servidores                          |
| `pnpm build`                | Compila frontend para produção                    |
| `pnpm type-check`           | Verifica erros de tipo TypeScript                 |
| `pnpm test`                 | Executa testes unitários (85 testes)              |
| `pnpm test:watch`           | Executa testes em modo watch                      |
| `pnpm test:coverage`        | Testes unitários com cobertura                    |
| `pnpm coverage:all`         | Cobertura completa (unit + E2E + merge)           |
| `pnpm test:e2e`             | Executa testes E2E (16 testes)                    |
| `pnpm test:e2e:ui`          | Executa testes E2E em modo UI                     |
| `pnpm test:e2e:show-report` | Visualiza último relatório de testes              |
| `pnpm lint`                 | Verifica erros de ESLint                          |
| `pnpm format`               | Formata código com Prettier                       |

---

## 🔌 Configuração de Portas

### Desenvolvimento

| Serviço         | Porta | URL                          |
| --------------- | ----- | ---------------------------- |
| Frontend        | 5173  | http://localhost:5173        |
| Supabase API    | 54321 | http://localhost:54321       |
| Supabase Studio | 54323 | http://localhost:54323       |
| PostgreSQL      | 54322 | postgresql://localhost:54322 |

### Testes (E2E)

| Serviço              | Porta | URL                    |
| -------------------- | ----- | ---------------------- |
| Frontend de Teste    | 5174  | http://localhost:5174  |
| Supabase API (TEST)  | 55321 | http://localhost:55321 |
| Relatório Playwright | 9323  | http://localhost:9323  |

---

## 🏗️ Stack Tecnológica

### Frontend

- React 19 + Vite 7 + **TypeScript**
- React Router 7
- Tailwind CSS v4
- Vitest 4.0.8 (testes unitários)
- Playwright 1.56 (testes E2E)

### Backend

- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- Supabase TypeScript Client com tipos auto-gerados

### Testes e Qualidade

- **TypeScript** com strict mode habilitado
- **Vitest 4.0.8** (testes unitários e de integração)
- **Playwright 1.56** (testes E2E)
- **ESLint 9** + **Prettier 3.6** (linting e formatação)
- 85 testes unitários + 16 testes E2E = 101 testes totais
- ~97% de cobertura combinada

---

## 📁 Estrutura do Projeto

```
slide-bar/
├── config/                # Configurações de build/teste
│   ├── vite.config.ts     # Configuração Vite
│   ├── vitest.config.ts   # Configuração Vitest (testes unitários)
│   ├── playwright.config.ts # Configuração Playwright (E2E)
│   └── docker-compose.test.yml # Infraestrutura de testes Docker
├── docs/                  # Documentação adicional
├── scripts/               # Scripts dev/teste (TypeScript)
│   ├── check-coverage.ts  # Validação de cobertura de testes
│   └── merge-coverage.ts  # Mesclagem de cobertura Vitest+Playwright
├── src/                   # Aplicação React + TypeScript
│   ├── components/        # Componentes React (.tsx)
│   ├── pages/             # Páginas (Dashboard, Player)
│   ├── lib/               # Cliente Supabase, utilitários (.ts)
│   └── types/             # Tipos TypeScript (database, supabase)
├── supabase/              # Configuração Supabase (migrations, functions)
├── tests/                 # Todos os testes (.test.tsx, .spec.ts)
│   ├── config/            # Configuração de testes
│   ├── e2e/               # Testes E2E (specs/, fixtures/, support/)
│   ├── helpers/           # Helpers compartilhados (limpeza DB)
│   └── unit/              # Testes unitários (lib/, components/, pages/)
├── tsconfig.json          # Configuração TypeScript (strict mode)
├── eslint.config.js       # Configuração ESLint (bloqueia arquivos .js)
├── postcss.config.js      # Configuração PostCSS/Tailwind
└── vercel.json            # Configuração de deploy Vercel
```

---

## 🧪 Testes

### Executar Todos os Testes

```bash
pnpm test
```

### Cobertura de Testes

```bash
# Cobertura dos testes unitários/integração (Vitest)
pnpm test:coverage

# Cobertura dos testes E2E com instrumentação (Playwright)
pnpm test:e2e:coverage

# Mesclar coberturas de Vitest + Playwright
pnpm coverage:merge

# Verificar thresholds de cobertura
pnpm coverage:check

# Verificação rápida (apenas Vitest, ~5s)
pnpm coverage:quick

# Cobertura completa: unit + E2E + merge + check (~60s)
pnpm coverage:all
```

**Cobertura Combinada**: O projeto suporta combinação de cobertura de testes unitários (Vitest) e E2E (Playwright) para uma visão completa:

- **Vitest**: ~94% de cobertura em testes unitários (~5s)
- **Playwright**: Cobertura adicional via E2E (~10s)
- **Combinada**: ~97% linhas, ~94% statements, ~77% branches, ~94% functions

**Comandos recomendados**:

- Desenvolvimento local: `pnpm coverage:quick` (apenas Vitest, rápido)
- Antes de criar PR: `pnpm coverage:all` (completo com E2E)

A cobertura combinada é gerada em `.test-output/merged-coverage/` e inclui relatórios em JSON e HTML.

### Testes E2E

```bash
# Executar testes E2E (inicia servidores automaticamente)
pnpm test:e2e

# Executar em modo UI para debug
pnpm test:e2e:ui

# Visualizar último relatório
pnpm test:e2e:show-report
```

**Estatísticas de Testes:**

- ✅ 85 testes unitários (100% passando, ~5s)
- ✅ 16 testes E2E (100% passando, ~10s)
- ✅ ~97% de cobertura combinada
- ⚡ Total: 101 testes em ~15 segundos

---

## 🔧 Fluxo de Desenvolvimento

### Visualizar Logs

```bash
# Logs do frontend
tail -f /tmp/vite-dev.log

# Logs do backend
tail -f /tmp/backend-dev.log
```

### Gerenciamento do Banco de Dados

```bash
# Abrir Supabase Studio (editor visual do BD)
# Acesse: http://localhost:54323

# Criar nova migration
supabase migration new nome_da_migration

# Aplicar migrations
supabase db push

# Reset do banco (cuidado!)
supabase db reset
```

### Gerenciamento de Usuários

```bash
# Abrir Supabase Studio
# Acesse: http://localhost:54323

# Navegar para Authentication > Users
# - Criar novos usuários
# - Editar usuários existentes
# - Gerenciar roles e permissões
# - Visualizar sessões ativas

# Usuário demo padrão:
# Email: demo@example.com
# Senha: demo-password-123
```

**Nota**: Gerenciamento de usuários é feito diretamente no Supabase Studio ou via Supabase CLI, não há interface de administração na aplicação.

---

## 🐛 Resolução de Problemas

### Docker não está em execução

Se você ver erros de conexão com o banco de dados:

```bash
# 1. Inicie o Docker Desktop
# 2. Reinicie os servidores
pnpm stop && pnpm start
```

### Porta já em uso

```bash
# Encontrar e matar processo na porta
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:3000 | xargs kill -9  # Backend
```

### Reinício limpo

```bash
pnpm stop
rm -f /tmp/*dev*.log /tmp/*dev*.pid
pnpm start
```

### Erros de binários específicos de plataforma (testes E2E Docker)

Se você ver erros como "You installed esbuild for another platform":

**Causa:** macOS e Linux (container Docker) requerem binários nativos diferentes para esbuild.

**Solução:** O projeto está configurado para suportar ambas as plataformas:

- **esbuild**: `@esbuild/linux-arm64@0.25.12` instalado como dependência de dev
- **Rollup**: `@rollup/rollup-darwin-arm64` para macOS ARM

Se ainda encontrar problemas:

```bash
# Reinstalar dependências
pnpm install
```

**Nota:** Ambos os binários de plataforma coexistem em node_modules. macOS usa binários darwin-arm64, container Docker usa linux-arm64.

---

## 📚 Documentação Adicional

- **[Análise de Mercado](docs/analise-inicial.md)** - Pesquisa de mercado e negócios
- **[Contexto Claude](.claude/CLAUDE.md)** - Contexto do projeto para assistente IA
- **[Configuração DevContainer](.devcontainer/README.md)** - Ambiente de desenvolvimento Docker

---

## 🎯 Funcionalidades Atuais

**Gerenciamento de Imagens:**

- ✅ Upload de imagens (JPEG, PNG)
- ✅ Dashboard de gerenciamento de imagens
- ✅ Exibição em grade de imagens
- ✅ Exclusão de imagens
- ✅ Validação de arquivos (tipo, tamanho)

**Player/Slideshow:**

- ✅ Visualização fullscreen em /player (público, sem auth)
- ✅ Rotação automática a cada 5 segundos
- ✅ Indicador de progresso
- ✅ Controles de teclado (espaço para pausar, setas para navegar)
- ✅ Auto-refresh a cada 5 minutos
- ✅ Estado vazio quando não há imagens

**Infraestrutura:**

- ✅ **TypeScript** com strict mode e tipos auto-gerados do Supabase
- ✅ **Configurações organizadas**: build/teste em `config/`, tooling na raiz
- ✅ **Proteção de qualidade**: ESLint bloqueia arquivos JavaScript (.js/.jsx)
- ✅ Supabase Auth (demo login: demo@example.com / demo-password-123)
- ✅ Supabase Storage (armazenamento de imagens)
- ✅ Supabase PostgreSQL (banco de dados)
- ✅ Suporte multi-organização

---

## 🗺️ Roadmap

### 📍 Fase 1 - MVP SaaS (Próximos 6-12 meses)

**Gestão de Conteúdo:**

- [ ] Biblioteca de templates prontos (menus, promoções, eventos)
- [ ] Agendamento de conteúdo por horário/dia da semana
- [ ] Suporte a vídeos curtos (MP4, WebM)
- [ ] Editor de slides com transições
- [ ] Múltiplas telas por organização
- [ ] Playlists de conteúdo

**Exibição (Player):**

- [x] Player básico fullscreen com rotação automática
- [x] Controles de teclado (espaço, setas)
- [ ] Aplicação player para TV/Chromecast
- [ ] Modo offline (cache de conteúdo)
- [ ] Transições animadas entre slides
- [ ] Controle remoto de tempo de exibição

**Interface e UX:**

- [ ] Interface mobile-first (gestão pelo celular)
- [ ] Onboarding guiado para novos usuários
- [ ] Preview em tempo real do conteúdo

**Analytics Básico:**

- [ ] Contador de impressões por slide
- [ ] Tempo médio de exibição
- [ ] Relatórios semanais automáticos

**Planos e Pagamento:**

- [ ] Sistema de assinaturas (Stripe/Mercado Pago)
- [ ] 2-3 planos de preço escalonados
- [ ] Período de trial gratuito

### 📍 Fase 2 - Crescimento (12-24 meses)

**Multi-localização:**

- [ ] Gestão centralizada de múltiplas unidades
- [ ] Dashboard consolidado por rede/franquia
- [ ] Personalização de conteúdo por localização

**Integrações:**

- [ ] API pública para integrações
- [ ] Webhook para eventos
- [ ] Integração com sistemas de PDV (iFood, Rappi)
- [ ] Sincronização automática de cardápios

**Analytics Avançado:**

- [ ] Correlação de conteúdo com horários de pico
- [ ] A/B testing de slides
- [ ] Heatmap de engajamento por horário
- [ ] Exportação de relatórios (PDF, Excel)

**White Label:**

- [ ] Marca customizada por cliente enterprise
- [ ] URLs personalizadas
- [ ] Temas customizáveis

### 📍 Fase 3 - Marketplace (24+ meses)

**Sistema de Anúncios:**

- [ ] Marketplace de anúncios para marcas/fornecedores
- [ ] Segmentação geográfica de anúncios
- [ ] Revenue share com estabelecimentos
- [ ] Dashboard para anunciantes
- [ ] CPM tracking e billing

**Inteligência e Automação:**

- [ ] Sugestões de conteúdo via IA
- [ ] Biblioteca de imagens integrada (Unsplash/Pexels)
- [ ] Geração automática de slides com IA
- [ ] Calendário automático (datas comemorativas)

**Enterprise Features:**

- [ ] SLA customizado
- [ ] Suporte 24/7
- [ ] Gestor de conta dedicado
- [ ] Treinamento presencial

---

## 🚀 Deploy (Supabase + Vercel)

O projeto usa **Supabase** para backend (database, auth, storage) e **Vercel** para frontend.

### Pré-requisitos

1. Conta no [Supabase](https://supabase.com) (gratuita)
2. Conta no [Vercel](https://vercel.com) (gratuita)
3. Supabase CLI instalado: `brew install supabase/tap/supabase`

### Passo 1: Setup Supabase

1. Crie um novo projeto no [Supabase Dashboard](https://app.supabase.com)
2. Obtenha as credenciais do projeto:
   - Project URL (ex: `https://xxx.supabase.co`)
   - Anon/Public Key (ex: `eyJhbGc...`)
3. Execute as migrations localmente e envie para o cloud:

```bash
# Logar no Supabase
supabase login

# Link com seu projeto (você será solicitado a escolher o projeto)
supabase link

# Push das migrations para o cloud
supabase db push
```

### Passo 2: Deploy no Vercel

1. Instale a CLI do Vercel: `npm i -g vercel`
2. Faça deploy do frontend:

```bash
# Deploy do frontend (na raiz do projeto)
vercel
```

3. Configure as variáveis de ambiente no Vercel Dashboard:

```bash
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

4. Redesploy após configurar as variáveis:

```bash
vercel --prod
```

### Deploy Automatizado (GitHub Integration)

1. Conecte seu repositório ao Vercel via GitHub
2. Configure as variáveis de ambiente no Vercel Dashboard
3. Cada push para `main` fará deploy automático
4. Cada PR criará um preview deployment automático

### Free Tier

Ambos os serviços possuem planos gratuitos generosos:

- **Supabase Free**: 500MB database, 1GB storage, 50K MAU
- **Vercel Hobby**: Unlimited deployments, 100GB bandwidth/mês

Perfeito para MVPs e projetos pequenos! 🎉

---

## ⚙️ CI/CD e Automação de Migrations

### GitHub Actions

O projeto possui workflows automatizados:

1. **PR Checks** (`.github/workflows/pr-checks.yml`):
   - Validação de lint e formatação
   - Testes unitários e E2E
   - Verificação de cobertura

2. **Deploy Migrations** (`.github/workflows/deploy-migrations.yml`):
   - Executa automaticamente após merge para `main`
   - Aplica migrations no Supabase production
   - Verifica status das migrations

### Configurar GitHub Secrets

Para habilitar o deploy automático de migrations, configure os seguintes secrets no GitHub:

1. Acesse: `Settings > Secrets and variables > Actions > New repository secret`

2. Adicione os seguintes secrets:

| Secret                  | Descrição                   | Como obter                                                                                    |
| ----------------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | Token de acesso ao Supabase | [Supabase Dashboard](https://app.supabase.com) > Account > Access Tokens > Generate new token |
| `SUPABASE_PROJECT_REF`  | Referência do projeto       | Da URL do projeto (ex: `cdpxkskbpntoiarhtyuj` de `https://cdpxkskbpntoiarhtyuj.supabase.co`)  |

3. Após configurar, o workflow executará automaticamente quando migrations forem mescladas em `main`

### Workflow Manual de Migrations

Se preferir executar migrations manualmente:

```bash
# 1. Logar no Supabase
supabase login

# 2. Link com projeto de produção
supabase link --project-ref YOUR_PROJECT_REF

# 3. Push das migrations
supabase db push --include-all

# 4. Verificar status
supabase migration list
```

### Rollback de Migrations

Se uma migration causar problemas em produção:

**Opção 1: Criar migration de reversão (recomendado)**

```bash
# 1. Criar nova migration que reverte as mudanças
supabase migration new revert_problematic_changes

# 2. Editar o arquivo SQL para reverter as mudanças
# Por exemplo: DROP TABLE, ALTER TABLE, etc.

# 3. Testar localmente
supabase db reset && supabase db push

# 4. Fazer commit e push - workflow aplicará automaticamente
git add supabase/migrations/
git commit -m "revert: rollback problematic migration"
git push
```

**Opção 2: Reparar histórico de migrations (emergência)**

```bash
# CUIDADO: Use apenas em emergências!
# Isso marca migrations como não aplicadas sem reverter os dados

# 1. Link com produção
supabase link --project-ref YOUR_PROJECT_REF

# 2. Verificar status
supabase migration list

# 3. Reparar (marcar migration como não aplicada)
supabase migration repair <timestamp>_migration_name --status reverted

# 4. Você ainda precisará reverter manualmente as mudanças no schema!
```

**Nota**: Sempre prefira criar uma migration de reversão ao invés de usar `migration repair`. O repair não reverte os dados, apenas o histórico.

---

## 📝 Licença

UNLICENSED - Proprietário
