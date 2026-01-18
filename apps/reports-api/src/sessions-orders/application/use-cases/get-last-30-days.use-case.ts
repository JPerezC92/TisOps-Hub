import { Injectable } from '@nestjs/common';
import type {
  ISessionsOrdersRepository,
  SessionsOrdersLast30DaysResult,
} from '../../domain/repositories/sessions-orders.repository.interface';

@Injectable()
export class GetLast30DaysUseCase {
  constructor(private readonly repository: ISessionsOrdersRepository) {}

  async execute(): Promise<SessionsOrdersLast30DaysResult> {
    return this.repository.findLast30Days();
  }
}
