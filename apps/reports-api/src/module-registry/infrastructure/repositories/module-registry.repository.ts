import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db, moduleRegistry } from '@repo/database';
import { Module } from '../../domain/entities/module.entity';
import {
  IModuleRegistryRepository,
  CreateModuleDto,
  UpdateModuleDto,
} from '../../domain/repositories/module-registry.repository.interface';

@Injectable()
export class ModuleRegistryRepository implements IModuleRegistryRepository {
  async findAll(): Promise<Module[]> {
    const results = await db.select().from(moduleRegistry);
    return results.map(this.mapToEntity);
  }

  async findById(id: number): Promise<Module | null> {
    const results = await db
      .select()
      .from(moduleRegistry)
      .where(eq(moduleRegistry.id, id));

    if (results.length === 0) {
      return null;
    }

    return this.mapToEntity(results[0]);
  }

  async findBySourceValue(sourceValue: string): Promise<Module | null> {
    const results = await db
      .select()
      .from(moduleRegistry)
      .where(eq(moduleRegistry.sourceValue, sourceValue));

    if (results.length === 0) {
      return null;
    }

    return this.mapToEntity(results[0]);
  }

  async findByApplication(application: string): Promise<Module[]> {
    const results = await db
      .select()
      .from(moduleRegistry)
      .where(eq(moduleRegistry.application, application));

    return results.map(this.mapToEntity);
  }

  async create(data: CreateModuleDto): Promise<Module> {
    const result = await db
      .insert(moduleRegistry)
      .values({
        sourceValue: data.sourceValue,
        displayValue: data.displayValue,
        application: data.application,
        isActive: data.isActive ?? true,
      })
      .returning();

    return this.mapToEntity(result[0]);
  }

  async update(id: number, data: UpdateModuleDto): Promise<Module> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    const result = await db
      .update(moduleRegistry)
      .set({
        ...(data.sourceValue !== undefined && { sourceValue: data.sourceValue }),
        ...(data.displayValue !== undefined && { displayValue: data.displayValue }),
        ...(data.application !== undefined && { application: data.application }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })
      .where(eq(moduleRegistry.id, id))
      .returning();

    return this.mapToEntity(result[0]);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    await db
      .update(moduleRegistry)
      .set({ isActive: false })
      .where(eq(moduleRegistry.id, id));
  }

  private mapToEntity(record: typeof moduleRegistry.$inferSelect): Module {
    return new Module(
      record.id,
      record.sourceValue,
      record.displayValue,
      record.application,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }
}
