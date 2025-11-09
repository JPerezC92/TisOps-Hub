import { RequestTag } from '../entities/request-tag.entity';

export const REQUEST_TAG_REPOSITORY = Symbol('REQUEST_TAG_REPOSITORY');

export type RequestTagData = {
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

export interface IRequestTagRepository {
  findAll(): Promise<RequestTag[]>;
  findById(requestId: string): Promise<RequestTag | null>;
  findByRequestId(requestId: string): Promise<RequestTag | null>;
  findByLinkedRequestId(linkedRequestId: string): Promise<RequestTag[]>;
  findRequestIdsByAdditionalInfo(informacionAdicional: string, linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>>;
  findMissingIdsByLinkedRequestId(linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>>;
  create(data: RequestTagData): Promise<RequestTag>;
  createMany(data: RequestTagData[]): Promise<number>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}
