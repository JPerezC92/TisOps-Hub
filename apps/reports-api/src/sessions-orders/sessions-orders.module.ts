import { Module } from '@nestjs/common';
import { SessionsOrdersController } from './sessions-orders.controller';
import { SessionsOrdersService } from './sessions-orders.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { SessionsOrdersRepository } from './infrastructure/repositories/sessions-orders.repository';
import { SessionsOrdersExcelParser } from './infrastructure/parsers/sessions-orders-excel.parser';
import { SESSIONS_ORDERS_REPOSITORY } from './domain/repositories/sessions-orders.repository.interface';
import { GetAllSessionsOrdersUseCase } from './application/use-cases/get-all-sessions-orders.use-case';
import { DeleteAllSessionsOrdersUseCase } from './application/use-cases/delete-all-sessions-orders.use-case';
import { UploadAndParseSessionsOrdersUseCase } from './application/use-cases/upload-and-parse-sessions-orders.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [SessionsOrdersController],
  providers: [
    SessionsOrdersService,
    SessionsOrdersExcelParser,
    {
      provide: SESSIONS_ORDERS_REPOSITORY,
      useClass: SessionsOrdersRepository,
    },
    {
      provide: GetAllSessionsOrdersUseCase,
      useFactory: (repository: any) => new GetAllSessionsOrdersUseCase(repository),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
    {
      provide: DeleteAllSessionsOrdersUseCase,
      useFactory: (repository: any) => new DeleteAllSessionsOrdersUseCase(repository),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
    {
      provide: UploadAndParseSessionsOrdersUseCase,
      useFactory: (repository: any) => new UploadAndParseSessionsOrdersUseCase(repository),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
  ],
  exports: [SessionsOrdersService],
})
export class SessionsOrdersModule {}
