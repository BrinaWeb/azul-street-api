import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import logger from '../config/logger';

// Função para gerar UUID usando crypto nativo
const uuidv4 = () => crypto.randomUUID();

// Diretório de uploads
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PRODUCTS_DIR = path.join(UPLOAD_DIR, 'products');
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');

// Criar diretórios se não existirem
[UPLOAD_DIR, PRODUCTS_DIR, AVATARS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuração do Multer
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Interface para resultado do upload
interface UploadResult {
  filename: string;
  path: string;
  url: string;
  size: number;
  width: number;
  height: number;
}

// Processar e salvar imagem de produto
export const processProductImage = async (
  file: Express.Multer.File
): Promise<UploadResult> => {
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(PRODUCTS_DIR, filename);

  try {
    // Processar imagem com Sharp
    const processedImage = await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(filepath);

    const url = `/uploads/products/${filename}`;

    logger.info('Imagem de produto processada', { filename, size: processedImage.size });

    return {
      filename,
      path: filepath,
      url,
      size: processedImage.size,
      width: processedImage.width,
      height: processedImage.height,
    };
  } catch (error: any) {
    logger.error('Erro ao processar imagem de produto', { error: error.message });
    throw new Error('Erro ao processar imagem');
  }
};

// Processar e salvar avatar de usuário
export const processAvatarImage = async (
  file: Express.Multer.File
): Promise<UploadResult> => {
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(AVATARS_DIR, filename);

  try {
    const processedImage = await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'cover',
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    const url = `/uploads/avatars/${filename}`;

    logger.info('Avatar processado', { filename, size: processedImage.size });

    return {
      filename,
      path: filepath,
      url,
      size: processedImage.size,
      width: processedImage.width,
      height: processedImage.height,
    };
  } catch (error: any) {
    logger.error('Erro ao processar avatar', { error: error.message });
    throw new Error('Erro ao processar avatar');
  }
};

// Gerar thumbnail
export const generateThumbnail = async (
  file: Express.Multer.File,
  size: number = 150
): Promise<UploadResult> => {
  const filename = `thumb_${uuidv4()}.webp`;
  const filepath = path.join(PRODUCTS_DIR, filename);

  try {
    const processedImage = await sharp(file.buffer)
      .resize(size, size, {
        fit: 'cover',
      })
      .webp({ quality: 70 })
      .toFile(filepath);

    return {
      filename,
      path: filepath,
      url: `/uploads/products/${filename}`,
      size: processedImage.size,
      width: processedImage.width,
      height: processedImage.height,
    };
  } catch (error: any) {
    logger.error('Erro ao gerar thumbnail', { error: error.message });
    throw new Error('Erro ao gerar thumbnail');
  }
};

// Deletar arquivo
export const deleteFile = async (filepath: string): Promise<boolean> => {
  try {
    const fullPath = path.join(process.cwd(), filepath.replace(/^\//, ''));
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info('Arquivo deletado', { filepath });
      return true;
    }
    return false;
  } catch (error: any) {
    logger.error('Erro ao deletar arquivo', { error: error.message, filepath });
    return false;
  }
};

export default {
  upload,
  processProductImage,
  processAvatarImage,
  generateThumbnail,
  deleteFile,
};
