import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to NEWOTEG Unified Backend API ✨';
  }

  getStatus(): { status: string; timestamp: string; version: string } {
    return {
      status: 'running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
