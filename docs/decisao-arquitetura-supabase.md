# Decisão de Arquitetura: Migração para Supabase

**Data**: Novembro 2025
**Status**: Em Planejamento

## Contexto

O projeto Slide Bar foi inicialmente arquitetado com:

- **Frontend**: React + Vite (hospedado como site estático)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL via Prisma ORM
- **Autenticação**: JWT customizada
- **Storage**: Sistema de arquivos local (`/tmp/uploads`)

Esta arquitetura funcionava bem para desenvolvimento local, mas apresenta desafios significativos para deployment em produção gratuita.

## Problema: Colapso das Free Tiers

### Pesquisa de Mercado (Novembro 2025)

Realizamos uma pesquisa abrangente das opções de hospedagem gratuita para aplicações Node.js + PostgreSQL:

#### **Heroku**

- ❌ **Free tier eliminado em 2022**
- Custo mínimo: ~$7-10/mês

#### **Render.com**

- ⚠️ **Free tier existe MAS:**
  - Não suporta `plan: free` via blueprints (apenas setup manual)
  - Web services dormem após 15 min de inatividade
  - Banco de dados free é **deletado após 90 dias**
  - Sem discos persistentes no free tier
- **Custo pago**: $19/mês (backend $9 + database $10)

#### **Railway**

- ⚠️ **Apenas $5 de crédito único**
- Depois do crédito, requer plano Hobby ($5/mês base)
- Modelo pay-as-you-go pode ultrapassar os $5 incluídos

#### **Fly.io**

- ❌ **Free tier eliminado em outubro 2024**
- Pay-per-second desde o início
- Estimativa: $2-5/mês para uso mínimo

#### **Koyeb**

- ⚠️ **Free tier muito limitado:**
  - Database apenas 5 horas/mês de tempo ativo
  - Auto-sleep agressivo

#### **Google Cloud Platform (GCP)**

- ⚠️ **$300 de crédito por 3 meses apenas**
- Always Free tier não inclui Cloud SQL (PostgreSQL)
- Custo após trial

### Conclusão da Pesquisa

**O cenário de hospedagem gratuita colapsou entre 2022-2024.** Praticamente todas as plataformas eliminaram ou restringiram severamente seus free tiers.

## Opções Consideradas

### Opção 1: Vercel + Neon (Híbrido)

**Arquitetura:**

```
Frontend: Vercel (static site)
Backend: Vercel Serverless Functions (Node.js)
Database: Neon PostgreSQL (apenas database)
Storage: Precisa solução separada (problema!)
```

**Prós:**

- ✅ 100% gratuito dentro dos limites
- ✅ Vercel tem excelente DX
- ✅ Neon oferece 0.5GB storage + 191 compute hours/mês
- ✅ Fácil de começar

**Contras:**

- ❌ **Problema de storage não resolvido** - uploads continuam efêmeros
- ⚠️ Requer migração para serverless functions
- ⚠️ Duas plataformas para gerenciar

**Custo:** $0/mês
**Score:** 6/10

---

### Opção 2: Vercel + Neon + Supabase Storage (Híbrido Complexo)

**Arquitetura:**

```
Frontend: Vercel (static site)
Backend: Vercel Serverless Functions
Database: Neon PostgreSQL
Storage: Supabase Storage
```

**Prós:**

- ✅ 100% gratuito
- ✅ Storage persistente resolvido
- ✅ CDN global para imagens

**Contras:**

- ⚠️ **Três plataformas diferentes** para gerenciar
- ⚠️ Complexidade de setup aumentada
- ⚠️ Múltiplos pontos de falha

**Custo:** $0/mês
**Score:** 7/10

---

### Opção 3: Render (Setup Manual)

**Arquitetura:**

```
Frontend: Render Static Site (free)
Backend: Render Web Service (free, manual)
Database: Render PostgreSQL (free, 90 dias)
Storage: Sistema de arquivos (efêmero)
```

**Prós:**

