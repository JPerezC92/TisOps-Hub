import { Rep01Tag } from '../entities/rep01-tag.entity';

export const REP01_TAG_REPOSITORY = Symbol('REP01_TAG_REPOSITORY');

export type Rep01TagData = {
  createdTime: string;
  requestId: string;
  requestIdLink?: string;
  informacionAdicional: string;
  modulo: string;
  problemId: string;
  linkedRequestId: string;
  linkedRequestIdLink?: string;
  jira: string;
  categorizacion: string;
  technician: string;
};

export interface IRep01TagRepository {
  findAll(): Promise<Rep01Tag[]>;
  findById(requestId: string): Promise<Rep01Tag | null>;
  findByRequestId(requestId: string): Promise<Rep01Tag | null>;
  findByLinkedRequestId(linkedRequestId: string): Promise<Rep01Tag[]>;
  findRequestIdsByAdditionalInfo(informacionAdicional: string, linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>>;
  findMissingIdsByLinkedRequestId(linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>>;
  create(data: Rep01TagData): Promise<Rep01Tag>;
  createMany(data: Rep01TagData[]): Promise<number>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}
