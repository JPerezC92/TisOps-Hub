import { Module } from '@nestjs/common';
import { WeeklyCorrectiveController } from './weekly-corrective.controller';
import { WeeklyCorrectiveService } from './weekly-corrective.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { WeeklyCorrectiveRepository } from './infrastructure/repositories/weekly-corrective.repository';
import { WeeklyCorrectiveExcelParser } from './infrastructure/parsers/weekly-corrective-excel.parser';
import { WEEKLY_CORRECTIVE_REPOSITORY } from './domain/repositories/weekly-corrective.repository.interface';
import { GetAllWeeklyCorrectivesUseCase } from './application/use-cases/get-all-weekly-correctives.use-case';
import { DeleteAllWeeklyCorrectivesUseCase } from './application/use-cases/delete-all-weekly-correctives.use-case';
import { UploadAndParseWeeklyCorrectiveUseCase } from './application/use-cases/upload-and-parse-weekly-corrective.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [WeeklyCorrectiveController],
  providers: [
    WeeklyCorrectiveService,
    WeeklyCorrectiveExcelParser,
    {
      provide: WEEKLY_CORRECTIVE_REPOSITORY,
      useClass: WeeklyCorrectiveRepository,
    },
    {
      provide: GetAllWeeklyCorrectivesUseCase,
      useFactory: (repository: any) => new GetAllWeeklyCorrectivesUseCase(repository),
      inject: [WEEKLY_CORRECTIVE_REPOSITORY],
    },
    {
      provide: DeleteAllWeeklyCorrectivesUseCase,
      useFactory: (repository: any) => new DeleteAllWeeklyCorrectivesUseCase(repository),
      inject: [WEEKLY_CORRECTIVE_REPOSITORY],
    },
    {
      provide: UploadAndParseWeeklyCorrectiveUseCase,
      useFactory: (repository: any) => new UploadAndParseWeeklyCorrectiveUseCase(repository),
      inject: [WEEKLY_CORRECTIVE_REPOSITORY],
    },
  ],
  exports: [WeeklyCorrectiveService],
})
export class WeeklyCorrectiveModule {}
