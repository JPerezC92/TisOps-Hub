import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  ModuleEvolutionResult,
} from '../../domain/repositories/monthly-report.repository.interface';

export interface ModuleEvolutionResponse {
  data: ModuleEvolutionResult[];
  total: number;
}

@Injectable()
export class GetModuleEvolutionUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(
    app?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ModuleEvolutionResponse> {
    const modules = await this.repository.findModuleEvolution(
      app,
      startDate,
      endDate,
    );
    const total = modules.reduce((sum, m) => sum + m.count, 0);
    return { data: modules, total };
  }
}
