import Redis from 'ioredis';

// Use REDIS_URL if available (Upstash), otherwise fall back to host/port
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

// Handle connection errors gracefully
redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

export const CACHE_TTL = 3600; // 1 hora

export default redis;
