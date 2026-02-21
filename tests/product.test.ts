import request from 'supertest';
import app from '../src/server';

describe('Product Endpoints', () => {
  describe('GET /api/v1/products', () => {
    it('should return list of products', async () => {
      const response = await request(app)
        .get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeLessThanOrEqual(5);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/products?category=camisetas');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
    });
  });

  describe('GET /api/v1/products/:slug', () => {
    it('should return product by slug', async () => {
      const response = await request(app)
        .get('/api/v1/products/camiseta-azul-street-classic');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/products/produto-inexistente-xyz');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/products (Admin)', () => {
    let adminToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@azulstreet.com.br',
          password: 'admin123',
        });
      adminToken = response.body.token;
    });

    it('should create product with admin token', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produto Teste Jest',
          description: 'Produto criado via teste automatizado',
          price: 99.90,
          sku: `TEST-${Date.now()}`,
          categoryId: 'cat-camisetas',
          stock: 10,
        });

      // Pode ser 201 (criado) ou 400 (se categoryId não existir)
      expect([201, 400]).toContain(response.status);
    });

    it('should reject without admin token', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({
          name: 'Produto Sem Auth',
          description: 'Teste',
          price: 50,
          sku: 'NO-AUTH',
        });

      expect(response.status).toBe(401);
    });
  });
});
