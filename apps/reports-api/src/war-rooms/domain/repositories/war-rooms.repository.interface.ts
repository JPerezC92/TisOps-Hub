import { WarRoom, InsertWarRoom } from '@repo/database';

export const WAR_ROOMS_REPOSITORY = Symbol('WAR_ROOMS_REPOSITORY');

export interface IWarRoomsRepository {
  findAll(): Promise<WarRoom[]>;
  countAll(): Promise<number>;
  bulkCreate(records: InsertWarRoom[]): Promise<void>;
  deleteAll(): Promise<number>;
}
