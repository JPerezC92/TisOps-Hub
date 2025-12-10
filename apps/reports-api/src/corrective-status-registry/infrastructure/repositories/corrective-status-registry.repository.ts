import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  Database,
  DATABASE_CONNECTION,
  correctiveStatusRegistry,
  InsertCorrectiveStatusRegistry,
} from '@repo/database';
import { eq } from 'drizzle-orm';
import type {
  ICorrectiveStatusRegistryRepository,
  CreateCorrectiveStatusDto,
  UpdateCorrectiveStatusDto,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

@Injectable()
export class CorrectiveStatusRegistryRepository
  implements ICorrectiveStatusRegistryRepository
{
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll(): Promise<CorrectiveStatus[]> {
    const results = await this.db
      .select()
      .from(correctiveStatusRegistry)
      .where(eq(correctiveStatusRegistry.isActive, true))
      .orderBy(correctiveStatusRegistry.rawStatus)
      .all();

    return results.map(
      (r) =>
        new CorrectiveStatus(
          r.id,
          r.rawStatus,
          r.displayStatus,
          r.isActive,
          r.createdAt,
          r.updatedAt,
        ),
    );
  }

  async findById(id: number): Promise<CorrectiveStatus | null> {
    const result = await this.db
      .select()
      .from(correctiveStatusRegistry)
      .where(eq(correctiveStatusRegistry.id, id))
      .get();

    if (!result) {
      return null;
    }

    return new CorrectiveStatus(
      result.id,
      result.rawStatus,
      result.displayStatus,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
  }

  async findByRawStatus(rawStatus: string): Promise<CorrectiveStatus | null> {
    const result = await this.db
      .select()
      .from(correctiveStatusRegistry)
      .where(eq(correctiveStatusRegistry.rawStatus, rawStatus))
      .get();

    if (!result) {
      return null;
    }

    return new CorrectiveStatus(
      result.id,
      result.rawStatus,
      result.displayStatus,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
  }

  async findDistinctDisplayStatuses(): Promise<string[]> {
    const results = await this.db
      .selectDistinct({ displayStatus: correctiveStatusRegistry.displayStatus })
      .from(correctiveStatusRegistry)
      .where(eq(correctiveStatusRegistry.isActive, true))
      .orderBy(correctiveStatusRegistry.displayStatus)
      .all();

    return results.map((r) => r.displayStatus);
  }

  async create(data: CreateCorrectiveStatusDto): Promise<CorrectiveStatus> {
    const insertData: InsertCorrectiveStatusRegistry = {
      rawStatus: data.rawStatus,
      displayStatus: data.displayStatus,
      isActive: data.isActive ?? true,
    };

    const result = await this.db
      .insert(correctiveStatusRegistry)
      .values(insertData)
      .returning()
      .get();

    return new CorrectiveStatus(
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
    data: UpdateCorrectiveStatusDto,
  ): Promise<CorrectiveStatus> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Corrective status with ID ${id} not found`);
    }

    const result = await this.db
      .update(correctiveStatusRegistry)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(correctiveStatusRegistry.id, id))
      .returning()
      .get();

    return new CorrectiveStatus(
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
      throw new NotFoundException(`Corrective status with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.db
      .update(correctiveStatusRegistry)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(correctiveStatusRegistry.id, id))
      .execute();
  }
}
