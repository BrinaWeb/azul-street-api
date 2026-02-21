import winston from 'winston';
import path from 'path';

const logDir = 'logs';

// Formato customizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Formato JSON para produção
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? jsonFormat : customFormat,
  defaultMeta: { service: 'azul-street-api' },
  transports: [
    // Logs de erro em arquivo separado
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Todos os logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Em desenvolvimento, também loga no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    })
  );
}

// Helpers para logging estruturado
export const logRequest = (req: any, message: string) => {
  logger.info(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
  });
};

export const logError = (error: Error, context?: object) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

export const logPayment = (action: string, data: object) => {
  logger.info(`Payment: ${action}`, {
    type: 'payment',
    ...data,
  });
};

export const logAuth = (action: string, userId?: string, success: boolean = true) => {
  const level = success ? 'info' : 'warn';
  logger[level](`Auth: ${action}`, {
    type: 'auth',
    userId,
    success,
  });
};

export default logger;
