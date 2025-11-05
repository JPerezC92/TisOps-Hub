import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { Database, requestCategorization } from '@repo/database';
import { IRequestCategorizationRepository } from '../../domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationEntity } from '../../domain/entities/request-categorization.entity';

@Injectable()
export class RequestCategorizationRepository
  implements IRequestCategorizationRepository
{
  constructor(private readonly db: Database) {}

  async findAll(): Promise<RequestCategorizationEntity[]> {
    const results = await this.db.select().from(requestCategorization);
    return results.map((record) => this.toDomain(record));
  }

  async findByCategory(category: string): Promise<RequestCategorizationEntity[]> {
    const results = await this.db
      .select()
      .from(requestCategorization)
      .where(eq(requestCategorization.category, category));
    return results.map((record) => this.toDomain(record));
  }

  async create(
    entity: RequestCategorizationEntity,
  ): Promise<RequestCategorizationEntity> {
    const [inserted] = await this.db
      .insert(requestCategorization)
      .values({
        category: entity.getCategory(),
        technician: entity.getTechnician(),
        requestId: entity.getRequestId(),
        requestIdLink: entity.getRequestIdLink(),
        createdTime: entity.getCreatedTime(),
        modulo: entity.getModulo(),
        subject: entity.getSubject(),
        problemId: entity.getProblemId(),
        linkedRequestId: entity.getLinkedRequestId(),
        linkedRequestIdLink: entity.getLinkedRequestIdLink(),
      })
      .returning();

    return this.toDomain(inserted);
  }

  async createMany(
    entities: RequestCategorizationEntity[],
  ): Promise<RequestCategorizationEntity[]> {
    const values = entities.map((entity) => ({
      category: entity.getCategory(),
      technician: entity.getTechnician(),
      requestId: entity.getRequestId(),
      requestIdLink: entity.getRequestIdLink(),
      createdTime: entity.getCreatedTime(),
      modulo: entity.getModulo(),
      subject: entity.getSubject(),
      problemId: entity.getProblemId(),
      linkedRequestId: entity.getLinkedRequestId(),
      linkedRequestIdLink: entity.getLinkedRequestIdLink(),
    }));

    const inserted = await this.db
      .insert(requestCategorization)
      .values(values)
      .returning();

    return inserted.map((record) => this.toDomain(record));
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(requestCategorization);
  }

  async getCategorySummary(): Promise<
    Array<{ category: string; count: number }>
  > {
    const results = await this.db
      .select({
        category: requestCategorization.category,
        count: sql<number>`count(*)`,
      })
      .from(requestCategorization)
      .groupBy(requestCategorization.category);

    return results.map((r) => ({ category: r.category, count: Number(r.count) }));
  }

  private toDomain(
    dbRecord: typeof requestCategorization.$inferSelect,
  ): RequestCategorizationEntity {
    return new RequestCategorizationEntity(
      dbRecord.id,
      dbRecord.category,
      dbRecord.technician,
      dbRecord.requestId,
      dbRecord.createdTime,
      dbRecord.modulo,
      dbRecord.subject,
      dbRecord.problemId,
      dbRecord.linkedRequestId,
      dbRecord.requestIdLink ?? undefined,
      dbRecord.linkedRequestIdLink ?? undefined,
    );
  }
}
