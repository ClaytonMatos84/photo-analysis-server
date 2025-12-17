import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoAnalysisModule } from './photo-analysis/photo-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.LOG_LEVEL ||
          (process.env.NODE_ENV !== 'production' ? 'debug' : 'info'),
        autoLogging: true,
        redact: ['req.headers.authorization', 'req.headers.cookie', 'password'],
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        genReqId: (req) =>
          (req.headers['x-request-id'] as string) || randomUUID(),
        customProps: (req) => ({
          requestId:
            typeof req.headers['x-request-id'] === 'string'
              ? req.headers['x-request-id']
              : randomUUID(),
          service: 'photo-analysis-server',
        }),
      },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true, // Para dev, depois usar migrations
    }),
    AuthModule,
    PhotoAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
