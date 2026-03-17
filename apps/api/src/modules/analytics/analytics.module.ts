import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DashboardsService } from './dashboards.service';
import { ReportBuilderService } from './report-builder.service';
import { ExportProcessor } from './export.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'export-queue' }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, DashboardsService, ReportBuilderService, ExportProcessor],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
