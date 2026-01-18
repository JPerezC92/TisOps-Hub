import { Injectable } from '@nestjs/common';
import type {
  ISessionsOrdersRepository,
  IncidentsVsOrdersByMonthResult,
} from '../../domain/repositories/sessions-orders.repository.interface';

@Injectable()
export class GetIncidentsVsOrdersByMonthUseCase {
  constructor(private readonly repository: ISessionsOrdersRepository) {}

  async execute(year?: number): Promise<IncidentsVsOrdersByMonthResult> {
    return this.repository.findIncidentsVsOrdersByMonth(year);
  }
}
