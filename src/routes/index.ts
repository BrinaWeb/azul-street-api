import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', authenticate, cartRoutes);
router.use('/orders', authenticate, orderRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

export default router;
