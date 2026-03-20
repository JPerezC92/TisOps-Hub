import type {
  ISessionsOrdersRepository,
  SessionsOrdersLast30DaysResult,
} from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';

export class GetLast30DaysUseCase {
  constructor(private readonly repository: ISessionsOrdersRepository) {}

  async execute(): Promise<SessionsOrdersLast30DaysResult> {
    return this.repository.findLast30Days();
  }
}
