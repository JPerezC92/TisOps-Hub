import type { IWeeklyCorrectiveRepository, L3TicketsByStatusResult } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';

export class GetL3TicketsByStatusUseCase {
  constructor(private readonly repository: IWeeklyCorrectiveRepository) {}

  async execute(app?: string, month?: string): Promise<L3TicketsByStatusResult> {
    return this.repository.findL3TicketsByStatus(app, month);
  }
}
