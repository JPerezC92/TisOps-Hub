import type { DbRequestCategorization } from '@repo/database';
import { RequestCategorizationEntity } from '@request-categorization/domain/entities/request-categorization.entity';

export class RequestCategorizationAdapter {
  static toDomain(
    dbRecord: DbRequestCategorization,
  ): RequestCategorizationEntity {
    return new RequestCategorizationEntity(
      dbRecord.requestId,
      dbRecord.category,
      dbRecord.technician,
      dbRecord.createdTime,
      dbRecord.modulo,
      dbRecord.subject,
      dbRecord.problemId,
      dbRecord.linkedRequestId,
      dbRecord.requestIdLink ?? undefined,
      dbRecord.linkedRequestIdLink ?? undefined,
    );
  }
}
