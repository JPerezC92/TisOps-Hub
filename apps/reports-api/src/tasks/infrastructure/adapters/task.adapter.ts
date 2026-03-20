import type { DbTask } from '@repo/database';
import { Task } from '@tasks/domain/entities/task.entity';

export class TaskAdapter {
  static toDomain(record: DbTask): Task {
    return new Task(
      record.id,
      record.title,
      record.description,
      record.priority,
      record.completed,
      record.createdAt,
      record.updatedAt,
    );
  }
}
