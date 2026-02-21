type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
  info: '\x1b[36m',    // Cyan
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[35m',   // Magenta
  reset: '\x1b[0m',
};

const formatDate = (): string => {
  return new Date().toISOString();
};

const log = (level: LogLevel, message: string, meta?: any): void => {
  const color = colors[level];
  const reset = colors.reset;
  const timestamp = formatDate();
  
  const formattedMessage = `${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`;
  
  if (level === 'error') {
    console.error(formattedMessage, meta ? meta : '');
  } else if (level === 'warn') {
    console.warn(formattedMessage, meta ? meta : '');
  } else {
    console.log(formattedMessage, meta ? meta : '');
  }
};

export const logger = {
  info: (message: string, meta?: any) => log('info', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta),
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, meta);
    }
  },
};

export default logger;
