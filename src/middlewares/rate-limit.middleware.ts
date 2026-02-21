import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiter geral para todas as rotas
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter mais restritivo para autenticação
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 tentativas de login por hora
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 1 hora.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // não conta requisições bem-sucedidas
});

// Rate limiter para criação de conta
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por hora por IP
  message: {
    error: 'Muitas contas criadas. Tente novamente em 1 hora.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para API de produtos (mais permissivo)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requisições por minuto
  message: {
    error: 'Limite de requisições excedido. Aguarde um momento.',
    retryAfter: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para webhooks (muito permissivo)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  standardHeaders: true,
  legacyHeaders: false,
});
