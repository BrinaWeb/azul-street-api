import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
import { webhookLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

// Stripe webhook - precisa do body raw
router.post(
  '/stripe',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
