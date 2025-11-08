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

| Comando | Descrição |
|---------|-----------|
| `pnpm start` | Inicia servidores dev (frontend + backend + banco) |
| `pnpm stop` | Para todos os servidores dev |
| `pnpm build` | Compila todos os pacotes para produção |
| `pnpm test` | Executa todos os testes unitários |
| `pnpm test:watch` | Executa testes em modo watch |
| `pnpm test:coverage` | Executa testes com relatório de cobertura |
| `pnpm test:e2e` | Executa testes E2E (Playwright) |
| `pnpm test:e2e:ui` | Executa testes E2E em modo UI |
| `pnpm test:e2e:show-report` | Visualiza último relatório de testes |

---

## 🔌 Configuração de Portas

### Desenvolvimento
| Serviço | Porta | URL |
|---------|-------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 3000 | http://localhost:3000 |
| Banco de Dados | 5432 | postgresql://localhost:5432 |

### Testes (E2E)
| Serviço | Porta |
|---------|-------|
| Frontend de Teste | 5174 |
| Backend de Teste | 3001 |
| Relatório Playwright | 9323 |

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
- 22 testes unitários + 7 testes E2E

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
- ✅ 22 testes unitários (100% passando)
- ✅ 7 testes E2E (100% passando)
- ✅ Cobertura Frontend + Backend

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

- ✅ Upload de imagens (JPEG, PNG)
- ✅ Dashboard de gerenciamento de imagens
- ✅ Exibição em grade de imagens
- ✅ Exclusão de imagens
- ✅ Validação de arquivos (tipo, tamanho)
- ✅ Autenticação JWT
- ✅ Suporte multi-organização

---

## 📝 Licença

UNLICENSED - Proprietário
