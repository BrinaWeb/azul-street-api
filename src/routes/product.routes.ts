import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar todos os produtos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Obter produto por slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do produto
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:slug', getProductBySlug);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar novo produto (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Produto criado
 *       403:
 *         description: Acesso negado
 */
router.post('/', authenticate, authorize('ADMIN'), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualizar produto (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produto atualizado
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Deletar produto (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Produto deletado
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
