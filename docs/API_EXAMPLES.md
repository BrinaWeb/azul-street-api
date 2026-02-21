# AZUL STREET API - Exemplos de Requisições

## Base URL
```
http://localhost:3000/api/v1
```

## 🔐 Autenticação

### Registrar novo usuário
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@usuario.com",
    "password": "senha123",
    "name": "Novo Usuário"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@teste.com",
    "password": "cliente123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "cliente@teste.com",
    "name": "Cliente Teste",
    "role": "CUSTOMER"
  }
}
```

### Obter perfil (autenticado)
```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📦 Produtos

### Listar todos os produtos
```bash
curl http://localhost:3000/api/v1/products
```

### Listar com filtros
```bash
# Por categoria
curl "http://localhost:3000/api/v1/products?category=camisetas"

# Com busca
curl "http://localhost:3000/api/v1/products?search=azul"

# Ordenado por preço
curl "http://localhost:3000/api/v1/products?sort=price_asc"

# Paginação
curl "http://localhost:3000/api/v1/products?page=1&limit=6"
```

### Obter produto por slug
```bash
curl http://localhost:3000/api/v1/products/camiseta-basica-azul
```

## 🛒 Carrinho (requer autenticação)

### Ver carrinho
```bash
curl http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Adicionar ao carrinho
```bash
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "ID_DO_PRODUTO",
    "quantity": 2
  }'
```

### Atualizar quantidade
```bash
curl -X PUT http://localhost:3000/api/v1/cart/ID_DO_PRODUTO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

### Remover do carrinho
```bash
curl -X DELETE http://localhost:3000/api/v1/cart/ID_DO_PRODUTO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Limpar carrinho
```bash
curl -X DELETE http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📋 Pedidos (requer autenticação)

### Criar pedido
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "ID_DO_ENDERECO",
    "paymentMethod": "credit_card"
  }'
```

### Listar meus pedidos
```bash
curl http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Ver detalhes do pedido
```bash
curl http://localhost:3000/api/v1/orders/ID_DO_PEDIDO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 👤 Usuário (requer autenticação)

### Atualizar perfil
```bash
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Nome",
    "phone": "11988887777"
  }'
```

### Adicionar endereço
```bash
curl -X POST http://localhost:3000/api/v1/users/addresses \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "Rua Nova",
    "number": "456",
    "neighborhood": "Bairro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-000",
    "isMain": true
  }'
```

## 🔧 Admin (requer role ADMIN)

### Criar produto
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Produto",
    "slug": "novo-produto",
    "description": "Descrição do produto",
    "price": 99.90,
    "stock": 100,
    "sku": "NOVO-001",
    "categoryId": "ID_DA_CATEGORIA",
    "images": ["/uploads/novo-produto.jpg"]
  }'
```

### Atualizar status do pedido
```bash
curl -X PATCH http://localhost:3000/api/v1/orders/ID_DO_PEDIDO/status \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "trackingCode": "BR123456789"
  }'
```

## 📊 Status de Pedido

| Status | Descrição |
|--------|----------|
| PENDING | Aguardando pagamento |
| PAID | Pago |
| PROCESSING | Em processamento |
| SHIPPED | Enviado |
| DELIVERED | Entregue |
| CANCELLED | Cancelado |

## 🔑 Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@azulstreet.com.br | admin123 |
| Cliente | cliente@teste.com | cliente123 |
