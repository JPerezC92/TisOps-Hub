  import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { TasksModule } from './tasks/tasks.module';
import { ParentChildRequestsModule } from './parent-child-requests/parent-child-requests.module';
import { RequestCategorizationModule } from './request-categorization/request-categorization.module';
import { Rep01TagsModule } from './rep01-tags/rep01-tags.module';
import { ErrorLogsModule } from './error-logs/error-logs.module';
import { DatabaseModule } from './database/infrastructure/database.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    DatabaseModule,
    TasksModule,
    ParentChildRequestsModule,
    RequestCategorizationModule,
    Rep01TagsModule,
    ErrorLogsModule,
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
