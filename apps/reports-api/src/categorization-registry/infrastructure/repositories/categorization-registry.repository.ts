import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db, categorizationRegistry } from '@repo/database';
import { Categorization } from '../../domain/entities/categorization.entity';
import {
  ICategorizationRegistryRepository,
  CreateCategorizationDto,
  UpdateCategorizationDto,
} from '../../domain/repositories/categorization-registry.repository.interface';

@Injectable()
export class CategorizationRegistryRepository implements ICategorizationRegistryRepository {
  async findAll(): Promise<Categorization[]> {
    const results = await db.select().from(categorizationRegistry);
    return results.map(this.mapToEntity);
  }

  async findById(id: number): Promise<Categorization | null> {
    const results = await db
      .select()
      .from(categorizationRegistry)
      .where(eq(categorizationRegistry.id, id));

    if (results.length === 0) {
      return null;
    }

    return this.mapToEntity(results[0]);
  }

  async findBySourceValue(sourceValue: string): Promise<Categorization | null> {
    const results = await db
      .select()
      .from(categorizationRegistry)
      .where(eq(categorizationRegistry.sourceValue, sourceValue));

    if (results.length === 0) {
      return null;
    }

    return this.mapToEntity(results[0]);
  }

  async create(data: CreateCategorizationDto): Promise<Categorization> {
    const result = await db
      .insert(categorizationRegistry)
      .values({
        sourceValue: data.sourceValue,
        displayValue: data.displayValue,
        isActive: data.isActive ?? true,
      })
      .returning();

    return this.mapToEntity(result[0]);
  }

  async update(id: number, data: UpdateCategorizationDto): Promise<Categorization> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Categorization with ID ${id} not found`);
    }

    const result = await db
      .update(categorizationRegistry)
      .set({
        ...(data.sourceValue !== undefined && { sourceValue: data.sourceValue }),
        ...(data.displayValue !== undefined && { displayValue: data.displayValue }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })
      .where(eq(categorizationRegistry.id, id))
      .returning();

    return this.mapToEntity(result[0]);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Categorization with ID ${id} not found`);
    }

    await db
      .update(categorizationRegistry)
      .set({ isActive: false })
      .where(eq(categorizationRegistry.id, id));
  }

  private mapToEntity(record: typeof categorizationRegistry.$inferSelect): Categorization {
    return new Categorization(
      record.id,
      record.sourceValue,
      record.displayValue,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }
}