- ✅ Gratuito (dentro dos limites)
- ✅ Arquitetura tradicional (Express mantido)
- ✅ Setup familiar

**Contras:**

- ❌ **Database deletado após 90 dias**
- ❌ **Storage efêmero** (uploads perdidos no restart)
- ⚠️ Services dormem após 15 min
- ⚠️ Blueprint não funciona (setup 100% manual)

**Custo:** $0/mês (mas precário)
**Score:** 4/10

---

### Opção 4: Railway Hobby Plan

**Arquitetura:**

```
Frontend: Railway
Backend: Railway (auto-sleep)
Database: Railway PostgreSQL
```

**Prós:**

- ✅ Arquitetura tradicional mantida
- ✅ Auto-sleep economiza custos
- ✅ Boa DX

**Contras:**

- ❌ **Não é gratuito** - mínimo $5/mês
- ⚠️ Pode ultrapassar $5 com uso moderado
- ⚠️ Storage efêmero continua sendo problema

**Custo:** $5-7/mês
**Score:** 5/10

---

### Opção 5: Full Supabase (Escolha Final) 🏆

**Arquitetura:**

```
Frontend: Vercel Static Site (ou Supabase hosting)
Backend: Supabase Edge Functions + Direct Client Calls
Database: Supabase PostgreSQL
Storage: Supabase Storage
Auth: Supabase Auth
Realtime: Supabase Realtime (bonus!)
```

**Prós:**

- ✅ **100% gratuito** - 500MB DB + 1GB storage
- ✅ **Storage persistente** com CDN global
- ✅ **Autenticação production-ready** (JWT, sessions, OAuth)
- ✅ **Realtime incluído** - slideshow atualiza instantaneamente
- ✅ **Row Level Security (RLS)** - segurança no database
- ✅ **Plataforma única** - um dashboard, uma conta
- ✅ **Desenvolvimento local completo** via Supabase CLI
- ✅ **CI/CD friendly** - GitHub Actions suportado
- ✅ **Open source** - pode self-host se necessário
- ✅ **Menos código** - client direto do frontend

**Contras:**

- ⚠️ Edge Functions usam Deno (não Node.js) - mas sintaxe similar
- ⚠️ Vendor lock-in moderado (mas mitigado por ser open source)
- ⚠️ Curva de aprendizado para RLS e patterns Supabase

**Custo:** $0/mês
**Score:** 9.5/10

## Decisão: Full Supabase

### Justificativa

Escolhemos **Full Supabase** pelos seguintes motivos:

#### 1. **Resolve TODOS os problemas críticos**

**Storage Persistente:**

- Atual: Uploads em `/tmp` são perdidos no restart
- Supabase: 1GB de storage persistente com CDN global
- Transformações de imagem on-the-fly incluídas

**Autenticação:**

- Atual: JWT customizada básica, insegura
- Supabase: Sistema de auth production-ready com sessions, refresh tokens, OAuth

**Realtime:**

- Atual: Polling a cada 5 minutos no player
- Supabase: Updates instantâneos via WebSockets

#### 2. **Arquitetura Ideal para o Caso de Uso**

O Slide Bar é uma aplicação **perfeita** para Supabase:

- ✅ Modelo de dados simples (organizations, images)
- ✅ Operações CRUD básicas
- ✅ Upload de arquivos central
- ✅ Beneficia-se de realtime
- ✅ Multitenancy via organizações (perfeito para RLS)

**Não precisamos de:**

- ❌ Backend complexo com lógica de negócio pesada
- ❌ Processamento assíncrono de jobs
- ❌ Integrações com múltiplos serviços externos

#### 3. **Desenvolvimento e Testes**

**Supabase oferece suporte excepcional para TDD:**

```bash
# Local stack completo em Docker
supabase start

# Migrations como código
supabase migration new feature_x

# Testes unitários contra APIs reais
pnpm test  # usa Supabase local

# CI/CD com GitHub Actions
# (Supabase CLI roda no CI)
```

**Fluxo TDD mantido intacto:**

