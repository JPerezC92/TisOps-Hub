import type {
  ISessionsOrdersRepository,
  IncidentsVsOrdersByMonthResult,
} from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';

export class GetIncidentsVsOrdersByMonthUseCase {
  constructor(private readonly repository: ISessionsOrdersRepository) {}

  async execute(year?: number): Promise<IncidentsVsOrdersByMonthResult> {
    return this.repository.findIncidentsVsOrdersByMonth(year);
  }
}
