# DevContainer Setup

Este devcontainer inclui tudo que você precisa para desenvolver o Slide Bar:

## Incluído

- ✅ Node.js 18
- ✅ pnpm (gerenciador de pacotes)
- ✅ PostgreSQL 15
- ✅ Prisma CLI
- ✅ PostgreSQL client tools
- ✅ Git
- ✅ Zsh + Oh My Zsh

## Como usar

### Com VS Code

1. Instale a extensão "Dev Containers" no VS Code
2. Abra o projeto
3. Clique no botão verde no canto inferior esquerdo
4. Selecione "Reopen in Container"
5. Aguarde o setup automático (primeira vez demora ~5 minutos)

### Portas expostas

- `3000` - Backend API (Express)
- `5173` - Frontend Dev Server (Vite)
- `5432` - PostgreSQL

## Após o container iniciar

O setup é automático! Mas se precisar rodar manualmente:

```bash
# Instalar dependências
pnpm install

# Gerar Prisma client
cd packages/backend
pnpm prisma generate

# Rodar migrations
pnpm prisma migrate dev

# Iniciar servidores (na raiz)
cd ../..
pnpm dev
```

## Comandos úteis

```bash
# Ver logs do PostgreSQL
docker logs slidebar-postgres

# Acessar Prisma Studio
cd packages/backend
pnpm prisma studio

# Rodar testes
pnpm test

# Criar nova migration
cd packages/backend
pnpm prisma migrate dev --name nome_da_migration
```

## Variáveis de ambiente

As variáveis já estão configuradas no `docker-compose.yml`:

- `DATABASE_URL`: Conexão com PostgreSQL
- `NODE_ENV`: development

Se precisar alterar, edite o arquivo `.env` em `packages/backend/.env`.

## Troubleshooting

### PostgreSQL não conecta

```bash
# Verificar se está rodando
pg_isready -h localhost -p 5432 -U slidebar_user

# Reiniciar o container
# No VS Code: "Dev Containers: Rebuild Container"
```

### Prisma client não encontrado

```bash
cd packages/backend
pnpm prisma generate
```

### Portas já em uso

Pare qualquer serviço local rodando nas portas 3000, 5173 ou 5432 antes de iniciar o devcontainer.
