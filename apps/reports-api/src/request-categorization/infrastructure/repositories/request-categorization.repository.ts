import { Injectable } from '@nestjs/common';
import { eq, sql, and, isNotNull, ne } from 'drizzle-orm';
import { Database, requestCategorization, requestTags } from '@repo/database';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationEntity } from '@request-categorization/domain/entities/request-categorization.entity';

@Injectable()
export class RequestCategorizationRepository
  implements IRequestCategorizationRepository
{
  constructor(private readonly db: Database) {}

  async findAll(): Promise<RequestCategorizationEntity[]> {
    const results = await this.db.select().from(requestCategorization);
    return results.map((record) => this.toDomain(record));
  }

  async findAllWithAdditionalInfo(): Promise<
    Array<{
      requestId: string;
      category: string;
      technician: string;
      createdTime: string;
      modulo: string;
      subject: string;
      problemId: string;
      linkedRequestId: string;
      requestIdLink?: string;
      linkedRequestIdLink?: string;
      additionalInformation: string[];
      tagCategorizacion: string[];
    }>
  > {
    // Execute single LEFT JOIN query to fetch all categorizations with their related request_tags
    const results = await this.db
      .select({
        requestId: requestCategorization.requestId,
        category: requestCategorization.category,
        technician: requestCategorization.technician,
        createdTime: requestCategorization.createdTime,
        modulo: requestCategorization.modulo,
        subject: requestCategorization.subject,
        problemId: requestCategorization.problemId,
        linkedRequestId: requestCategorization.linkedRequestId,
        requestIdLink: requestCategorization.requestIdLink,
        linkedRequestIdLink: requestCategorization.linkedRequestIdLink,
        informacionAdicional: requestTags.informacionAdicional,
        categorizacion: requestTags.categorizacion,
      })
      .from(requestCategorization)
      .leftJoin(
        requestTags,
        and(
          eq(requestCategorization.linkedRequestId, requestTags.linkedRequestId),
          // Exclude "No asignado" from JOIN to avoid fetching computed columns
          ne(requestCategorization.linkedRequestId, 'No asignado'),
          isNotNull(requestCategorization.linkedRequestId),
          ne(requestCategorization.linkedRequestId, ''),
        ),
      )
      .orderBy(requestCategorization.requestId);

    // Group rows by requestId (primary key) and collect distinct informacion_adicional values
    const groupedResults = new Map<
      string,
      {
        requestId: string;
        category: string;
        technician: string;
        createdTime: string;
        modulo: string;
        subject: string;
        problemId: string;
        linkedRequestId: string;
        requestIdLink?: string;
        linkedRequestIdLink?: string;
        additionalInformation: Set<string>;
        tagCategorizacion: Set<string>;
      }
    >();

    for (const row of results) {
      if (!groupedResults.has(row.requestId)) {
        groupedResults.set(row.requestId, {
          requestId: row.requestId,
          category: row.category,
          technician: row.technician,
          createdTime: row.createdTime,
          modulo: row.modulo,
          subject: row.subject,
          problemId: row.problemId,
          linkedRequestId: row.linkedRequestId,
          requestIdLink: row.requestIdLink ?? undefined,
          linkedRequestIdLink: row.linkedRequestIdLink ?? undefined,
          additionalInformation: new Set(),
          tagCategorizacion: new Set(),
        });
      }

      // Add informacion_adicional to the set (only if it exists)
      if (row.informacionAdicional) {
        groupedResults.get(row.requestId)!.additionalInformation.add(row.informacionAdicional);
      }

      // Add categorizacion to the set (only if it exists and is valid)
      if (
        row.categorizacion &&
        row.categorizacion.trim() !== '' &&
        row.categorizacion !== 'No asignado'
      ) {
        groupedResults.get(row.requestId)!.tagCategorizacion.add(row.categorizacion);
      }
    }

    // Convert Map to array and Set to array
    return Array.from(groupedResults.values()).map((record) => ({
      ...record,
      additionalInformation: Array.from(record.additionalInformation),
      tagCategorizacion: Array.from(record.tagCategorizacion),
    }));
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

  async upsertMany(
    entities: RequestCategorizationEntity[],
  ): Promise<{ created: number; updated: number }> {
    const values = entities.map((entity) => ({
      requestId: entity.getRequestId(),
      category: entity.getCategory(),
      technician: entity.getTechnician(),
      requestIdLink: entity.getRequestIdLink(),
      createdTime: entity.getCreatedTime(),
      modulo: entity.getModulo(),
      subject: entity.getSubject(),
      problemId: entity.getProblemId(),
      linkedRequestId: entity.getLinkedRequestId(),
      linkedRequestIdLink: entity.getLinkedRequestIdLink(),
    }));

    // SQLite UPSERT using INSERT ... ON CONFLICT DO UPDATE
    // Since requestId is now the primary key, it will update if exists, insert if not
    // Note: excluded references use the INSERT column names (camelCase), not db column names (snake_case)
    const result = await this.db
      .insert(requestCategorization)
      .values(values)
      .onConflictDoUpdate({
        target: requestCategorization.requestId,
        set: {
          category: sql`excluded.${sql.identifier('category')}`,
          technician: sql`excluded.${sql.identifier('technician')}`,
          requestIdLink: sql`excluded.${sql.identifier('requestIdLink')}`,
          createdTime: sql`excluded.${sql.identifier('createdTime')}`,
          modulo: sql`excluded.${sql.identifier('modulo')}`,
          subject: sql`excluded.${sql.identifier('subject')}`,
          problemId: sql`excluded.${sql.identifier('problemId')}`,
          linkedRequestId: sql`excluded.${sql.identifier('linkedRequestId')}`,
          linkedRequestIdLink: sql`excluded.${sql.identifier('linkedRequestIdLink')}`,
        },
      })
      .returning();

    // Count how many were created vs updated by checking if they existed before
    const existingRequestIds = await this.db
      .select({ requestId: requestCategorization.requestId })
      .from(requestCategorization)
      .where(
        sql`${requestCategorization.requestId} IN (${sql.join(
          values.map((v) => sql`${v.requestId}`),
          sql`, `,
        )})`,
      );

    const existingSet = new Set(existingRequestIds.map((r) => r.requestId));
    const updated = values.filter((v) => existingSet.has(v.requestId)).length;
    const created = values.length - updated;

    return { created, updated };
  }

  async findRequestIdsByCategorizacion(
    linkedRequestId: string,
    categorizacion: string,
  ): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    const results = await this.db
      .selectDistinct({
        requestId: requestTags.requestId,
        requestIdLink: requestTags.requestIdLink,
      })
      .from(requestTags)
      .leftJoin(
        requestCategorization,
        eq(requestTags.requestId, requestCategorization.requestId),
      )
      .where(
        and(
          eq(requestTags.linkedRequestId, linkedRequestId),
          eq(requestTags.categorizacion, categorizacion),
        ),
      )
      .orderBy(requestTags.requestId);

    return results.map((r) => ({
      requestId: r.requestId,
      requestIdLink: r.requestIdLink ?? undefined,
    }));
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
      dbRecord.requestId,
      dbRecord.category,
      dbRecord.technician,
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
