import { Module } from '@nestjs/common';
import { SessionsOrdersController } from '@sessions-orders/infrastructure/sessions-orders.controller';
import { SessionsOrdersRepository } from '@sessions-orders/infrastructure/repositories/sessions-orders.repository';
import { SessionsOrdersExcelParser } from '@sessions-orders/infrastructure/parsers/sessions-orders-excel.parser';
import { SESSIONS_ORDERS_REPOSITORY } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import { GetAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/get-all-sessions-orders.use-case';
import { DeleteAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/delete-all-sessions-orders.use-case';
import { UploadAndParseSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/upload-and-parse-sessions-orders.use-case';
import { GetLast30DaysUseCase } from '@sessions-orders/application/use-cases/get-last-30-days.use-case';
import { GetIncidentsVsOrdersByMonthUseCase } from '@sessions-orders/application/use-cases/get-incidents-vs-orders-by-month.use-case';
import { DatabaseModule } from '@database/infrastructure/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SessionsOrdersController],
  providers: [
    SessionsOrdersExcelParser,
    {
      provide: SESSIONS_ORDERS_REPOSITORY,
      useClass: SessionsOrdersRepository,
    },
    {
      provide: GetAllSessionsOrdersUseCase,
      useFactory: (repo: ISessionsOrdersRepository) => new GetAllSessionsOrdersUseCase(repo),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
    {
      provide: DeleteAllSessionsOrdersUseCase,
      useFactory: (repo: ISessionsOrdersRepository) => new DeleteAllSessionsOrdersUseCase(repo),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
    {
      provide: UploadAndParseSessionsOrdersUseCase,
      useFactory: (repo: ISessionsOrdersRepository) => new UploadAndParseSessionsOrdersUseCase(repo),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
    {
      provide: GetLast30DaysUseCase,
      useFactory: (repo: ISessionsOrdersRepository) => new GetLast30DaysUseCase(repo),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
    {
      provide: GetIncidentsVsOrdersByMonthUseCase,
      useFactory: (repo: ISessionsOrdersRepository) => new GetIncidentsVsOrdersByMonthUseCase(repo),
      inject: [SESSIONS_ORDERS_REPOSITORY],
    },
  ],
})
export class SessionsOrdersModule {}
