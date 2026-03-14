import type { ApplicationRegistry, ApplicationPattern as DbApplicationPattern } from '@repo/database';
import { Application } from '@application-registry/domain/entities/application.entity';
import { ApplicationPattern } from '@application-registry/domain/entities/application-pattern.entity';

export class ApplicationAdapter {
  static toDomain(record: ApplicationRegistry): Application {
    return new Application(
      record.id,
      record.code,
      record.name,
      record.description,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }
}

export class ApplicationPatternAdapter {
  static toDomain(record: DbApplicationPattern): ApplicationPattern {
    return new ApplicationPattern(
      record.id,
      record.applicationId,
      record.pattern,
      record.priority,
      record.matchType,
      record.isActive,
    );
  }
}
