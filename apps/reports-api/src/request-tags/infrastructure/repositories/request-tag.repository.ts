import { eq, and, isNull, sql } from 'drizzle-orm';
import { db, requestTags, parentChildRequests } from '@repo/database';
import { IRequestTagRepository, RequestTagData } from '../../domain/repositories/request-tag.repository.interface';
import { RequestTag } from '../../domain/entities/request-tag.entity';

export class RequestTagRepository implements IRequestTagRepository {
  async findAll(): Promise<RequestTag[]> {
    const records = await db.select().from(requestTags);
    return records.map(record => RequestTag.create(record));
  }

  async findById(requestId: string): Promise<RequestTag | null> {
    const [record] = await db.select().from(requestTags).where(eq(requestTags.requestId, requestId));
    return record ? RequestTag.create(record) : null;
  }

  async findByRequestId(requestId: string): Promise<RequestTag | null> {
    const [record] = await db
      .select()
      .from(requestTags)
      .where(eq(requestTags.requestId, requestId));
    return record ? RequestTag.create(record) : null;
  }

  async findByLinkedRequestId(linkedRequestId: string): Promise<RequestTag[]> {
    const records = await db
      .select()
      .from(requestTags)
      .where(eq(requestTags.linkedRequestId, linkedRequestId));
    return records.map(record => RequestTag.create(record));
  }

  async findRequestIdsByAdditionalInfo(informacionAdicional: string, linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    // Get all Request IDs with the specified informacion_adicional AND linkedRequestId
    const records = await db
      .select({
        requestId: requestTags.requestId,
        requestIdLink: requestTags.requestIdLink,
      })
      .from(requestTags)
      .where(
        and(
          eq(requestTags.informacionAdicional, informacionAdicional),
          eq(requestTags.linkedRequestId, linkedRequestId)
        )
      )
      .orderBy(requestTags.requestId);

    // Return distinct Request IDs with stored links from database
    const uniqueMap = new Map<string, { requestId: string; requestIdLink?: string }>();

    for (const record of records) {
      if (record.requestId && !uniqueMap.has(record.requestId)) {
        uniqueMap.set(record.requestId, {
          requestId: record.requestId,
          requestIdLink: record.requestIdLink ?? undefined,
        });
      }
    }

    return Array.from(uniqueMap.values());
  }

  async create(data: RequestTagData): Promise<RequestTag> {
    const [inserted] = await db
      .insert(requestTags)
      .values({
        createdTime: data.createdTime,
        requestId: data.requestId,
        requestIdLink: data.requestIdLink,
        informacionAdicional: data.informacionAdicional,
        modulo: data.modulo,
        problemId: data.problemId,
        linkedRequestId: data.linkedRequestId,
        linkedRequestIdLink: data.linkedRequestIdLink,
        jira: data.jira,
        categorizacion: data.categorizacion,
        technician: data.technician,
      })
      .returning();

    return RequestTag.create(inserted);
  }

  async createMany(data: RequestTagData[]): Promise<number> {
    if (data.length === 0) return 0;

    // Batch insert for better performance and to avoid SQL query size limits
    const batchSize = 500;
    let totalInserted = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const values = batch.map(item => ({
        createdTime: item.createdTime,
        requestId: item.requestId,
        requestIdLink: item.requestIdLink,
        informacionAdicional: item.informacionAdicional,
        modulo: item.modulo,
        problemId: item.problemId,
        linkedRequestId: item.linkedRequestId,
        linkedRequestIdLink: item.linkedRequestIdLink,
        jira: item.jira,
        categorizacion: item.categorizacion,
        technician: item.technician,
      }));

      try {
        const result = await db.insert(requestTags).values(values);
        totalInserted += result.rowsAffected;
      } catch (error) {
        // If batch insert fails due to duplicates, try one by one
        for (const item of batch) {
          try {
            await db.insert(requestTags).values({
              createdTime: item.createdTime,
              requestId: item.requestId,
              requestIdLink: item.requestIdLink,
              informacionAdicional: item.informacionAdicional,
              modulo: item.modulo,
              problemId: item.problemId,
              linkedRequestId: item.linkedRequestId,
              linkedRequestIdLink: item.linkedRequestIdLink,
              jira: item.jira,
              categorizacion: item.categorizacion,
              technician: item.technician,
            });
            totalInserted++;
          } catch (err) {
            // Skip duplicates silently
          }
        }
      }
    }

    return totalInserted;
  }

  async deleteAll(): Promise<void> {
    await db.delete(requestTags);
  }

  async count(): Promise<number> {
    const records = await db.select().from(requestTags);
    return records.length;
  }

  async findMissingIdsByLinkedRequestId(linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    // Find Request IDs that exist in parent_child_requests but NOT in request_tags
    const results = await db
      .select({
        requestId: parentChildRequests.requestId,
        requestIdLink: parentChildRequests.requestIdLink,
      })
      .from(parentChildRequests)
      .leftJoin(requestTags, eq(parentChildRequests.requestId, requestTags.requestId))
      .where(
        and(
          eq(parentChildRequests.linkedRequestId, linkedRequestId),
          isNull(requestTags.requestId)
        )
      )
      .orderBy(parentChildRequests.requestId);

    return results.map((r) => ({
      requestId: r.requestId,
      requestIdLink: r.requestIdLink ?? undefined,
    }));
  }
}
