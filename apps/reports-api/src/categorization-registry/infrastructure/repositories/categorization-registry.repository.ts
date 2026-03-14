import { eq } from 'drizzle-orm';
import { Database, categorizationRegistry } from '@repo/database';
import { Categorization } from '@categorization-registry/domain/entities/categorization.entity';
import {
  ICategorizationRegistryRepository,
  CreateCategorizationDto,
  UpdateCategorizationDto,
} from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationAdapter } from '@categorization-registry/infrastructure/adapters/categorization.adapter';


export class CategorizationRegistryRepository implements ICategorizationRegistryRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Categorization[]> {
    const results = await this.db.select().from(categorizationRegistry);
    return results.map(CategorizationAdapter.toDomain);
  }

  async findById(id: number): Promise<Categorization | null> {
    const results = await this.db
      .select()
      .from(categorizationRegistry)
      .where(eq(categorizationRegistry.id, id));

    if (results.length === 0) {
      return null;
    }

    return CategorizationAdapter.toDomain(results[0]);
  }

  async findBySourceValue(sourceValue: string): Promise<Categorization | null> {
    const results = await this.db
      .select()
      .from(categorizationRegistry)
      .where(eq(categorizationRegistry.sourceValue, sourceValue));

    if (results.length === 0) {
      return null;
    }

    return CategorizationAdapter.toDomain(results[0]);
  }

  async create(data: CreateCategorizationDto): Promise<Categorization> {
    const result = await this.db
      .insert(categorizationRegistry)
      .values({
        sourceValue: data.sourceValue,
        displayValue: data.displayValue,
        isActive: data.isActive ?? true,
      })
      .returning();

    return CategorizationAdapter.toDomain(result[0]);
  }

  async update(id: number, data: UpdateCategorizationDto): Promise<Categorization> {
    const result = await this.db
      .update(categorizationRegistry)
      .set({
        ...(data.sourceValue !== undefined && { sourceValue: data.sourceValue }),
        ...(data.displayValue !== undefined && { displayValue: data.displayValue }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })
      .where(eq(categorizationRegistry.id, id))
      .returning();

    return CategorizationAdapter.toDomain(result[0]);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(categorizationRegistry)
      .set({ isActive: false })
      .where(eq(categorizationRegistry.id, id));
  }
}
