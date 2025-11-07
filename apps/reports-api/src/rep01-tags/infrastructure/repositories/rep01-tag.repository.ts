import { eq, and, isNull, sql } from 'drizzle-orm';
import { db, rep01Tags, parentChildRequests } from '@repo/database';
import { IRep01TagRepository, Rep01TagData } from '../../domain/repositories/rep01-tag.repository.interface';
import { Rep01Tag } from '../../domain/entities/rep01-tag.entity';

export class Rep01TagRepository implements IRep01TagRepository {
  async findAll(): Promise<Rep01Tag[]> {
    const records = await db.select().from(rep01Tags);
    return records.map(record => Rep01Tag.create(record));
  }

  async findById(requestId: string): Promise<Rep01Tag | null> {
    const [record] = await db.select().from(rep01Tags).where(eq(rep01Tags.requestId, requestId));
    return record ? Rep01Tag.create(record) : null;
  }

  async findByRequestId(requestId: string): Promise<Rep01Tag | null> {
    const [record] = await db
      .select()
      .from(rep01Tags)
      .where(eq(rep01Tags.requestId, requestId));
    return record ? Rep01Tag.create(record) : null;
  }

  async findByLinkedRequestId(linkedRequestId: string): Promise<Rep01Tag[]> {
    const records = await db
      .select()
      .from(rep01Tags)
      .where(eq(rep01Tags.linkedRequestId, linkedRequestId));
    return records.map(record => Rep01Tag.create(record));
  }

  async findRequestIdsByAdditionalInfo(informacionAdicional: string, linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    // Get all Request IDs with the specified informacion_adicional AND linkedRequestId
    const records = await db
      .select({
        requestId: rep01Tags.requestId,
        requestIdLink: rep01Tags.requestIdLink,
      })
      .from(rep01Tags)
      .where(
        and(
          eq(rep01Tags.informacionAdicional, informacionAdicional),
          eq(rep01Tags.linkedRequestId, linkedRequestId)
        )
      )
      .orderBy(rep01Tags.requestId);

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

  async create(data: Rep01TagData): Promise<Rep01Tag> {
    const [inserted] = await db
      .insert(rep01Tags)
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

    return Rep01Tag.create(inserted);
  }

  async createMany(data: Rep01TagData[]): Promise<number> {
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
        const result = await db.insert(rep01Tags).values(values);
        totalInserted += result.rowsAffected;
      } catch (error) {
        // If batch insert fails due to duplicates, try one by one
        for (const item of batch) {
          try {
            await db.insert(rep01Tags).values({
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
    await db.delete(rep01Tags);
  }

  async count(): Promise<number> {
    const records = await db.select().from(rep01Tags);
    return records.length;
  }

  async findMissingIdsByLinkedRequestId(linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    // Find Request IDs that exist in parent_child_requests but NOT in rep01_tags
    const results = await db
      .select({
        requestId: parentChildRequests.requestId,
        requestIdLink: parentChildRequests.requestIdLink,
      })
      .from(parentChildRequests)
      .leftJoin(rep01Tags, eq(parentChildRequests.requestId, rep01Tags.requestId))
      .where(
        and(
          eq(parentChildRequests.linkedRequestId, linkedRequestId),
          isNull(rep01Tags.requestId)
        )
      )
      .orderBy(parentChildRequests.requestId);

    return results.map((r) => ({
      requestId: r.requestId,
      requestIdLink: r.requestIdLink ?? undefined,
    }));
  }
}
