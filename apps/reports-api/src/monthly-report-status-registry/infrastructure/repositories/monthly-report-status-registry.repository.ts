import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  Database,
  DATABASE_CONNECTION,
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

@Injectable()
export class MonthlyReportStatusRegistryRepository
  implements IMonthlyReportStatusRegistryRepository
{
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll(): Promise<MonthlyReportStatus[]> {
    const results = await this.db
      .select()
      .from(monthlyReportStatusRegistry)
      .where(eq(monthlyReportStatusRegistry.isActive, true))
      .orderBy(monthlyReportStatusRegistry.rawStatus)
      .all();

    return results.map(
      (r) =>
        new MonthlyReportStatus(
          r.id,
          r.rawStatus,
          r.displayStatus,
          r.isActive,
          r.createdAt,
          r.updatedAt,
        ),
    );
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

    return new MonthlyReportStatus(
      result.id,
      result.rawStatus,
      result.displayStatus,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
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

    return new MonthlyReportStatus(
      result.id,
      result.rawStatus,
      result.displayStatus,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
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

    return new MonthlyReportStatus(
      result.id,
      result.rawStatus,
      result.displayStatus,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
  }

  async update(
    id: number,
    data: UpdateMonthlyReportStatusDto,
  ): Promise<MonthlyReportStatus> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Monthly report status with ID ${id} not found`);
    }

    const result = await this.db
      .update(monthlyReportStatusRegistry)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(monthlyReportStatusRegistry.id, id))
      .returning()
      .get();

    return new MonthlyReportStatus(
      result.id,
      result.rawStatus,
      result.displayStatus,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Monthly report status with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.db
      .update(monthlyReportStatusRegistry)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(monthlyReportStatusRegistry.id, id))
      .execute();
  }
}
