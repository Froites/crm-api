# CRM Sales API

Uma API completa para sistema CRM de vendas construída com NestJS, TypeScript, Prisma ORM e MongoDB.

## 🚀 Funcionalidades

### Autenticação & Autorização
- ✅ Login/Register com JWT
- ✅ Middleware de autenticação
- ✅ Controle de acesso baseado em roles (ADMIN, MANAGER, AGENT)
- ✅ Proteção de rotas

### Dashboard
- ✅ Métricas gerais (leads, conversões, faturamento)
- ✅ Performance de agentes
- ✅ Gráficos de receita
- ✅ Distribuição por status e fonte
- ✅ Atividades recentes

### Gestão de Leads
- ✅ CRUD completo de leads
- ✅ Filtros avançados (status, fonte, agente, prioridade, data)
- ✅ Atualização de status com histórico
- ✅ Busca por nome, email, empresa
- ✅ Paginação e ordenação
- ✅ Controle de acesso por role

### Gestão de Usuários/Agentes
- ✅ CRUD de usuários
- ✅ Métricas de performance individual
- ✅ Controle de ativação/desativação

### Configurações
- ✅ Configurações personalizáveis por usuário
- ✅ Preferências de notificações
- ✅ Configurações de idioma, timezone, moeda

## 🛠️ Tecnologias

- **Backend**: NestJS + TypeScript
- **Database**: MongoDB com Prisma ORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Rate Limiting**: @nestjs/throttler

## 📋 Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

## 🚀 Instalação Rápida

### Opção 1: Script Automático (Recomendado)

```bash
# Clone o repositório
git clone <repository-url>
cd crm-api

# Execute o script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Opção 2: Manual

```bash
# Clone o repositório
git clone <repository-url>
cd crm-api

# Instale as dependências
npm install

# Inicie o MongoDB
docker-compose up -d

# Configure o ambiente
cp .env.example .env

# Configure o banco de dados
npx prisma generate
npx prisma db push
npx prisma db seed

# Inicie o servidor de desenvolvimento
npm run start:dev
```

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Servidor em modo desenvolvimento
npm run start:debug        # Servidor em modo debug

# Build
npm run build              # Build da aplicação
npm run start:prod         # Servidor em produção

# Database
npm run db:generate        # Gerar cliente Prisma
npm run db:push           # Aplicar schema ao banco
npm run db:seed           # Popular banco com dados iniciais
npm run db:studio         # Abrir Prisma Studio

# Testes
npm run test              # Testes unitários
npm run test:e2e          # Testes end-to-end
npm run test:cov          # Testes com coverage

# Lint & Format
npm run lint              # Verificar código
npm run format            # Formatar código
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:3000/docs
- **API Base URL**: http://localhost:3000/api/v1

## 🔐 Credenciais Padrão

Após executar o seed do banco de dados:

| Role    | Email               | Senha     |
|---------|-------------------- |-----------|
| Admin   | admin@crm.com       | admin123  |
| Manager | manager@crm.com     | manager123|
| Agent   | agent1@crm.com      | agent123  |
| Agent   | agent2@crm.com      | agent123  |
| Agent   | agent3@crm.com      | agent123  |

## 📈 Estrutura da API

### Endpoints Principais

#### Autenticação
```
POST /api/v1/auth/login      # Login
POST /api/v1/auth/register   # Registro
GET  /api/v1/auth/me         # Perfil do usuário
```

#### Dashboard
```
GET /api/v1/dashboard/metrics           # Métricas gerais
GET /api/v1/dashboard/agents-performance # Performance dos agentes
GET /api/v1/dashboard/recent-activity   # Atividades recentes
GET /api/v1/dashboard/leads-by-status   # Leads por status
GET /api/v1/dashboard/leads-by-source   # Leads por fonte
GET /api/v1/dashboard/revenue-chart     # Gráfico de receita
```

#### Leads
```
GET    /api/v1/leads           # Listar leads (com filtros)
POST   /api/v1/leads           # Criar lead
GET    /api/v1/leads/:id       # Buscar lead específico
PUT    /api/v1/leads/:id       # Atualizar lead
DELETE /api/v1/leads/:id       # Excluir/arquivar lead
PUT    /api/v1/leads/:id/status # Atualizar status do lead
GET    /api/v1/leads/stats     # Estatísticas de leads
```

#### Agentes
```
GET    /api/v1/agents              # Listar agentes
POST   /api/v1/agents              # Criar agente
GET    /api/v1/agents/:id          # Buscar agente específico
PUT    /api/v1/agents/:id          # Atualizar agente
DELETE /api/v1/agents/:id          # Desativar agente
GET    /api/v1/agents/:id/performance # Performance do agente
```

#### Configurações
```
GET /api/v1/settings/user      # Configurações do usuário
PUT /api/v1/settings/user      # Atualizar configurações
GET /api/v1/settings/defaults  # Configurações padrão
```

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login via `POST /auth/login`
2. Use o token retornado no header: `Authorization: Bearer <token>`

## 🎯 Filtros e Parâmetros

### Leads
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Busca por nome, email, empresa, telefone
- `status`: Filtrar por status do lead
- `source`: Filtrar por fonte do lead
- `assignedAgent`: Filtrar por agente responsável
- `priority`: Filtrar por prioridade
- `dateFrom`: Data inicial (formato: YYYY-MM-DD)
- `dateTo`: Data final (formato: YYYY-MM-DD)
- `sortBy`: Campo para ordenação (padrão: createdAt)
- `sortOrder`: Ordem (asc/desc, padrão: desc)

### Exemplo de Requisição
```bash
GET /api/v1/leads?page=1&limit=20&status=NEW&source=WEBSITE&search=empresa
```

## 🏗️ Estrutura do Projeto

```
src/
├── common/                 # Utilitários compartilhados
│   ├── filters/           # Filtros de exceção
│   ├── interceptors/      # Interceptadores
│   └── types/             # Tipos TypeScript
├── modules/               # Módulos da aplicação
│   ├── auth/              # Autenticação e autorização
│   ├── users/             # Gestão de usuários
│   ├── leads/             # Gestão de leads
│   ├── dashboard/         # Dashboard e métricas
│   └── settings/          # Configurações
├── prisma/                # Configuração do Prisma
├── main.ts                # Ponto de entrada da aplicação
└── app.module.ts          # Módulo principal
```

## 🔧 Configuração de Ambiente

Principais variáveis de ambiente:

```env
# Database
DATABASE_URL="mongodb://admin:admin@localhost:27017/crm_database?authSource=admin"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# App
NODE_ENV="development"
PORT=3000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:4200"
```

## 🐳 Docker

O projeto inclui configuração Docker para MongoDB:

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Logs
docker-compose logs -f
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Monitoramento

- **Logs**: Winston configurado para console e arquivos
- **Rate Limiting**: Proteção contra spam/abuse
- **Error Handling**: Tratamento global de erros
- **Health Check**: Endpoint para verificação de saúde

## 🚀 Deploy

### Preparação para Produção

1. Configure as variáveis de ambiente de produção
2. Execute o build: `npm run build`
3. Configure o banco de dados: `npx prisma db push`
4. Inicie em produção: `npm run start:prod`

### Variáveis de Produção

```env
NODE_ENV=production
DATABASE_URL="your-production-mongodb-url"
JWT_SECRET="your-super-secure-production-secret"
PORT=3000
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

---

**Feito com ❤️ usando NestJS**