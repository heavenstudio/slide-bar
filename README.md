# Slide Bar 📺

Plataforma de sinalização digital para restaurantes e bares com gerenciamento remoto de imagens.

## Início Rápido

### Pré-requisitos

- Docker Desktop (em execução)
- Node.js >= 18
- pnpm >= 8

### Instalação

```bash
# 1. Instalar dependências
pnpm install

# 2. Gerar cliente Prisma para macOS e Linux (necessário para testes E2E no Docker)
cd packages/backend
pnpm prisma:generate
cd ../..

# 3. Iniciar servidores de desenvolvimento (inicia o banco automaticamente)
pnpm start
```

**Pronto!** Acesse a aplicação em:

- 🌐 **Frontend:** http://localhost:5173
- 🔧 **Backend:** http://localhost:3000

### Parar Servidores

```bash
pnpm stop
```

---

## 📋 Comandos Disponíveis

| Comando                     | Descrição                                          |
| --------------------------- | -------------------------------------------------- |
| `pnpm start`                | Inicia servidores dev (frontend + backend + banco) |
| `pnpm stop`                 | Para todos os servidores dev                       |
| `pnpm build`                | Compila todos os pacotes para produção             |
| `pnpm test`                 | Executa todos os testes unitários                  |
| `pnpm test:watch`           | Executa testes em modo watch                       |
| `pnpm test:coverage`        | Executa testes com relatório de cobertura          |
| `pnpm test:e2e`             | Executa testes E2E (Playwright)                    |
| `pnpm test:e2e:ui`          | Executa testes E2E em modo UI                      |
| `pnpm test:e2e:show-report` | Visualiza último relatório de testes               |

---

## 🔌 Configuração de Portas

### Desenvolvimento

| Serviço        | Porta | URL                         |
| -------------- | ----- | --------------------------- |
| Frontend       | 5173  | http://localhost:5173       |
| Backend        | 3000  | http://localhost:3000       |
| Banco de Dados | 5432  | postgresql://localhost:5432 |

### Testes (E2E)

| Serviço              | Porta |
| -------------------- | ----- |
| Frontend de Teste    | 5174  |
| Backend de Teste     | 3001  |
| Relatório Playwright | 9323  |

---

## 🏗️ Stack Tecnológica

### Frontend

- React 18 + Vite
- React Router
- Tailwind CSS
- Vitest (testes)

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL
- Autenticação JWT
- Multer (upload de arquivos)
- Vitest (testes)

### Testes

- Vitest (testes unitários)
- Playwright (testes E2E)
- 37 testes unitários + 13 testes E2E

---

## 📁 Estrutura do Projeto

```
slide-bar/
├── packages/
│   ├── frontend/          # Aplicação React
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── lib/
│   │   └── tests/
│   └── backend/           # API Express
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── routes/
│       │   └── middleware/
│       └── tests/
├── scripts/               # Scripts dev/teste
├── e2e/                   # Testes E2E
└── docs/                  # Documentação adicional
```

---

## 🧪 Testes

### Executar Todos os Testes

```bash
pnpm test
```

### Cobertura de Testes

```bash
pnpm test:coverage
```

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

- ✅ 37 testes unitários (100% passando)
- ✅ 13 testes E2E (100% passando)
- ✅ Cobertura Frontend + Backend
- ⚡ E2E boot time: ~7 segundos (browsers pré-instalados no Docker)

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
# Abrir Prisma Studio (editor visual do BD)
cd packages/backend
pnpm prisma:studio

# Criar nova migration
pnpm prisma:migrate

# Gerar cliente Prisma
pnpm prisma:generate
```

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

Se você ver erros como "You installed esbuild for another platform" ou erros de plataforma do Prisma:

**Causa:** macOS e Linux (container Docker) requerem binários nativos diferentes para esbuild e Prisma.

**Solução:** O projeto está configurado para suportar ambas as plataformas:

- **esbuild**: `@esbuild/linux-arm64@0.21.5` instalado como dependência de dev
- **Prisma**: `binaryTargets = ["native", "linux-arm64-openssl-1.1.x"]` em `schema.prisma`

Se ainda encontrar problemas:

```bash
# Regenerar cliente Prisma para ambas as plataformas
cd packages/backend
pnpm prisma:generate

# Ou reinstalar dependências
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

- ✅ Autenticação JWT
- ✅ Suporte multi-organização
- ✅ Demo login para desenvolvimento

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

## 🚀 Deploy (Render.com)

O projeto está configurado para deploy automático no Render.com com PR previews.

### Deploy via Blueprint (Recomendado)

1. Acesse [render.com](https://render.com) e faça login
2. Conecte sua conta GitHub
3. Clique em **"New" → "Blueprint"**
4. Selecione o repositório `slide-bar`
5. Render detecta `render.yaml` automaticamente
6. Clique **"Apply"**

Isso criará automaticamente:

- PostgreSQL database (free tier, 1GB)
- Backend API service
- Frontend static site
- Persistent disk para uploads (1GB)

### Habilitar PR Previews

Para cada serviço (`slidebar-api` e `slidebar-web`):

1. Vá em **Settings** → **"Pull Request Previews"**
2. Ative **"Create previews automatically"**
3. Salvar

Agora cada PR terá um preview environment automático! 🎉

### Notas do Free Tier

⚠️ **Serviços dormem após 15 minutos de inatividade**

- Primeira requisição demora ~30-60s para acordar
- Perfeito para demos e staging
- Para produção com usuários reais, upgrade para Starter ($7/mês por serviço)

---

## 📝 Licença

UNLICENSED - Proprietário