1. Escrever teste (fail)
2. Implementar feature
3. Teste passa
4. CI valida automaticamente

#### 4. **Custo Zero Sustentável**

**Supabase Free Tier:**

- 500MB database storage
- 1GB file storage
- 2GB bandwidth/mês
- Ilimitadas API requests
- Ilimitadas conexões realtime
- Edge Functions incluídas

**Para nosso caso de uso (MVP/testes):**

- ~100 imagens (média 500KB) = 50MB
- ~10 organizações = <1MB database
- Tráfego estimado: <500MB/mês

**Conclusão:** Ficamos confortavelmente dentro do free tier por meses/anos.

#### 5. **Experiência do Desenvolvedor (DX)**

```javascript
// ANTES: Express + Multer + JWT
app.post('/api/images', authMiddleware, upload.single('file'), async (req, res) => {
  // 50 linhas de código...
});

// DEPOIS: Supabase
const { data } = await supabase.storage.from('images').upload('slide.jpg', file);

await supabase.from('images').insert({ name, url: data.path }).select().single();

// RLS cuida da segurança automaticamente!
```

**Menos código = menos bugs = mais rápido.**

#### 6. **Roadmap Futuro**

Features do roadmap que se beneficiam do Supabase:

**Fase 1 (MVP):**

- ✅ Realtime updates no player (já incluído)
- ✅ Multi-organização (RLS nativo)
- ✅ Storage persistente com CDN

**Fase 2 (Crescimento):**

- ✅ Gestão de múltiplas unidades (RLS por localização)
- ✅ Permissões granulares (RLS policies)
- ✅ Webhooks nativos

**Fase 3 (Marketplace):**

- ✅ Auth OAuth para anunciantes
- ✅ Realtime para notificações
- ✅ Storage para materiais de marketing

## Arquitetura Detalhada

### Camadas da Aplicação

```
┌─────────────────────────────────────────────┐
│  FRONTEND (Vercel - Static React App)       │
│  - React 18 + Vite                          │
│  - Tailwind CSS                             │
│  - Supabase JS Client                       │
└─────────────────────────────────────────────┘
                    ↓ HTTPS
┌─────────────────────────────────────────────┐
│  SUPABASE CLOUD                             │
│  ┌─────────────────────────────────────┐   │
│  │  PostgREST (Auto-generated API)     │   │
│  │  - CRUD operations                   │   │
│  │  - RLS enforcement                   │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  PostgreSQL Database                 │   │
│  │  - organizations                     │   │
│  │  - images (metadata)                 │   │
│  │  - user_organizations                │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Storage (S3-compatible)             │   │
│  │  - images bucket (public)            │   │
│  │  - CDN global                        │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Auth                                │   │
│  │  - JWT tokens                        │   │
│  │  - Sessions                          │   │
│  │  - Row Level Security integration    │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Realtime                            │   │
│  │  - WebSocket connections             │   │
│  │  - Database change subscriptions     │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Edge Functions (se necessário)      │   │
│  │  - Lógica de negócio complexa        │   │
│  │  - Deno runtime                      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Fluxo de Dados: Upload de Imagem

```
1. User seleciona imagem no Dashboard
   ↓
2. Frontend faz upload direto para Supabase Storage
   supabase.storage.from('images').upload()
   ↓
3. Supabase retorna URL pública da imagem
   ↓
4. Frontend insere metadata no banco
   supabase.from('images').insert({ name, url, org_id })
   ↓
5. RLS Policy valida se user pertence à organização
   ↓
6. Database change trigger notifica subscribers via Realtime
   ↓
7. Player recebe update instantâneo via WebSocket
   ↓
8. Nova imagem aparece no slideshow automaticamente
```

### Row Level Security (RLS)

**Segurança no nível do banco de dados:**

```sql
-- Usuários só veem imagens da própria organização
CREATE POLICY "org_isolation"
  ON images FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Player público pode ver imagens
CREATE POLICY "public_player_read"
  ON images FOR SELECT
  USING (true);  -- ou adicionar flag is_public
