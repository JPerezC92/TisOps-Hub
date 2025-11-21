import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE_CONNECTION, problems, Problem, InsertProblem } from '@repo/database';
import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';

@Injectable()
export class ProblemsRepository implements IProblemsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll(): Promise<Problem[]> {
    return this.db.select().from(problems).all();
  }

  async countAll(): Promise<number> {
    const result = await this.db.select().from(problems).all();
    return result.length;
  }

  async bulkCreate(records: InsertProblem[]): Promise<void> {
    if (records.length === 0) return;

    // Batch size for optimal performance (similar to other modules)
    const batchSize = 50;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.db.insert(problems).values(batch).execute();
    }
  }

  async deleteAll(): Promise<number> {
    const result = await this.db.delete(problems).execute();
    return result.rowsAffected || 0;
  }
}
