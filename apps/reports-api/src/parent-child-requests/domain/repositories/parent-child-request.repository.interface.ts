import { ParentChildRequest } from '@parent-child-requests/domain/entities/parent-child-request.entity';

export interface IParentChildRequestRepository {
  findAll(limit?: number, offset?: number): Promise<ParentChildRequest[]>;
  findByParentId(parentId: string): Promise<ParentChildRequest[]>;
  countAll(): Promise<number>;
  getStats(): Promise<{
    totalRecords: number;
    uniqueParents: number;
    topParents: Array<{ parentId: string; childCount: number; link: string | null }>;
  }>;
  createOne(data: {
    requestId: string;
    linkedRequestId: string;
    requestIdLink?: string;
    linkedRequestIdLink?: string;
  }): Promise<ParentChildRequest>;
  bulkCreate(
    data: Array<{ 
      requestId: string; 
      linkedRequestId: string;
      requestIdLink?: string;
      linkedRequestIdLink?: string;
    }>,
  ): Promise<void>;
  deleteAll(): Promise<void>;
  dropAndRecreateTable(): Promise<void>;
}

export const PARENT_CHILD_REQUEST_REPOSITORY = Symbol(
  'PARENT_CHILD_REQUEST_REPOSITORY',
);
