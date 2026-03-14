import {
  Database,
  monthlyReportStatusRegistry,
  InsertMonthlyReportStatusRegistry,
} from '@repo/database';
import { eq } from 'drizzle-orm';
import type {
  IMonthlyReportStatusRegistryRepository,
  CreateMonthlyReportStatusDto,
  UpdateMonthlyReportStatusDto,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';
import { MonthlyReportStatusAdapter } from '@monthly-report-status-registry/infrastructure/adapters/monthly-report-status.adapter';

export class MonthlyReportStatusRegistryRepository
  implements IMonthlyReportStatusRegistryRepository
{
  constructor(private readonly db: Database) {}

  async findAll(): Promise<MonthlyReportStatus[]> {
    const results = await this.db
      .select()
      .from(monthlyReportStatusRegistry)
      .where(eq(monthlyReportStatusRegistry.isActive, true))
      .orderBy(monthlyReportStatusRegistry.rawStatus)
      .all();

    return results.map(MonthlyReportStatusAdapter.toDomain);
  }

  async findById(id: number): Promise<MonthlyReportStatus | null> {
    const result = await this.db
      .select()
      .from(monthlyReportStatusRegistry)
      .where(eq(monthlyReportStatusRegistry.id, id))
      .get();

    if (!result) {
      return null;
    }

    return MonthlyReportStatusAdapter.toDomain(result);
  }

  async findByRawStatus(rawStatus: string): Promise<MonthlyReportStatus | null> {
    const result = await this.db
      .select()
      .from(monthlyReportStatusRegistry)
      .where(eq(monthlyReportStatusRegistry.rawStatus, rawStatus))
      .get();

    if (!result) {
      return null;
    }

    return MonthlyReportStatusAdapter.toDomain(result);
  }

  async create(data: CreateMonthlyReportStatusDto): Promise<MonthlyReportStatus> {
    const insertData: InsertMonthlyReportStatusRegistry = {
      rawStatus: data.rawStatus,
      displayStatus: data.displayStatus,
      isActive: data.isActive ?? true,
    };

    const result = await this.db
      .insert(monthlyReportStatusRegistry)
      .values(insertData)
      .returning()
      .get();

    return MonthlyReportStatusAdapter.toDomain(result);
  }

  async update(
    id: number,
    data: UpdateMonthlyReportStatusDto,
  ): Promise<MonthlyReportStatus> {
    const result = await this.db
      .update(monthlyReportStatusRegistry)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(monthlyReportStatusRegistry.id, id))
      .returning()
      .get();

    return MonthlyReportStatusAdapter.toDomain(result);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(monthlyReportStatusRegistry)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(monthlyReportStatusRegistry.id, id))
      .execute();
  }
}
