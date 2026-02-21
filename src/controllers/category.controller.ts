import { Request, Response } from 'express';
import prisma from '../config/database';
import redis, { CACHE_TTL } from '../config/redis';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'categories:all';
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(categories));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          take: 12,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, imageUrl } = req.body;

    const category = await prisma.category.create({
      data: { name, slug, imageUrl },
    });

    await redis.del('categories:all');
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar categoria' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, imageUrl } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, imageUrl },
    });

    await redis.del('categories:all');
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar categoria' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se tem produtos
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir categoria com produtos',
      });
    }

    await prisma.category.delete({ where: { id } });
    await redis.del('categories:all');
    res.json({ message: 'Categoria removida' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao remover categoria' });
  }
};
