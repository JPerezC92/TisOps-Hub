import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import { TASK_REPOSITORY } from '@tasks/domain/repositories/task.repository.interface';
import { TaskRepository } from '@tasks/infrastructure/repositories/task.repository';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';
import { TasksController } from '@tasks/infrastructure/tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useFactory: (db) => new TaskRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllTasksUseCase,
      useFactory: (repo) => new GetAllTasksUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: GetTaskByIdUseCase,
      useFactory: (repo) => new GetTaskByIdUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: CreateTaskUseCase,
      useFactory: (repo) => new CreateTaskUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: UpdateTaskUseCase,
      useFactory: (repo) => new UpdateTaskUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: DeleteTaskUseCase,
      useFactory: (repo) => new DeleteTaskUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
  ],
})
export class TasksModule {}
