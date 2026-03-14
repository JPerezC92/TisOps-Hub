import type { ModuleRegistry } from '@repo/database';
import { Module } from '@module-registry/domain/entities/module.entity';

export class ModuleAdapter {
  static toDomain(record: ModuleRegistry): Module {
    return new Module(
      record.id,
      record.sourceValue,
      record.displayValue,
      record.application,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }
}
