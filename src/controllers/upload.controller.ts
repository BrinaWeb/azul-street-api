import { Request, Response } from 'express';
import { processProductImage, processAvatarImage, deleteFile } from '../services/upload.service';
import logger from '../config/logger';

export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const result = await processProductImage(req.file);

    res.json({
      message: 'Imagem enviada com sucesso',
      image: result,
    });
  } catch (error: any) {
    logger.error('Erro no upload de imagem de produto', { error: error.message });
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
};

export const uploadMultipleProductImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const results = await Promise.all(
      files.map((file) => processProductImage(file))
    );

    res.json({
      message: `${results.length} imagens enviadas com sucesso`,
      images: results,
    });
  } catch (error: any) {
    logger.error('Erro no upload múltiplo', { error: error.message });
    res.status(500).json({ error: 'Erro ao fazer upload das imagens' });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const result = await processAvatarImage(req.file);

    res.json({
      message: 'Avatar enviado com sucesso',
      avatar: result,
    });
  } catch (error: any) {
    logger.error('Erro no upload de avatar', { error: error.message });
    res.status(500).json({ error: 'Erro ao fazer upload do avatar' });
  }
};

export const removeImage = async (req: Request, res: Response) => {
  try {
    const { filepath } = req.body;

    if (!filepath) {
      return res.status(400).json({ error: 'Caminho do arquivo não informado' });
    }

    const deleted = await deleteFile(filepath);

    if (deleted) {
      res.json({ message: 'Imagem removida com sucesso' });
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  } catch (error: any) {
    logger.error('Erro ao remover imagem', { error: error.message });
    res.status(500).json({ error: 'Erro ao remover imagem' });
  }
};
