import { WarRoom, InsertWarRoom } from '@repo/database';

export const WAR_ROOMS_REPOSITORY = Symbol('WAR_ROOMS_REPOSITORY');

export interface WarRoomWithApp extends WarRoom {
  app?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

export interface IWarRoomsRepository {
  findAll(): Promise<WarRoom[]>;
  findAllWithApplication(): Promise<WarRoomWithApp[]>;
  findAllWithApplicationFiltered(app?: string, month?: string): Promise<WarRoomWithApp[]>;
  countAll(): Promise<number>;
  countFiltered(app?: string, month?: string): Promise<number>;
  bulkCreate(records: InsertWarRoom[]): Promise<void>;
  deleteAll(): Promise<number>;
}
