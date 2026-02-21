import { Router } from 'express';
import { upload } from '../services/upload.service';
import {
  uploadProductImage,
  uploadMultipleProductImages,
  uploadAvatar,
  removeImage,
} from '../controllers/upload.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /upload/product:
 *   post:
 *     summary: Upload de imagem de produto
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagem enviada com sucesso
 *       400:
 *         description: Nenhuma imagem enviada
 */
router.post(
  '/product',
  authenticate,
  authorize('ADMIN'),
  upload.single('image'),
  uploadProductImage
);

/**
 * @swagger
 * /upload/products:
 *   post:
 *     summary: Upload múltiplo de imagens de produto
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/products',
  authenticate,
  authorize('ADMIN'),
  upload.array('images', 5),
  uploadMultipleProductImages
);

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Upload de avatar do usuário
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  uploadAvatar
);

/**
 * @swagger
 * /upload:
 *   delete:
 *     summary: Remover imagem
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/',
  authenticate,
  authorize('ADMIN'),
  removeImage
);

export default router;
