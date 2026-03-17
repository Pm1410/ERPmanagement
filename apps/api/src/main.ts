import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bull';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WinstonLogger } from './common/logger/winston.logger';
import { randomUUID } from 'crypto';

async function bootstrap() {
  const logger = WinstonLogger.getInstance();

  const app = await NestFactory.create(AppModule, { logger, bufferLogs: true });

  // Request ID (trace across logs)
  app.use((req: any, res: any, next: any) => {
    const rid = req.headers['x-request-id'] || randomUUID();
    req.requestId = rid;
    res.setHeader('x-request-id', rid);
    next();
  });

  // Access logs (structured-ish, production-friendly)
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const method = req.method;
      const url = req.originalUrl ?? req.url;
      const status = res.statusCode;
      const rid = req.requestId;
      const userId = req.user?.id;
      const institutionId = req.user?.institutionId;
      const role = req.user?.role;
      logger.log(
        `${method} ${url} ${status} ${ms}ms` +
          (rid ? ` rid=${rid}` : '') +
          (userId ? ` uid=${userId}` : '') +
          (institutionId ? ` iid=${institutionId}` : '') +
          (role ? ` role=${role}` : ''),
        'HTTP',
      );
    });
    next();
  });

  // Security
  app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));

  // CORS
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
  });

  app.setGlobalPrefix(process.env.API_PREFIX || 'api');
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useWebSocketAdapter(new IoAdapter(app) as any);

  // ── Bull Board (queue monitoring UI) ──────────────────────
  if (process.env.NODE_ENV !== 'production' || process.env.BULL_BOARD_ENABLED === 'true') {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    const queues = [
      'notification-queue', 'export-queue', 'payroll-run', 'report-card',
    ].map((name) => {
      try {
        const queue = app.get(getQueueToken(name));
        return new BullAdapter(queue);
      } catch { return null; }
    }).filter(Boolean) as BullAdapter[];

    createBullBoard({ queues, serverAdapter });

    const httpAdapter = app.getHttpAdapter();
    httpAdapter.use('/queues', serverAdapter.getRouter());
    logger.log('📊 Bull Board at /queues', 'Bootstrap');
  }

  // ── Swagger ────────────────────────────────────────────────
  /*
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('School ERP API')
      .setDescription('Complete REST API for School ERP Management System')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addTag('auth', 'Authentication & Authorization')
      .addTag('students', 'Student management')
      .addTag('faculty', 'Faculty management')
      .addTag('attendance', 'Attendance tracking')
      .addTag('academic', 'Academic year, classes, subjects')
      .addTag('exams', 'Exam scheduling & results')
      .addTag('fees', 'Fee collection & payments')
      .addTag('assignments', 'Assignments & submissions')
      .addTag('library', 'Library catalog & issues')
      .addTag('notices', 'Notices & communication')
      .addTag('notifications', 'Notification system')
      .addTag('grievances', 'Grievance management')
      .addTag('hr', 'HR, leaves & payroll')
      .addTag('analytics', 'Dashboard KPIs & reports')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log('📖 Swagger at /api/docs', 'Bootstrap');
  }
  */

  const port = parseInt(process.env.API_PORT || '3001', 10);
  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
