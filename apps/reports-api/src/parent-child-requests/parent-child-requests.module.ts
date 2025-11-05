import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ParentChildRequestsController } from '@parent-child-requests/parent-child-requests.controller';
import { ParentChildRequestsService } from '@parent-child-requests/parent-child-requests.service';
import { PARENT_CHILD_REQUEST_REPOSITORY } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { ParentChildRequestRepository } from '@parent-child-requests/infrastructure/repositories/parent-child-request.repository';
import { ExcelParserService } from '@parent-child-requests/infrastructure/services/excel-parser.service';
import { GetAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/get-all-parent-child-requests.use-case';
import { GetChildrenByParentUseCase } from '@parent-child-requests/application/use-cases/get-children-by-parent.use-case';
import { GetStatsUseCase } from '@parent-child-requests/application/use-cases/get-stats.use-case';
import { CreateManyParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/create-many.use-case';
import { DeleteAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/delete-all.use-case';
import { DATABASE_CONNECTION } from '@repo/database';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  ],
  controllers: [ParentChildRequestsController],
  providers: [
    ParentChildRequestsService,
    ExcelParserService, // Infrastructure service
    // Repository
    {
      provide: PARENT_CHILD_REQUEST_REPOSITORY,
      useFactory: (db) => new ParentChildRequestRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    // Use Cases
    {
      provide: GetAllParentChildRequestsUseCase,
      useFactory: (repository) =>
        new GetAllParentChildRequestsUseCase(repository),
      inject: [PARENT_CHILD_REQUEST_REPOSITORY],
    },
    {
      provide: GetChildrenByParentUseCase,
      useFactory: (repository) => new GetChildrenByParentUseCase(repository),
      inject: [PARENT_CHILD_REQUEST_REPOSITORY],
    },
    {
      provide: GetStatsUseCase,
      useFactory: (repository) => new GetStatsUseCase(repository),
      inject: [PARENT_CHILD_REQUEST_REPOSITORY],
    },
    {
      provide: CreateManyParentChildRequestsUseCase,
      useFactory: (repository) => new CreateManyParentChildRequestsUseCase(repository),
      inject: [PARENT_CHILD_REQUEST_REPOSITORY],
    },
    {
      provide: DeleteAllParentChildRequestsUseCase,
      useFactory: (repository) => new DeleteAllParentChildRequestsUseCase(repository),
      inject: [PARENT_CHILD_REQUEST_REPOSITORY],
    },
  ],
})
export class ParentChildRequestsModule {}
