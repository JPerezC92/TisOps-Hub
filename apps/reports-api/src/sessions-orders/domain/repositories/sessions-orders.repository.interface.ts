import type { SessionsOrder, SessionsOrdersRelease, InsertSessionsOrder, InsertSessionsOrdersRelease } from '@repo/database';

export const SESSIONS_ORDERS_REPOSITORY = Symbol('SESSIONS_ORDERS_REPOSITORY');

export interface ISessionsOrdersRepository {
  findAllMain(): Promise<SessionsOrder[]>;
  findAllReleases(): Promise<SessionsOrdersRelease[]>;
  countMain(): Promise<number>;
  countReleases(): Promise<number>;
  bulkCreateMain(records: InsertSessionsOrder[]): Promise<void>;
  bulkCreateReleases(records: InsertSessionsOrdersRelease[]): Promise<void>;
  deleteAllMain(): Promise<number>;
  deleteAllReleases(): Promise<number>;
}
