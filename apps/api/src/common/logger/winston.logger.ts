import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';

export class WinstonLogger implements LoggerService {
  private static instance: WinstonLogger;
  private readonly logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize({ all: process.env.NODE_ENV !== 'production' }),
        winston.format.printf(({ timestamp, level, message, context, stack }) => {
          const ctx = context ? ` [${context}]` : '';
          return `${timestamp} ${level}${ctx}: ${stack || message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        ...(process.env.LOG_TO_FILE === 'true'
          ? [
              new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
              new winston.transports.File({ filename: 'logs/combined.log' }),
            ]
          : []),
      ],
    });
  }

  static getInstance(): WinstonLogger {
    if (!WinstonLogger.instance) {
      WinstonLogger.instance = new WinstonLogger();
    }
    return WinstonLogger.instance;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, stack: trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
