import { Module } from '@nestjs/common';
import { WeeklyCorrectiveController } from '@weekly-corrective/infrastructure/weekly-corrective.controller';
import { WeeklyCorrectiveRepository } from '@weekly-corrective/infrastructure/repositories/weekly-corrective.repository';
import { WeeklyCorrectiveExcelParser } from '@weekly-corrective/infrastructure/parsers/weekly-corrective-excel.parser';
import { WEEKLY_CORRECTIVE_REPOSITORY } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import { GetAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/get-all-weekly-correctives.use-case';
import { DeleteAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/delete-all-weekly-correctives.use-case';
import { UploadAndParseWeeklyCorrectiveUseCase } from '@weekly-corrective/application/use-cases/upload-and-parse-weekly-corrective.use-case';
import { GetL3TicketsByStatusUseCase } from '@weekly-corrective/application/use-cases/get-l3-tickets-by-status.use-case';
import { DatabaseModule } from '@database/infrastructure/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WeeklyCorrectiveController],
  providers: [
    WeeklyCorrectiveExcelParser,
    {
      provide: WEEKLY_CORRECTIVE_REPOSITORY,
      useClass: WeeklyCorrectiveRepository,
    },
    {
      provide: GetAllWeeklyCorrectivesUseCase,
      useFactory: (repo: IWeeklyCorrectiveRepository) => new GetAllWeeklyCorrectivesUseCase(repo),
      inject: [WEEKLY_CORRECTIVE_REPOSITORY],
    },
    {
      provide: DeleteAllWeeklyCorrectivesUseCase,
      useFactory: (repo: IWeeklyCorrectiveRepository) => new DeleteAllWeeklyCorrectivesUseCase(repo),
      inject: [WEEKLY_CORRECTIVE_REPOSITORY],
    },
    {
      provide: UploadAndParseWeeklyCorrectiveUseCase,
      useFactory: (repo: IWeeklyCorrectiveRepository) => new UploadAndParseWeeklyCorrectiveUseCase(repo),
      inject: [WEEKLY_CORRECTIVE_REPOSITORY],
    },
    {
      provide: GetL3TicketsByStatusUseCase,
      useFactory: (repo: IWeeklyCorrectiveRepository) => new GetL3TicketsByStatusUseCase(repo),
      inject: [WEEKLY_CORRECTIVE_REPOSITORY],
    },
  ],
})
export class WeeklyCorrectiveModule {}
