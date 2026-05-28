import { Injectable } from '@nestjs/common';
import { connection } from 'mongoose';

type HealthStatus = {
  ok: boolean;
  service: string;
  environment: string;
  database: {
    state: string;
    connected: boolean;
  };
  timestamp: string;
};

const mongoStates: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

@Injectable()
export class AppService {
  getRoot() {
    return {
      service: 'GnoudCRM Machinery API',
      health: '/api/health',
    };
  }

  getHealth(): HealthStatus {
    const readyState = Number(connection.readyState);
    const connected = readyState === 1;

    return {
      ok: connected,
      service: 'GnoudCRM Machinery API',
      environment: process.env.NODE_ENV ?? 'development',
      database: {
        state: mongoStates[readyState] ?? 'unknown',
        connected,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
