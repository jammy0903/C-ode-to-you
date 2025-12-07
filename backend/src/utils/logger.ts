/**
 * @file logger.ts
 * @description Winston-based logging utility
 * @layer Utility - Centralized logging configuration
 *
 * @features
 * - Levels: error, warn, info, debug
 * - Development: Colorized console output with timestamps
 * - Production: JSON format + file rotation (error.log, combined.log, 5MB max, 5 files)
 * - Configurable log level via env (LOG_LEVEL)
 *
 * @duplicateLogic
 * - ✅ No duplication - clean configuration
 */

import winston from 'winston';
import { env, isDevelopment } from '../config/env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isDevelopment ? developmentFormat : format,
  }),
];

// Add file transports in production
if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format,
  transports,
});

export default logger;
