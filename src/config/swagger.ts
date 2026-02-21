import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AZUL STREET API',
      version: '1.0.0',
      description: 'API REST para e-commerce AZUL STREET - Documentação completa dos endpoints',
      contact: {
        name: 'AZUL STREET',
        email: 'contato@azulstreet.com.br',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://api.azulstreet.com.br/api/v1',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'CUSTOMER'] },
            cpf: { type: 'string' },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            oldPrice: { type: 'number' },
            stock: { type: 'integer' },
            sku: { type: 'string' },
            isActive: { type: 'boolean' },
            images: { type: 'array', items: { type: 'string' } },
            categoryId: { type: 'string', format: 'uuid' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            imageUrl: { type: 'string' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
            total: { type: 'number' },
            shippingCost: { type: 'number' },
            paymentMethod: { type: 'string' },
            trackingCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'cliente@teste.com' },
            password: { type: 'string', minLength: 6, example: 'cliente123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string', minLength: 2 },
            cpf: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            productId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            price: { type: 'number' },
            image: { type: 'string' },
            quantity: { type: 'integer' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
            total: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticação e registro de usuários' },
      { name: 'Products', description: 'Gerenciamento de produtos' },
      { name: 'Categories', description: 'Gerenciamento de categorias' },
      { name: 'Cart', description: 'Carrinho de compras' },
      { name: 'Orders', description: 'Pedidos' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AZUL STREET API - Documentação',
  }));

  // JSON spec endpoint
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default swaggerSpec;
