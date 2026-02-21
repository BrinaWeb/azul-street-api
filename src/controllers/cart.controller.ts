import { Response } from 'express';
import redis from '../config/redis';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

const CART_TTL = 60 * 60 * 24 * 7; // 7 dias

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartKey = `cart:${userId}`;
    
    const cartData = await redis.get(cartKey);
    if (!cartData) return res.json({ items: [], total: 0 });

    const cart = JSON.parse(cartData);
    
    // Validar estoque atual
    const productIds = cart.items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, price: true, isActive: true }
    });

    const validItems = cart.items.filter((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return product && product.isActive && product.stock >= item.quantity;
    });

    const total = validItems.reduce((sum: number, item: any) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (Number(product?.price) * item.quantity);
    }, 0);

    res.json({ items: validItems, total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar carrinho' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user!.id;
    const cartKey = `cart:${userId}`;

    // Verificar produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, stock: true, images: true, isActive: true }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }

    let cart: { items: any[] } = { items: [] };
    const existing = await redis.get(cartKey);
    if (existing) cart = JSON.parse(existing);

    const itemIndex = cart.items.findIndex((i: any) => i.productId === productId);
    
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: Number(product.price),
        image: product.images[0],
        quantity,
      });
    }

    await redis.setex(cartKey, CART_TTL, JSON.stringify(cart));
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar ao carrinho' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user!.id;
    const cartKey = `cart:${userId}`;

    const cartData = await redis.get(cartKey);
    if (!cartData) return res.status(404).json({ error: 'Carrinho vazio' });

    const cart = JSON.parse(cartData);
    const itemIndex = cart.items.findIndex((i: any) => i.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await redis.setex(cartKey, CART_TTL, JSON.stringify(cart));
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar carrinho' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;
    const cartKey = `cart:${userId}`;

    const cartData = await redis.get(cartKey);
    if (!cartData) return res.status(404).json({ error: 'Carrinho vazio' });

    const cart = JSON.parse(cartData);
    cart.items = cart.items.filter((i: any) => i.productId !== productId);

    await redis.setex(cartKey, CART_TTL, JSON.stringify(cart));
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover do carrinho' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await redis.del(`cart:${userId}`);
    res.json({ message: 'Carrinho limpo' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar carrinho' });
  }
};
