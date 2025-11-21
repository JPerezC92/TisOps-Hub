import { Injectable } from '@nestjs/common';
import {
  db,
  warRooms,
  InsertWarRoom,
  applicationRegistry,
  applicationPatterns,
} from '@repo/database';
import { desc, eq, and, sql } from 'drizzle-orm';
import type {
  IWarRoomsRepository,
  WarRoomWithApp,
} from '@war-rooms/domain/repositories/war-rooms.repository.interface';

@Injectable()
export class WarRoomsRepository implements IWarRoomsRepository {
  async findAll() {
    return db
      .select()
      .from(warRooms)
      .orderBy(desc(warRooms.date), desc(warRooms.startTime))
      .all();
  }

  async findAllWithApplication(): Promise<WarRoomWithApp[]> {
    // Single optimized query with LEFT JOIN - eliminates N+1 query problem
    const results = await db
      .select({
        // War room fields
        requestId: warRooms.requestId,
        requestIdLink: warRooms.requestIdLink,
        application: warRooms.application,
        date: warRooms.date,
        summary: warRooms.summary,
        initialPriority: warRooms.initialPriority,
        startTime: warRooms.startTime,
        durationMinutes: warRooms.durationMinutes,
        endTime: warRooms.endTime,
        participants: warRooms.participants,
        status: warRooms.status,
        priorityChanged: warRooms.priorityChanged,
        resolutionTeamChanged: warRooms.resolutionTeamChanged,
        notes: warRooms.notes,
        rcaStatus: warRooms.rcaStatus,
        urlRca: warRooms.urlRca,
        // Matched application fields (nullable from LEFT JOIN)
        appId: applicationRegistry.id,
        appCode: applicationRegistry.code,
        appName: applicationRegistry.name,
        patternPriority: applicationPatterns.priority,
      })
      .from(warRooms)
      .leftJoin(
        applicationPatterns,
        and(
          eq(applicationPatterns.isActive, true),
          sql`LOWER(${warRooms.application}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
        ),
      )
      .leftJoin(
        applicationRegistry,
        and(
          eq(applicationPatterns.applicationId, applicationRegistry.id),
          eq(applicationRegistry.isActive, true),
        ),
      )
      .orderBy(
        desc(warRooms.date),
        desc(warRooms.startTime),
        applicationPatterns.priority, // Get highest priority match first
      )
      .all();

    // Group results by war room requestId (handle potential duplicate rows from multiple pattern matches)
    const warRoomsMap = new Map<number, WarRoomWithApp>();

    for (const row of results) {
      if (!warRoomsMap.has(row.requestId)) {
        warRoomsMap.set(row.requestId, {
          requestId: row.requestId,
          requestIdLink: row.requestIdLink,
          application: row.application,
          date: row.date,
          summary: row.summary,
          initialPriority: row.initialPriority,
          startTime: row.startTime,
          durationMinutes: row.durationMinutes,
          endTime: row.endTime,
          participants: row.participants,
          status: row.status,
          priorityChanged: row.priorityChanged,
          resolutionTeamChanged: row.resolutionTeamChanged,
          notes: row.notes,
          rcaStatus: row.rcaStatus,
          urlRca: row.urlRca,
          app: row.appId
            ? {
                id: row.appId,
                code: row.appCode!,
                name: row.appName!,
              }
            : null,
        });
      }
    }

    return Array.from(warRoomsMap.values());
  }

  async findAllWithApplicationFiltered(app?: string, month?: string): Promise<WarRoomWithApp[]> {
    // Start with base query
    const query = db
      .select({
        // War room fields
        requestId: warRooms.requestId,
        requestIdLink: warRooms.requestIdLink,
        application: warRooms.application,
        date: warRooms.date,
        summary: warRooms.summary,
        initialPriority: warRooms.initialPriority,
        startTime: warRooms.startTime,
        durationMinutes: warRooms.durationMinutes,
        endTime: warRooms.endTime,
        participants: warRooms.participants,
        status: warRooms.status,
        priorityChanged: warRooms.priorityChanged,
        resolutionTeamChanged: warRooms.resolutionTeamChanged,
        notes: warRooms.notes,
        rcaStatus: warRooms.rcaStatus,
        urlRca: warRooms.urlRca,
        // Matched application fields
        appId: applicationRegistry.id,
        appCode: applicationRegistry.code,
        appName: applicationRegistry.name,
        patternPriority: applicationPatterns.priority,
      })
      .from(warRooms)
      .leftJoin(
        applicationPatterns,
        and(
          eq(applicationPatterns.isActive, true),
          sql`LOWER(${warRooms.application}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
        ),
      )
      .leftJoin(
        applicationRegistry,
        and(
          eq(applicationPatterns.applicationId, applicationRegistry.id),
          eq(applicationRegistry.isActive, true),
        ),
      );

    // Build WHERE conditions
    const conditions = [];

    // Filter by application code
    if (app && app !== 'all') {
      conditions.push(eq(applicationRegistry.code, app));
    }

    // Filter by month - simple date string comparison
    if (month) {
      conditions.push(
        sql`strftime('%Y-%m', ${warRooms.date}, 'unixepoch') = ${month}`,
      );
    }

    // Apply conditions if any
    const results = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query)
      .orderBy(
        desc(warRooms.date),
        desc(warRooms.startTime),
        applicationPatterns.priority,
      )
      .all();

    // Group results by war room requestId
    const warRoomsMap = new Map<number, WarRoomWithApp>();

    for (const row of results) {
      if (!warRoomsMap.has(row.requestId)) {
        warRoomsMap.set(row.requestId, {
          requestId: row.requestId,
          requestIdLink: row.requestIdLink,
          application: row.application,
          date: row.date,
          summary: row.summary,
          initialPriority: row.initialPriority,
          startTime: row.startTime,
          durationMinutes: row.durationMinutes,
          endTime: row.endTime,
          participants: row.participants,
          status: row.status,
          priorityChanged: row.priorityChanged,
          resolutionTeamChanged: row.resolutionTeamChanged,
          notes: row.notes,
          rcaStatus: row.rcaStatus,
          urlRca: row.urlRca,
          app: row.appId
            ? {
                id: row.appId,
                code: row.appCode!,
                name: row.appName!,
              }
            : null,
        });
      }
    }

    return Array.from(warRoomsMap.values());
  }

  async countAll(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(warRooms)
      .get();
    return result?.count ?? 0;
  }

  async countFiltered(app?: string, month?: string): Promise<number> {
    let query: any = db
      .select({ count: sql<number>`COUNT(DISTINCT ${warRooms.requestId})` })
      .from(warRooms);

    const conditions = [];

    // Application filter
    if (app && app !== 'all') {
      query = query
        .leftJoin(
          applicationPatterns,
          sql`LOWER(${warRooms.application}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
        )
        .leftJoin(
          applicationRegistry,
          eq(applicationPatterns.applicationId, applicationRegistry.id),
        );
      conditions.push(eq(applicationRegistry.code, app));
    }

    // Month filter
    if (month) {
      conditions.push(
        sql`strftime('%Y-%m', ${warRooms.date}, 'unixepoch') = ${month}`,
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.get();
    return result?.count ?? 0;
  }

  async bulkCreate(records: InsertWarRoom[]): Promise<void> {
    // Batch insert for performance (tested: batch size 20 = 108 records/sec)
    const batchSize = 20;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await db.insert(warRooms).values(batch).execute();
    }
  }

  async deleteAll(): Promise<number> {
    const result = await db.delete(warRooms).execute();
    return result.rowsAffected || 0;
  }
}
