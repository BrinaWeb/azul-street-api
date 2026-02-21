import redis, { CACHE_TTL } from '../config/redis';
import logger from '../config/logger';

export class CacheService {
  private prefix: string;

  constructor(prefix: string = 'cache') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(this.getKey(key));
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_TTL): Promise<void> {
    try {
      await redis.setex(this.getKey(key), ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(this.getKey(key));
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache deletePattern error', { pattern, error });
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      logger.debug('Cache hit', { key });
      return cached;
    }

    logger.debug('Cache miss', { key });
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }
}

// Instâncias pré-configuradas
export const productCache = new CacheService('products');
export const categoryCache = new CacheService('categories');
export const userCache = new CacheService('users');

export default CacheService;
