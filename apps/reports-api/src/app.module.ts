import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { TasksModule } from './tasks/tasks.module';
import { ParentChildRequestsModule } from './parent-child-requests/parent-child-requests.module';
import { RequestCategorizationModule } from './request-categorization/request-categorization.module';
import { RequestTagsModule } from './request-tags/request-tags.module';
import { ErrorLogsModule } from './error-logs/error-logs.module';
import { WarRoomsModule } from './war-rooms/war-rooms.module';
import { SessionsOrdersModule } from './sessions-orders/sessions-orders.module';
import { MonthlyReportModule } from './monthly-report/monthly-report.module';
import { WeeklyCorrectiveModule } from './weekly-corrective/weekly-corrective.module';
import { ProblemsModule } from './problems/problems.module';
import { ApplicationRegistryModule } from './application-registry/application-registry.module';
import { MonthlyReportStatusRegistryModule } from './monthly-report-status-registry/monthly-report-status-registry.module';
import { CategorizationRegistryModule } from './categorization-registry/categorization-registry.module';
import { ModuleRegistryModule } from './module-registry/module-registry.module';
import { CorrectiveStatusRegistryModule } from './corrective-status-registry/corrective-status-registry.module';
import { DatabaseModule } from './database/infrastructure/database.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    DatabaseModule,
    TasksModule,
    ParentChildRequestsModule,
    RequestCategorizationModule,
    RequestTagsModule,
    ErrorLogsModule,
    WarRoomsModule,
    SessionsOrdersModule,
    MonthlyReportModule,
    WeeklyCorrectiveModule,
    ProblemsModule,
    ApplicationRegistryModule,
    MonthlyReportStatusRegistryModule,
    CategorizationRegistryModule,
    ModuleRegistryModule,
    CorrectiveStatusRegistryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
