
/**
 * Startup Guardian - Ensures reliable application startup and prevents crashes
 * This system provides:
 * - Graceful error handling during startup
 * - Database connection resilience 
 * - Port management
 * - Health monitoring
 * - Automatic recovery mechanisms
 */

import { createLogger } from './debug-logger';
import { db } from '../db';
import { count } from 'drizzle-orm';
import { posts } from '@shared/schema';

const logger = createLogger('StartupGuardian');

export interface StartupConfig {
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: number;
  port: number;
  host: string;
}

export class StartupGuardian {
  private config: StartupConfig;
  private isHealthy: boolean = false;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<StartupConfig> = {}) {
    this.config = {
      maxRetries: 5,
      retryDelay: 2000,
      healthCheckInterval: 30000, // 30 seconds
      port: Number(process.env.PORT || 5000),
      host: '0.0.0.0',
      ...config
    };
  }

  async guardedStartup(): Promise<boolean> {
    logger.info('🛡️ Startup Guardian initializing...');
    
    try {
      // Phase 1: Environment validation
      await this.validateEnvironment();
      
      // Phase 2: Database connection with retries
      await this.ensureDatabaseConnection();
      
      // Phase 3: Port availability check
      await this.ensurePortAvailable();
      
      // Phase 4: Start health monitoring
      this.startHealthMonitoring();
      
      this.isHealthy = true;
      logger.success('✅ Startup Guardian: All systems operational');
      return true;
      
    } catch (error) {
      logger.error('❌ Startup Guardian: Critical startup failure', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  private async validateEnvironment(): Promise<void> {
    logger.info('🔍 Validating environment...');
    
    const requiredVars = ['DATABASE_URL'];
    const missing = requiredVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    logger.success('✅ Environment validation passed');
  }

  private async ensureDatabaseConnection(): Promise<void> {
    logger.info('🔗 Ensuring database connection...');
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Test database connection with a simple query
        const result = await db.select({ count: count() }).from(posts);
        logger.success(`✅ Database connected successfully (${result[0]?.count || 0} posts)`);
        return;
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.warn(`⚠️ Database connection attempt ${attempt}/${this.config.maxRetries} failed:`, errorMsg);
        
        if (attempt === this.config.maxRetries) {
          throw new Error(`Database connection failed after ${this.config.maxRetries} attempts: ${errorMsg}`);
        }
        
        // Wait before retrying with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        logger.info(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private async ensurePortAvailable(): Promise<void> {
    logger.info(`🔌 Checking port ${this.config.port} availability...`);
    
    try {
      const net = await import('net');
      return new Promise((resolve, reject) => {
        const server = net.createServer();
        
        server.listen(this.config.port, this.config.host, () => {
          server.close(() => {
            logger.success(`✅ Port ${this.config.port} is available`);
            resolve();
          });
        });
        
        server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            logger.warn(`⚠️ Port ${this.config.port} is already in use, but continuing...`);
            resolve(); // Allow startup to continue
          } else {
            reject(new Error(`Port check failed: ${error.message}`));
          }
        });
      });
    } catch (error) {
      logger.warn('⚠️ Port check failed, but continuing startup:', error);
    }
  }

  private startHealthMonitoring(): void {
    logger.info('💓 Starting health monitoring...');
    
    this.healthCheckTimer = setInterval(async () => {
      try {
        // Simple health check - ping the database
        await db.select({ count: count() }).from(posts).limit(1);
        
        if (!this.isHealthy) {
          this.isHealthy = true;
          logger.info('💚 System health restored');
        }
      } catch (error) {
        if (this.isHealthy) {
          this.isHealthy = false;
          logger.error('💔 System health check failed:', error);
        }
      }
    }, this.config.healthCheckInterval);
  }

  public getHealthStatus(): { healthy: boolean; uptime: number } {
    return {
      healthy: this.isHealthy,
      uptime: process.uptime()
    };
  }

  public async gracefulShutdown(): Promise<void> {
    logger.info('🔄 Initiating graceful shutdown...');
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    this.isHealthy = false;
    logger.info('✅ Graceful shutdown completed');
  }
}

// Global error handlers to prevent crashes
export function setupGlobalErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    logger.error('🚨 Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });
    
    // Give time for logging, then exit gracefully
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('🚨 Unhandled Promise Rejection:', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined
    });
    
    // In production, we should exit on unhandled rejections
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });

  process.on('SIGTERM', () => {
    logger.info('🔄 SIGTERM received, shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('🔄 SIGINT received, shutting down gracefully...');
    process.exit(0);
  });
}
