import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import webhookRoutes from './routes/webhook.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.handler';
import { generalLimiter } from './middlewares/rate-limit.middleware';
import logger from './utils/logger';
import { setupSwagger } from './config/swagger';

const app = express();

// Middlewares de segurança e performance
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting global
app.use(generalLimiter);

// Webhooks precisam vir ANTES do express.json()
app.use('/api/v1/webhooks', webhookRoutes);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Swagger Documentation
setupSwagger(app);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/v1', routes);

// Handlers de erro
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🔥 Servidor AZUL STREET rodando na porta ${PORT}`);
  logger.info(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
