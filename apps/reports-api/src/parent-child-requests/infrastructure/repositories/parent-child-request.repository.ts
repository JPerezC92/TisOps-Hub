import { sql, count, desc } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { ParentChildRequest } from '@parent-child-requests/domain/entities/parent-child-request.entity';
import { Database, parentChildRequests } from '@repo/database';

export class ParentChildRequestRepository
  implements IParentChildRequestRepository
{
  constructor(private readonly db: Database) {}

  async findAll(
    limit: number = 50,
    offset: number = 0,
  ): Promise<ParentChildRequest[]> {
    const results = await this.db
      .select()
      .from(parentChildRequests)
      .limit(limit)
      .offset(offset);

    return results.map(this.toDomain);
  }

  async findByParentId(parentId: string): Promise<ParentChildRequest[]> {
    const results = await this.db
      .select()
      .from(parentChildRequests)
      .where(eq(parentChildRequests.linkedRequestId, parentId));

    return results.map(this.toDomain);
  }

  async countAll(): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(parentChildRequests);

    return result[0]?.count ?? 0;
  }

  async getStats(): Promise<{
    totalRecords: number;
    uniqueParents: number;
    topParents: Array<{ parentId: string; childCount: number; link: string | null }>;
  }> {
    // Get total records
    const totalRecords = await this.countAll();

    // If no records, return empty stats
    if (totalRecords === 0) {
      return {
        totalRecords: 0,
        uniqueParents: 0,
        topParents: [],
      };
    }

    // Get unique parents count and top parents with most children
    const groupedResults = await this.db
      .select({
        parentId: parentChildRequests.linkedRequestId,
        childCount: count(parentChildRequests.id).as('childCount'),
        link: parentChildRequests.linkedRequestIdLink,
      })
      .from(parentChildRequests)
      .groupBy(parentChildRequests.linkedRequestId, parentChildRequests.linkedRequestIdLink)
      .orderBy(desc(sql`childCount`))
      .limit(10);

    const uniqueParents = await this.db
      .select({ count: sql<number>`count(distinct ${parentChildRequests.linkedRequestId})` })
      .from(parentChildRequests);

    return {
      totalRecords,
      uniqueParents: Number(uniqueParents[0]?.count ?? 0),
      topParents: groupedResults.map((r) => ({
        parentId: r.parentId,
        childCount: Number(r.childCount),
        link: r.link,
      })),
    };
  }

  async createOne(data: {
    requestId: string;
    linkedRequestId: string;
    requestIdLink?: string;
    linkedRequestIdLink?: string;
  }): Promise<ParentChildRequest> {
    const result = await this.db
      .insert(parentChildRequests)
      .values({
        requestId: data.requestId,
        linkedRequestId: data.linkedRequestId,
        requestIdLink: data.requestIdLink,
        linkedRequestIdLink: data.linkedRequestIdLink,
      })
      .returning();

    return this.toDomain(result[0]);
  }

  async bulkCreate(
    data: Array<{ 
      requestId: string; 
      linkedRequestId: string;
      requestIdLink?: string;
      linkedRequestIdLink?: string;
    }>,
  ): Promise<void> {
    await this.db.insert(parentChildRequests).values(
      data.map((d) => ({
        requestId: d.requestId,
        linkedRequestId: d.linkedRequestId,
        requestIdLink: d.requestIdLink,
        linkedRequestIdLink: d.linkedRequestIdLink,
      })),
    );
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(parentChildRequests);
  }

  async dropAndRecreateTable(): Promise<void> {
    // Drop the table
    await this.db.run(sql`DROP TABLE IF EXISTS ${parentChildRequests}`);

    // Recreate the table
    await this.db.run(sql`
      CREATE TABLE parent_child_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL,
        linked_request_id TEXT NOT NULL,
        request_id_link TEXT,
        linked_request_id_link TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        UNIQUE(request_id, linked_request_id)
      )
    `);

    // Recreate indexes
    await this.db.run(sql`
      CREATE INDEX linked_request_id_idx ON parent_child_requests(linked_request_id)
    `);
    
    await this.db.run(sql`
      CREATE INDEX request_id_idx ON parent_child_requests(request_id)
    `);
  }

  private toDomain(dbRecord: any): ParentChildRequest {
    return ParentChildRequest.create({
      id: dbRecord.id,
      requestId: dbRecord.requestId,
      linkedRequestId: dbRecord.linkedRequestId,
      requestIdLink: dbRecord.requestIdLink,
      linkedRequestIdLink: dbRecord.linkedRequestIdLink,
    });
  }
}
