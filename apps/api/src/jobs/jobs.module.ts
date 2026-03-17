import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduledTasks } from './scheduled.tasks';
import { ReportCardProcessor } from './report-card.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'notification-queue' },
      { name: 'report-card' },
      { name: 'payroll-run' },
      { name: 'export-queue' },
    ),
  ],
  providers: [ScheduledTasks, ReportCardProcessor],
  exports: [BullModule],
})
export class JobsModule {}
