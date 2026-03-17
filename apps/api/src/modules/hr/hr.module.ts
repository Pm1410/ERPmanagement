import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { PayrollProcessor } from '../../jobs/payroll.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'payroll-run' }),
  ],
  controllers: [HrController],
  providers: [HrService, PayrollProcessor],
  exports: [HrService],
})
export class HrModule {}
