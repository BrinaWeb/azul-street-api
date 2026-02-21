import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';
import logger, { logPayment, logError } from '../config/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    logError(err, { context: 'Stripe webhook signature verification' });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logPayment('webhook_received', { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDispute(event.data.object as Stripe.Dispute);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    logError(error, { context: 'Stripe webhook processing', eventType: event.type });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    logger.warn('Payment success without orderId', { paymentIntentId: paymentIntent.id });
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      paymentId: paymentIntent.id,
    },
  });

  logPayment('payment_success', {
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
  });

  // TODO: Enviar email de confirmação
  // await sendOrderConfirmationEmail(orderId);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    logger.warn('Payment failed without orderId', { paymentIntentId: paymentIntent.id });
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'CANCELLED',
    },
  });

  logPayment('payment_failed', {
    orderId,
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message,
  });
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  const order = await prisma.order.findFirst({
    where: { paymentId: paymentIntentId },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    logPayment('refund_processed', {
      orderId: order.id,
      chargeId: charge.id,
      amount: charge.amount_refunded / 100,
    });
  }
}

async function handleDispute(dispute: Stripe.Dispute) {
  logPayment('dispute_created', {
    disputeId: dispute.id,
    chargeId: dispute.charge,
    amount: dispute.amount / 100,
    reason: dispute.reason,
  });

  // TODO: Notificar admin sobre disputa
}
