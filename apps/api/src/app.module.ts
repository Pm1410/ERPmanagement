import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';

import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { S3Module } from './common/storage/s3.module';

import { AuthModule } from './modules/auth/auth.module';
import { StudentModule } from './modules/student/student.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AcademicModule } from './modules/academic/academic.module';
import { ExamModule } from './modules/exam/exam.module';
import { FeeModule } from './modules/fee/fee.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { LibraryModule } from './modules/library/library.module';
import { NoticeModule } from './modules/notice/notice.module';
import { GrievanceModule } from './modules/grievance/grievance.module';
import { HrModule } from './modules/hr/hr.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HostelModule } from './modules/hostel/hostel.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { TransportModule } from './modules/transport/transport.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { ParentsModule } from './modules/parents/parents.module';
import { SettingsModule } from './modules/settings/settings.module';
import { JobsModule } from './jobs/jobs.module';
import { EventsGateway } from './gateway/events.gateway';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        throttlers: [{ ttl: cs.get<number>('RATE_LIMIT_WINDOW_MS', 900000), limit: cs.get<number>('RATE_LIMIT_MAX', 100) }],
      }),
    }),

    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: ':' }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        redis: cs.get<string>('REDIS_URL', 'redis://localhost:6379'),
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 } },
      }),
    }),

    // Common
    PrismaModule,
    RedisModule,
    S3Module,

    // Feature modules
    AuthModule,
    StudentModule,
    FacultyModule,
    AttendanceModule,
    AcademicModule,
    ExamModule,
    FeeModule,
    AssignmentModule,
    LibraryModule,
    NoticeModule,
    GrievanceModule,
    HrModule,
    AnalyticsModule,
    NotificationModule,
    HostelModule,
    AdmissionsModule,
    TransportModule,
    MaterialsModule,
    ParentsModule,
    SettingsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    Reflector,
    EventsGateway,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
