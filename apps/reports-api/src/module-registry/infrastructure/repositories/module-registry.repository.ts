import { eq } from 'drizzle-orm';
import { Database, moduleRegistry } from '@repo/database';
import { Module } from '@module-registry/domain/entities/module.entity';
import {
  IModuleRegistryRepository,
  CreateModuleDto,
  UpdateModuleDto,
} from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleAdapter } from '@module-registry/infrastructure/adapters/module.adapter';


export class ModuleRegistryRepository implements IModuleRegistryRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Module[]> {
    const results = await this.db.select().from(moduleRegistry);
    return results.map(ModuleAdapter.toDomain);
  }

  async findById(id: number): Promise<Module | null> {
    const results = await this.db
      .select()
      .from(moduleRegistry)
      .where(eq(moduleRegistry.id, id));

    if (results.length === 0) {
      return null;
    }

    return ModuleAdapter.toDomain(results[0]);
  }

  async findBySourceValue(sourceValue: string): Promise<Module | null> {
    const results = await this.db
      .select()
      .from(moduleRegistry)
      .where(eq(moduleRegistry.sourceValue, sourceValue));

    if (results.length === 0) {
      return null;
    }

    return ModuleAdapter.toDomain(results[0]);
  }

  async findByApplication(application: string): Promise<Module[]> {
    const results = await this.db
      .select()
      .from(moduleRegistry)
      .where(eq(moduleRegistry.application, application));

    return results.map(ModuleAdapter.toDomain);
  }

  async create(data: CreateModuleDto): Promise<Module> {
    const result = await this.db
      .insert(moduleRegistry)
      .values({
        sourceValue: data.sourceValue,
        displayValue: data.displayValue,
        application: data.application,
        isActive: data.isActive ?? true,
      })
      .returning();

    return ModuleAdapter.toDomain(result[0]);
  }

  async update(id: number, data: UpdateModuleDto): Promise<Module> {
    const result = await this.db
      .update(moduleRegistry)
      .set({
        ...(data.sourceValue !== undefined && { sourceValue: data.sourceValue }),
        ...(data.displayValue !== undefined && { displayValue: data.displayValue }),
        ...(data.application !== undefined && { application: data.application }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })
      .where(eq(moduleRegistry.id, id))
      .returning();

    return ModuleAdapter.toDomain(result[0]);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(moduleRegistry)
      .set({ isActive: false })
      .where(eq(moduleRegistry.id, id));
  }
}