```

**Vantagens:**

- ✅ Segurança garantida no database
- ✅ Impossível bypassar via API
- ✅ Menos código de autorização no frontend
- ✅ Multitenancy nativo

## Comparação de Custos (12 meses)

| Plataforma               | Custo Total Anual | Limitações                                 |
| ------------------------ | ----------------- | ------------------------------------------ |
| **Supabase (escolhido)** | **$0**            | 500MB DB, 1GB storage, suficiente para MVP |
| Vercel + Neon            | $0                | Storage efêmero, requer solução adicional  |
| Render Manual            | $0                | DB deletado aos 90 dias, storage efêmero   |
| Railway                  | $60-84            | $5-7/mês, pode variar                      |
| Render Pago              | $228              | $19/mês fixo                               |

**Economia anual vs alternativa mais barata paga: $60**

## Plano de Migração

### Fase 1: Setup Inicial (1-2 dias)

- [ ] Criar projeto Supabase
- [ ] Configurar Supabase CLI local
- [ ] Criar migrations iniciais (schema atual)
- [ ] Configurar buckets de storage
- [ ] Gerar types TypeScript

### Fase 2: Infraestrutura (2-3 dias)

- [ ] Migrar schema Prisma → SQL migrations
- [ ] Configurar RLS policies
- [ ] Configurar auth (email/password inicialmente)
- [ ] Setup CI/CD com Supabase

### Fase 3: Backend (3-4 dias)

- [ ] Substituir endpoints Express por client direto
- [ ] Migrar upload logic para Supabase Storage
- [ ] Implementar RLS para multitenancy
- [ ] Testes unitários com Supabase local

### Fase 4: Frontend (2-3 dias)

- [ ] Integrar Supabase client
- [ ] Substituir API calls por client direto
- [ ] Implementar realtime subscriptions
- [ ] Atualizar testes E2E

### Fase 5: Deploy (1 dia)

- [ ] Deploy frontend no Vercel
- [ ] Executar migrations em Supabase production
- [ ] Configurar environment variables
- [ ] Testes de integração end-to-end

**Total estimado: 9-13 dias de trabalho**

## Riscos e Mitigações

### Risco 1: Vendor Lock-in

**Mitigação:**

- Supabase é 100% open source
- Pode self-host se necessário no futuro
- PostgreSQL standard (fácil dump/restore)
- Storage via S3-compatible API (portável)

### Risco 2: Limites do Free Tier

**Mitigação:**

- Monitorar uso via Supabase dashboard
- 500MB DB é suficiente para ~1000 organizações
- 1GB storage = ~2000 imagens (500KB média)
- Upgrade path claro se necessário ($25/mês pro)

### Risco 3: Curva de Aprendizado

**Mitigação:**

- Documentação excelente da Supabase
- Comunidade ativa (Discord)
- Patterns similares a outros frameworks
- Investimento de tempo compensa

### Risco 4: Edge Functions (Deno)

**Mitigação:**

- Usar Edge Functions APENAS se necessário
- Maioria das operações via client direto
- Deno é similar a Node.js (TypeScript nativo)
- Pode usar Vercel Functions como fallback

## Conclusão

A migração para **Full Supabase** é a escolha óbvia considerando:

1. ✅ **Custo**: $0/mês sustentável
2. ✅ **Features**: Resolve storage, auth, realtime
3. ✅ **DX**: Desenvolvimento local + CI/CD excelente
4. ✅ **Escalabilidade**: Upgrade path claro
5. ✅ **Fit**: Perfeito para o caso de uso
6. ✅ **Futuro**: Roadmap alinhado com features do Supabase

**O cenário de hospedagem gratuita colapsou, mas Supabase se destaca como a única opção que oferece:**

- Verdadeiro free tier generoso
- Stack completo (não apenas database)
- Excelente DX e suporte a TDD
- Caminho claro de growth

**Decisão: APROVADA para implementação** ✅

---

**Próximos passos:** Iniciar Fase 1 do plano de migração.
