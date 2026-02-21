import { Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createPaymentIntent } from '../services/payment.service';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { addressId, paymentMethod } = req.body;

    // Buscar carrinho
    const cartData = await redis.get(`cart:${userId}`);
    if (!cartData) return res.status(400).json({ error: 'Carrinho vazio' });

    const cart = JSON.parse(cartData);
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Validar estoque e calcular total
    const productIds = cart.items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let total = 0;
    const orderItems: any[] = [];

    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Estoque insuficiente para ${item.name}` 
        });
      }
      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    const shippingCost = total >= 299 ? 0 : 19.90;

    // Criar pedido
    const order = await prisma.$transaction(async (tx) => {
      // Criar pedido
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          total: total + shippingCost,
          shippingCost,
          paymentMethod,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      // Atualizar estoque
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // Criar payment intent
    const payment = await createPaymentIntent(total + shippingCost);

    // Limpar carrinho
    await redis.del(`cart:${userId}`);

    res.status(201).json({
      order,
      payment: {
        clientSecret: payment.clientSecret,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: { select: { name: true, images: true } } },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: { product: true },
        },
        address: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingCode } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status, trackingCode },
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar pedido' });
  }
};
