import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    await transporter.sendMail({
      from: '"AZUL STREET" <noreply@azulstreet.com.br>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email');
  }
};

export const sendOrderConfirmation = async (email: string, orderData: any) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Pedido Confirmado!</h1>
      <p>Olá! Seu pedido <strong>#${orderData.id.slice(0, 8)}</strong> foi confirmado.</p>
      
      <h2>Itens do Pedido:</h2>
      <ul>
        ${orderData.items.map((item: any) => `
          <li>${item.product.name} - Qtd: ${item.quantity} - R$ ${item.totalPrice}</li>
        `).join('')}
      </ul>
      
      <p><strong>Total:</strong> R$ ${orderData.total}</p>
      <p><strong>Frete:</strong> R$ ${orderData.shippingCost}</p>
      
      <p>Você receberá atualizações sobre o status do seu pedido.</p>
      
      <p>Obrigado por comprar na AZUL STREET!</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Pedido #${orderData.id.slice(0, 8)} Confirmado - AZUL STREET`,
    html,
  });
};

export const sendShippingNotification = async (
  email: string,
  orderId: string,
  trackingCode: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Seu pedido foi enviado!</h1>
      <p>O pedido <strong>#${orderId.slice(0, 8)}</strong> está a caminho.</p>
      
      <p><strong>Código de rastreamento:</strong> ${trackingCode}</p>
      
      <p>Acompanhe seu pedido pelo site dos Correios ou transportadora.</p>
      
      <p>Obrigado por comprar na AZUL STREET!</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Pedido #${orderId.slice(0, 8)} Enviado - AZUL STREET`,
    html,
  });
};

interface PasswordResetData {
  userName: string;
  resetLink: string;
  expiresIn: string;
}

export const sendPasswordReset = async (
  email: string,
  data: PasswordResetData
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
        <h1>AZUL STREET</h1>
        <p>Recuperação de Senha</p>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <p>Olá <strong>${data.userName}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        
        <p style="text-align: center;">
          <a href="${data.resetLink}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Redefinir Minha Senha</a>
        </p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 5px; margin: 15px 0;">
          <strong>⚠️ Atenção:</strong> Este link expira em <strong>${data.expiresIn}</strong>.
        </div>
        
        <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
        
        <p>Link: ${data.resetLink}</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>AZUL STREET - Moda que combina com você</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Redefinição de Senha - AZUL STREET',
      html,
    });
    return true;
  } catch (error) {
    return false;
  }
};
