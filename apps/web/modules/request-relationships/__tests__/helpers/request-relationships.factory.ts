import { faker } from '@faker-js/faker';
import type {
  ParentChildRequest,
  RelationshipsStats,
  UploadResult,
  DeleteResult,
} from '../../services/request-relationships.service';

export class RequestRelationshipsFactory {
  static createRequest(overrides?: Partial<ParentChildRequest>): ParentChildRequest {
    const requestId = overrides?.requestId ?? `REQ-${faker.number.int({ min: 1000, max: 9999 })}`;
    const linkedRequestId =
      overrides?.linkedRequestId ?? `REQ-${faker.number.int({ min: 1000, max: 9999 })}`;

    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      requestId,
      linkedRequestId,
      requestIdLink: overrides?.requestIdLink ?? `https://example.com/${requestId}`,
      linkedRequestIdLink:
        overrides?.linkedRequestIdLink ?? `https://example.com/${linkedRequestId}`,
    };
  }

  static createManyRequests(
    count: number,
    overrides?: Partial<ParentChildRequest>
  ): ParentChildRequest[] {
    return Array.from({ length: count }, () => this.createRequest(overrides));
  }

  static createStats(overrides?: Partial<RelationshipsStats>): RelationshipsStats {
    const totalRecords = overrides?.totalRecords ?? faker.number.int({ min: 10, max: 1000 });
    const uniqueParents = overrides?.uniqueParents ?? faker.number.int({ min: 5, max: totalRecords });

    return {
      totalRecords,
      uniqueParents,
      topParents:
        overrides?.topParents ??
        Array.from({ length: 10 }, () => ({
          parentId: `REQ-${faker.number.int({ min: 1000, max: 9999 })}`,
          childCount: faker.number.int({ min: 1, max: 50 }),
          link: faker.datatype.boolean()
            ? `https://example.com/REQ-${faker.number.int({ min: 1000, max: 9999 })}`
            : null,
        })),
    };
  }

  static createUploadResult(overrides?: Partial<UploadResult>): UploadResult {
    const total = overrides?.total ?? faker.number.int({ min: 100, max: 500 });
    const imported =
      overrides?.imported ?? faker.number.int({ min: Math.floor(total * 0.8), max: total });
    const skipped = overrides?.skipped ?? total - imported;

    return {
      message: overrides?.message ?? 'File processed successfully',
      imported,
      skipped,
      total,
    };
  }

  static createDeleteResult(overrides?: Partial<DeleteResult>): DeleteResult {
    return {
      deleted: overrides?.deleted ?? true,
      message:
        overrides?.message ?? 'All parent-child relationships deleted successfully',
    };
  }
}
