import { Module } from '@nestjs/common';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { ProblemsRepository } from './infrastructure/repositories/problems.repository';
import { ProblemsExcelParser } from './infrastructure/parsers/problems-excel.parser';
import { PROBLEMS_REPOSITORY } from './domain/repositories/problems.repository.interface';
import { GetAllProblemsUseCase } from './application/use-cases/get-all-problems.use-case';
import { DeleteAllProblemsUseCase } from './application/use-cases/delete-all-problems.use-case';
import { UploadAndParseProblemsUseCase } from './application/use-cases/upload-and-parse-problems.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [ProblemsController],
  providers: [
    ProblemsService,
    ProblemsExcelParser,
    {
      provide: PROBLEMS_REPOSITORY,
      useClass: ProblemsRepository,
    },
    {
      provide: GetAllProblemsUseCase,
      useFactory: (repository: any) => new GetAllProblemsUseCase(repository),
      inject: [PROBLEMS_REPOSITORY],
    },
    {
      provide: DeleteAllProblemsUseCase,
      useFactory: (repository: any) => new DeleteAllProblemsUseCase(repository),
      inject: [PROBLEMS_REPOSITORY],
    },
    {
      provide: UploadAndParseProblemsUseCase,
      useFactory: (repository: any) => new UploadAndParseProblemsUseCase(repository),
      inject: [PROBLEMS_REPOSITORY],
    },
  ],
  exports: [ProblemsService],
})
export class ProblemsModule {}
