import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 1 hora.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment endpoint limiter
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 payment attempts per minute
  message: {
    error: 'Muitas tentativas de pagamento. Aguarde 1 minuto.',
    retryAfter: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
