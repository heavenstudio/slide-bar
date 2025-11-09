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
- Node.js >= 18
- pnpm >= 8

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

| Comando                     | Descrição                               |
| --------------------------- | --------------------------------------- |
| `pnpm start`                | Inicia frontend + Supabase local        |
| `pnpm stop`                 | Para todos os servidores                |
| `pnpm build`                | Compila frontend para produção          |
| `pnpm test`                 | Executa testes unitários (85 testes)    |
| `pnpm test:watch`           | Executa testes em modo watch            |
| `pnpm test:coverage`        | Testes unitários com cobertura          |
| `pnpm coverage:all`         | Cobertura completa (unit + E2E + merge) |
| `pnpm test:e2e`             | Executa testes E2E (16 testes)          |
| `pnpm test:e2e:ui`          | Executa testes E2E em modo UI           |
| `pnpm test:e2e:show-report` | Visualiza último relatório de testes    |

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

- React 18 + Vite
- React Router
- Tailwind CSS
- Vitest (testes)

### Backend

- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- Supabase JavaScript Client
- ~Node.js + Express (legacy, sendo removido)~

### Testes

- Vitest (testes unitários e de integração)
- Playwright (testes E2E)
- 85 testes unitários + 16 testes E2E = 101 testes totais
- ~97% de cobertura combinada

---

## 📁 Estrutura do Projeto

```
slide-bar/
├── docs/                  # Documentação adicional
├── scripts/               # Scripts dev/teste
├── src/                   # Aplicação React
│   ├── components/        # Componentes React
│   ├── pages/             # Páginas (Dashboard, Player)
│   └── lib/               # Cliente Supabase, utilitários
├── supabase/              # Configuração Supabase (migrations, functions)
├── tests/                 # Todos os testes
│   ├── config/            # Configuração de testes
│   ├── e2e/               # Testes E2E (specs/, fixtures/, support/)
│   ├── helpers/           # Helpers compartilhados (limpeza DB)
│   └── unit/              # Testes unitários (lib/, components/, pages/)
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

- **esbuild**: `@esbuild/linux-arm64@0.21.5` instalado como dependência de dev
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

- ✅ Supabase Auth (demo login: demo@example.com / demo-password-123)
- ✅ Supabase Storage (armazenamento de imagens)
- ✅ Supabase PostgreSQL (banco de dados)
- ✅ Suporte multi-organização
- 🔄 Migração Express → Supabase em andamento (ver `spec/migrate-to-supabase.md`)

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

## 📝 Licença

UNLICENSED - Proprietário
