import app from './app';
import { env } from './config/env';
import { testDatabaseConnection, disconnectDatabase } from './config/database';
import logger from './utils/logger';

const PORT = env.PORT;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Test database connection
    logger.info('🔍 Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      logger.error('❌ Failed to connect to database');
      process.exit(1);
    }

    logger.info('✅ Database connected successfully');

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('✅ HTTP server closed');

        try {
          await disconnectDatabase();
          logger.info('✅ Database disconnected');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('unhandledRejection', (reason: any) => {
      logger.error('❌ Unhandled Rejection:', reason);
      process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
