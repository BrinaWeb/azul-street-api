import { Request, Response } from 'express';
import prisma from '../config/database';
import redis, { CACHE_TTL } from '../config/redis';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 12, category, search, sort } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const where: any = { isActive: true };
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: { category: { select: { name: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    const result = {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const cacheKey = `product:${slug}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(product));
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    await redis.del('products:*');
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar produto' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });
    await redis.del(`product:${product.slug}`);
    await redis.del('products:*');
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar produto' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ message: 'Produto removido' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao remover produto' });
  }
};
