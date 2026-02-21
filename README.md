# 👕 AZUL STREET API

API REST completa para e-commerce de moda streetwear.

## 🚀 Stack Tecnológica

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **Prisma ORM** - Acesso ao banco type-safe
- **JWT** - Autenticação
- **Zod** - Validação de schemas
- **Stripe** - Processamento de pagamentos
- **Docker** - Containerização

## 📦 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## ⚙️ Instalação

### 1. Clonar e instalar dependências

```bash
cd azul-street-api
npm install
```

### 2. Configurar variáveis de ambiente

```bash
copy .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 3. Subir infraestrutura (PostgreSQL + Redis)

```bash
docker-compose up -d db redis
```

### 4. Executar migrations e gerar cliente Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Popular banco com dados de teste

```bash
npm run seed
```

### 6. Iniciar servidor

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

## 🗂️ Estrutura do Projeto

```
azul-street-api/
├── prisma/
│   ├── schema.prisma      # Modelos do banco
│   ├── migrations/        # Migrations
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── config/            # Configurações (DB, Redis, Upload)
│   ├── controllers/       # Lógica dos endpoints
│   ├── middlewares/       # Auth, validação, erros
│   ├── routes/            # Definição de rotas
│   ├── services/          # Lógica de negócio
│   ├── utils/             # Utilitários
│   └── server.ts          # Entry point
├── docs/
│   └── API_EXAMPLES.md    # Exemplos de requisições
├── uploads/               # Arquivos enviados
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🔗 Endpoints da API

### Públicos

| Método | Rota | Descrição |
|--------|------|----------|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/register` | Cadastrar usuário |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/products` | Listar produtos |
| GET | `/api/v1/products/:slug` | Detalhes do produto |
| GET | `/api/v1/categories` | Listar categorias |
| GET | `/api/v1/categories/:slug` | Detalhes da categoria |

### Autenticados (Bearer Token)

| Método | Rota | Descrição |
|--------|------|----------|
| GET | `/api/v1/auth/profile` | Perfil do usuário |
| GET | `/api/v1/cart` | Ver carrinho |
| POST | `/api/v1/cart` | Adicionar ao carrinho |
| PUT | `/api/v1/cart/:productId` | Atualizar quantidade |
| DELETE | `/api/v1/cart/:productId` | Remover item |
| DELETE | `/api/v1/cart` | Limpar carrinho |
| POST | `/api/v1/orders` | Criar pedido |
| GET | `/api/v1/orders` | Listar pedidos |
| GET | `/api/v1/orders/:id` | Detalhes do pedido |
| PUT | `/api/v1/users/profile` | Atualizar perfil |
| GET | `/api/v1/users/addresses` | Listar endereços |
| POST | `/api/v1/users/addresses` | Adicionar endereço |

### Admin (Role ADMIN)

| Método | Rota | Descrição |
|--------|------|----------|
| POST | `/api/v1/products` | Criar produto |
| PUT | `/api/v1/products/:id` | Atualizar produto |
| DELETE | `/api/v1/products/:id` | Remover produto |
| POST | `/api/v1/categories` | Criar categoria |
| PATCH | `/api/v1/orders/:id/status` | Atualizar status |

## 🔑 Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@azulstreet.com.br | admin123 |
| Cliente | cliente@teste.com | cliente123 |

## 📊 Modelos do Banco

- **User** - Usuários (admin/cliente)
- **Address** - Endereços de entrega
- **Category** - Categorias de produtos
- **Product** - Produtos
- **Order** - Pedidos
- **OrderItem** - Itens do pedido
- **Review** - Avaliações

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Build para produção
npm start            # Iniciar em produção
npm run seed         # Popular banco com dados
npm run prisma:studio # Abrir Prisma Studio
npm run prisma:migrate # Executar migrations
```

## 🐳 Docker

### Subir toda a infraestrutura

```bash
docker-compose up -d
```

### Apenas banco e cache

```bash
docker-compose up -d db redis
```

## 📝 Licença

MIT

---

Desenvolvido com 💙 para AZUL STREET
