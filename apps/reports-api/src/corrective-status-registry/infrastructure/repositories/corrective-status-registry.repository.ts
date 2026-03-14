import {
  Database,
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
import { CorrectiveStatusAdapter } from '@corrective-status-registry/infrastructure/adapters/corrective-status.adapter';

export class CorrectiveStatusRegistryRepository
  implements ICorrectiveStatusRegistryRepository
{
  constructor(private readonly db: Database) {}

  async findAll(): Promise<CorrectiveStatus[]> {
    const results = await this.db
      .select()
      .from(correctiveStatusRegistry)
      .where(eq(correctiveStatusRegistry.isActive, true))
      .orderBy(correctiveStatusRegistry.rawStatus)
      .all();

    return results.map(CorrectiveStatusAdapter.toDomain);
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

    return CorrectiveStatusAdapter.toDomain(result);
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

    return CorrectiveStatusAdapter.toDomain(result);
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

    return CorrectiveStatusAdapter.toDomain(result);
  }

  async update(
    id: number,
    data: UpdateCorrectiveStatusDto,
  ): Promise<CorrectiveStatus> {
    const result = await this.db
      .update(correctiveStatusRegistry)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(correctiveStatusRegistry.id, id))
      .returning()
      .get();

    return CorrectiveStatusAdapter.toDomain(result);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(correctiveStatusRegistry)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(correctiveStatusRegistry.id, id))
      .execute();
  }
}
