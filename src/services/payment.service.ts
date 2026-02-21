import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'brl'
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // centavos
      currency,
      automatic_payment_methods: { enabled: true },
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    throw new Error('Erro ao criar pagamento');
  }
};

export const confirmPayment = async (paymentIntentId: string) => {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status === 'succeeded';
};

export const createRefund = async (
  paymentIntentId: string,
  amount?: number
) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  } catch (error) {
    throw new Error('Erro ao processar reembolso');
  }
};

export const handleWebhook = async (
  payload: Buffer,
  signature: string
) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (error) {
    throw new Error('Webhook inválido');
  }
};
