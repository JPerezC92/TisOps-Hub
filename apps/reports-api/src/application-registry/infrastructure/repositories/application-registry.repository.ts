import {
  Database,
  applicationRegistry,
  applicationPatterns,
  InsertApplicationRegistry,
  InsertApplicationPattern,
} from '@repo/database';
import { eq, and, sql } from 'drizzle-orm';
import type {
  IApplicationRegistryRepository,
  CreateApplicationDto,
  UpdateApplicationDto,
  CreatePatternDto,
  ApplicationWithPatterns,
} from '@application-registry/domain/repositories/application-registry.repository.interface';
import { Application } from '@application-registry/domain/entities/application.entity';
import { ApplicationPattern } from '@application-registry/domain/entities/application-pattern.entity';
import { ApplicationAdapter, ApplicationPatternAdapter } from '@application-registry/infrastructure/adapters/application.adapter';

export class ApplicationRegistryRepository
  implements IApplicationRegistryRepository
{
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Application[]> {
    const results = await this.db
      .select()
      .from(applicationRegistry)
      .where(eq(applicationRegistry.isActive, true))
      .orderBy(applicationRegistry.code)
      .all();

    return results.map(ApplicationAdapter.toDomain);
  }

  async findById(id: number): Promise<Application | null> {
    const result = await this.db
      .select()
      .from(applicationRegistry)
      .where(eq(applicationRegistry.id, id))
      .get();

    if (!result) {
      return null;
    }

    return ApplicationAdapter.toDomain(result);
  }

  async findByPattern(applicationName: string): Promise<Application | null> {
    // Join with patterns table and find first match by priority
    const result = await this.db
      .select({
        id: applicationRegistry.id,
        code: applicationRegistry.code,
        name: applicationRegistry.name,
        description: applicationRegistry.description,
        isActive: applicationRegistry.isActive,
        createdAt: applicationRegistry.createdAt,
        updatedAt: applicationRegistry.updatedAt,
        patternPriority: applicationPatterns.priority,
      })
      .from(applicationPatterns)
      .innerJoin(
        applicationRegistry,
        eq(applicationPatterns.applicationId, applicationRegistry.id),
      )
      .where(
        and(
          eq(applicationPatterns.isActive, true),
          eq(applicationRegistry.isActive, true),
          sql`LOWER(${applicationName}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
        ),
      )
      .orderBy(applicationPatterns.priority)
      .get();

    if (!result) {
      return null;
    }

    return ApplicationAdapter.toDomain(result);
  }

  async findAllWithPatterns(): Promise<ApplicationWithPatterns[]> {
    const apps = await this.db
      .select()
      .from(applicationRegistry)
      .where(eq(applicationRegistry.isActive, true))
      .orderBy(applicationRegistry.code)
      .all();

    const appsWithPatterns: ApplicationWithPatterns[] = [];

    for (const app of apps) {
      const patterns = await this.db
        .select()
        .from(applicationPatterns)
        .where(eq(applicationPatterns.applicationId, app.id))
        .orderBy(applicationPatterns.priority)
        .all();

      const patternEntities = patterns.map(ApplicationPatternAdapter.toDomain);

      const appWithPatterns: ApplicationWithPatterns = Object.assign(
        ApplicationAdapter.toDomain(app),
        { patterns: patternEntities },
      );

      appsWithPatterns.push(appWithPatterns);
    }

    return appsWithPatterns;
  }

  async create(data: CreateApplicationDto): Promise<Application> {
    const insertData: InsertApplicationRegistry = {
      code: data.code,
      name: data.name,
      description: data.description || null,
      isActive: data.isActive ?? true,
    };

    const result = await this.db
      .insert(applicationRegistry)
      .values(insertData)
      .returning()
      .get();

    return ApplicationAdapter.toDomain(result);
  }

  async update(
    id: number,
    data: UpdateApplicationDto,
  ): Promise<Application> {
    const result = await this.db
      .update(applicationRegistry)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(applicationRegistry.id, id))
      .returning()
      .get();

    return ApplicationAdapter.toDomain(result);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(applicationRegistry)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(applicationRegistry.id, id))
      .execute();
  }

  async createPattern(data: CreatePatternDto): Promise<ApplicationPattern> {
    const insertData: InsertApplicationPattern = {
      applicationId: data.applicationId,
      pattern: data.pattern,
      priority: data.priority ?? 100,
      matchType: data.matchType ?? 'contains',
      isActive: data.isActive ?? true,
    };

    const result = await this.db
      .insert(applicationPatterns)
      .values(insertData)
      .returning()
      .get();

    return ApplicationPatternAdapter.toDomain(result);
  }

  async deletePattern(id: number): Promise<boolean> {
    const result = await this.db
      .delete(applicationPatterns)
      .where(eq(applicationPatterns.id, id))
      .execute();

    return result.rowsAffected > 0;
  }
}
