import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const maxConnections = parseInt(process.env.DB_POOL_MAX || '10', 10);
    const idleTimeoutMs = parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10);
    const connectionTimeoutMs = parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '10000', 10);

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    const pool = new Pool({
      connectionString,
      max: maxConnections,
      idleTimeoutMillis: idleTimeoutMs,
      // Neon connections can take more than 2s depending on network/TLS setup.
      connectionTimeoutMillis: connectionTimeoutMs,
      application_name: 'newoteg-unified',
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });

    this.pool = pool;

    // Optional: log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + JSON.stringify(e.params));
        console.log('Duration: ' + e.duration + 'ms\n');
      });
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully with connection pooling');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pool.end();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting database:', error);
    }
  }
}
