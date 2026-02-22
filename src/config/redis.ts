import Redis from 'ioredis';

// Create Redis connection - REDIS_URL is required in production
const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    console.log('[Redis] Connecting to Upstash...');
    return new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      lazyConnect: false,
    });
  }
  
  // Only use localhost in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Redis] Connecting to localhost (development)...');
    return new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
    });
  }
  
  // In production without REDIS_URL, create a mock client that logs warnings
  console.warn('[Redis] No REDIS_URL configured in production - using mock client');
  return null;
};

const redis = createRedisClient();

if (redis) {
  // Handle connection errors gracefully
  redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  redis.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  redis.on('ready', () => {
    console.log('[Redis] Ready to accept commands');
  });
}

export const CACHE_TTL = 3600; // 1 hora

export default redis as Redis;
