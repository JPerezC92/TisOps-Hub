import type { Problem, InsertProblem } from '@repo/database';

export const PROBLEMS_REPOSITORY = Symbol('PROBLEMS_REPOSITORY');

export interface IProblemsRepository {
  findAll(): Promise<Problem[]>;
  countAll(): Promise<number>;
  bulkCreate(records: InsertProblem[]): Promise<void>;
  deleteAll(): Promise<number>;
}
