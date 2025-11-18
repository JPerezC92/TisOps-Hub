import { WeeklyCorrective, InsertWeeklyCorrective } from '@repo/database';

export const WEEKLY_CORRECTIVE_REPOSITORY = Symbol('WEEKLY_CORRECTIVE_REPOSITORY');

export interface IWeeklyCorrectiveRepository {
  findAll(): Promise<WeeklyCorrective[]>;
  countAll(): Promise<number>;
  bulkCreate(records: InsertWeeklyCorrective[]): Promise<void>;
  deleteAll(): Promise<number>;
}
