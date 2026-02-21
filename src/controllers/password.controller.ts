import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import redis from '../config/redis';
import { sendPasswordReset } from '../services/email.service';
import logger, { logAuth } from '../config/logger';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const TOKEN_EXPIRY = 60 * 60; // 1 hora em segundos

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Sempre retornar sucesso para evitar enumeração de emails
    if (!user) {
      logger.warn('Tentativa de recuperação de senha para email inexistente', { email });
      return res.json({
        message: 'Se o email existir, você receberá um link de recuperação.',
      });
    }

    // Gerar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const tokenKey = `password_reset:${token}`;

    // Salvar token no Redis com expiração
    await redis.setex(tokenKey, TOKEN_EXPIRY, user.id);

    // Gerar link de recuperação
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`;

    // Enviar email
    await sendPasswordReset(user.email, {
      userName: user.name,
      resetLink,
      expiresIn: '1 hora',
    });

    logAuth('password_reset_requested', user.id, true);

    res.json({
      message: 'Se o email existir, você receberá um link de recuperação.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    logger.error('Erro na recuperação de senha', { error: error.message });
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const tokenKey = `password_reset:${token}`;

    // Verificar token no Redis
    const userId = await redis.get(tokenKey);

    if (!userId) {
      logAuth('password_reset_invalid_token', undefined, false);
      return res.status(400).json({
        error: 'Token inválido ou expirado. Solicite um novo link de recuperação.',
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidar token
    await redis.del(tokenKey);

    logAuth('password_reset_success', userId, true);

    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    logger.error('Erro ao resetar senha', { error: error.message });
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const tokenKey = `password_reset:${token}`;
    const userId = await redis.get(tokenKey);

    if (!userId) {
      return res.status(400).json({
        valid: false,
        error: 'Token inválido ou expirado',
      });
    }

    res.json({ valid: true });
  } catch (error: any) {
    logger.error('Erro ao verificar token', { error: error.message });
    res.status(500).json({ error: 'Erro ao verificar token' });
  }
};
