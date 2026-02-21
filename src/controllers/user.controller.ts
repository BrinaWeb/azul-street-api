import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, phone, cpf } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, cpf },
      select: { id: true, email: true, name: true, phone: true, cpf: true },
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar perfil' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ error: 'Senha atual incorreta' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao alterar senha' });
  }
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addressData = req.body;

    // Se for endereço principal, remover flag dos outros
    if (addressData.isMain) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isMain: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...addressData, userId },
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao adicionar endereço' });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isMain: 'desc' },
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar endereços' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const addressData = req.body;

    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) return res.status(404).json({ error: 'Endereço não encontrado' });

    if (addressData.isMain) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isMain: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: addressData,
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar endereço' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) return res.status(404).json({ error: 'Endereço não encontrado' });

    await prisma.address.delete({ where: { id } });
    res.json({ message: 'Endereço removido' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao remover endereço' });
  }
};
