import { faker } from '@faker-js/faker';
import { Task } from '@tasks/domain/entities/task.entity';

export class TaskFactory {
  static create(overrides?: Partial<{
    id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>): Task {
    return new Task(
      overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      overrides?.title ?? faker.lorem.sentence({ min: 3, max: 6 }),
      overrides?.description ?? (faker.datatype.boolean() ? faker.lorem.paragraph() : null),
      overrides?.priority ?? faker.helpers.arrayElement(['low', 'medium', 'high']),
      overrides?.completed ?? faker.datatype.boolean(),
      overrides?.createdAt ?? faker.date.recent(),
      overrides?.updatedAt ?? faker.date.recent(),
    );
  }

  static createMany(count: number, overrides?: Partial<{
    id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>): Task[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }
}
