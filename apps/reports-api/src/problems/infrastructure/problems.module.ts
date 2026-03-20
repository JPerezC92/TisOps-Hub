import { Module } from '@nestjs/common';
import { ProblemsController } from '@problems/infrastructure/problems.controller';
import { ProblemsRepository } from '@problems/infrastructure/repositories/problems.repository';
import { ProblemsExcelParser } from '@problems/infrastructure/parsers/problems-excel.parser';
import { PROBLEMS_REPOSITORY } from '@problems/domain/repositories/problems.repository.interface';
import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';
import { GetAllProblemsUseCase } from '@problems/application/use-cases/get-all-problems.use-case';
import { DeleteAllProblemsUseCase } from '@problems/application/use-cases/delete-all-problems.use-case';
import { UploadAndParseProblemsUseCase } from '@problems/application/use-cases/upload-and-parse-problems.use-case';
import { DatabaseModule } from '@database/infrastructure/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProblemsController],
  providers: [
    ProblemsExcelParser,
    {
      provide: PROBLEMS_REPOSITORY,
      useClass: ProblemsRepository,
    },
    {
      provide: GetAllProblemsUseCase,
      useFactory: (repo: IProblemsRepository) => new GetAllProblemsUseCase(repo),
      inject: [PROBLEMS_REPOSITORY],
    },
    {
      provide: DeleteAllProblemsUseCase,
      useFactory: (repo: IProblemsRepository) => new DeleteAllProblemsUseCase(repo),
      inject: [PROBLEMS_REPOSITORY],
    },
    {
      provide: UploadAndParseProblemsUseCase,
      useFactory: (repo: IProblemsRepository) => new UploadAndParseProblemsUseCase(repo),
      inject: [PROBLEMS_REPOSITORY],
    },
  ],
})
export class ProblemsModule {}
