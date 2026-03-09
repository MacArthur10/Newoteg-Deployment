import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;
  private pool: Pool;

  constructor() {
    // Create PostgreSQL connection pool for optimal Neon performance
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      // Optimized pool settings for Neon
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Connection timeout
    });
    
    // Use Prisma PostgreSQL adapter for connection pooling
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    // Attempt connection asynchronously without blocking startup
    this.attemptConnection();
  }

  private async attemptConnection(): Promise<void> {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        this.connected = true;
        this.logger.log('✅ Database connected successfully with connection pooling');
        return;
      } catch (error) {
        retries--;
        this.logger.warn(`⚠️ Database connection failed. Retries left: ${retries}`);
        if (retries === 0) {
          this.logger.error('❌ Failed to connect to database after 5 attempts, will retry on next request');
        } else {
          // Wait 3 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    // Retry again after 10 seconds even if all retries exhausted
    setTimeout(() => this.attemptConnection(), 10000);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      await this.$disconnect();
      await this.pool.end(); // Close connection pool
      this.logger.log('🔌 Database connection pool closed');
    }
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.on('SIGTERM', async () => {
      await app.close();
    });
    process.on('SIGINT', async () => {
      await app.close();
    });
  }
}
