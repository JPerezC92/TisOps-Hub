import { Injectable } from '@nestjs/common';
import { db, warRooms, InsertWarRoom } from '@repo/database';
import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';

@Injectable()
export class WarRoomsRepository implements IWarRoomsRepository {
  async findAll() {
    return db.select().from(warRooms).all();
  }

  async countAll(): Promise<number> {
    const records = await db.select().from(warRooms).all();
    return records.length;
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
