import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  Database,
  DATABASE_CONNECTION,
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
} from '../../domain/repositories/application-registry.repository.interface';
import { Application } from '../../domain/entities/application.entity';
import { ApplicationPattern } from '../../domain/entities/application-pattern.entity';

@Injectable()
export class ApplicationRegistryRepository
  implements IApplicationRegistryRepository
{
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll(): Promise<Application[]> {
    const results = await this.db
      .select()
      .from(applicationRegistry)
      .where(eq(applicationRegistry.isActive, true))
      .orderBy(applicationRegistry.code)
      .all();

    return results.map(
      (r) =>
        new Application(
          r.id,
          r.code,
          r.name,
          r.description,
          r.isActive,
          r.createdAt,
          r.updatedAt,
        ),
    );
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

    return new Application(
      result.id,
      result.code,
      result.name,
      result.description,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
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

    return new Application(
      result.id,
      result.code,
      result.name,
      result.description,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
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

      const patternEntities = patterns.map(
        (p) =>
          new ApplicationPattern(
            p.id,
            p.applicationId,
            p.pattern,
            p.priority,
            p.matchType,
            p.isActive,
          ),
      );

      const appWithPatterns: ApplicationWithPatterns = Object.assign(
        new Application(
          app.id,
          app.code,
          app.name,
          app.description,
          app.isActive,
          app.createdAt,
          app.updatedAt,
        ),
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

    return new Application(
      result.id,
      result.code,
      result.name,
      result.description,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
  }

  async update(
    id: number,
    data: UpdateApplicationDto,
  ): Promise<Application> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const result = await this.db
      .update(applicationRegistry)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(applicationRegistry.id, id))
      .returning()
      .get();

    return new Application(
      result.id,
      result.code,
      result.name,
      result.description,
      result.isActive,
      result.createdAt,
      result.updatedAt,
    );
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
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

    return new ApplicationPattern(
      result.id,
      result.applicationId,
      result.pattern,
      result.priority,
      result.matchType,
      result.isActive,
    );
  }

  async deletePattern(id: number): Promise<void> {
    const result = await this.db
      .delete(applicationPatterns)
      .where(eq(applicationPatterns.id, id))
      .execute();

    if (result.rowsAffected === 0) {
      throw new NotFoundException(`Pattern with ID ${id} not found`);
    }
  }
}
