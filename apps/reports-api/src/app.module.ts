import { Module } from '@nestjs/common';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { DomainErrorInterceptor } from '@shared/infrastructure/interceptors/domain-error.interceptor';
import { JSendInterceptor } from '@shared/infrastructure/interceptors/jsend.interceptor';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';

import { TasksModule } from './tasks/tasks.module';
import { ParentChildRequestsModule } from './parent-child-requests/parent-child-requests.module';
import { RequestCategorizationModule } from './request-categorization/infrastructure/request-categorization.module';
import { RequestTagsModule } from './request-tags/request-tags.module';
import { ErrorLogsModule } from './error-logs/infrastructure/error-logs.module';
import { WarRoomsModule } from './war-rooms/war-rooms.module';
import { SessionsOrdersModule } from './sessions-orders/sessions-orders.module';
import { MonthlyReportModule } from './monthly-report/monthly-report.module';
import { WeeklyCorrectiveModule } from './weekly-corrective/weekly-corrective.module';
import { ProblemsModule } from './problems/problems.module';
import { ApplicationRegistryModule } from './application-registry/infrastructure/application-registry.module';
import { MonthlyReportStatusRegistryModule } from './monthly-report-status-registry/infrastructure/monthly-report-status-registry.module';
import { CategorizationRegistryModule } from './categorization-registry/infrastructure/categorization-registry.module';
import { ModuleRegistryModule } from './module-registry/infrastructure/module-registry.module';
import { CorrectiveStatusRegistryModule } from './corrective-status-registry/infrastructure/corrective-status-registry.module';
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
      provide: APP_FILTER,
      useClass: DomainErrorFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    // Interceptor order: first registered = outermost (runs last on response)
    // Response flow: handler → DomainErrorInterceptor → ZodSerializerInterceptor → JSendInterceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: JSendInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DomainErrorInterceptor,
    },
  ],
})
export class AppModule {}
