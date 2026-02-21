import prisma from '../config/database';
import redis, { CACHE_TTL } from '../config/redis';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getProducts = async (filters: ProductFilters) => {
  const { page = 1, limit = 12, category, search, sort, minPrice, maxPrice } = filters;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };
  
  if (category) {
    where.category = { slug: category };
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
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
      take: limit,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getProductBySlug = async (slug: string) => {
  return prisma.product.findUnique({
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
};

export const getCategories = async () => {
  const cacheKey = 'categories:all';
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(categories));
  return categories;
};

export const invalidateProductCache = async (slug?: string) => {
  if (slug) {
    await redis.del(`product:${slug}`);
  }
  // Invalidar lista de produtos
  const keys = await redis.keys('products:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
