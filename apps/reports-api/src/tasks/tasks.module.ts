import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TASK_REPOSITORY } from './domain/repositories/task.repository.interface';
import { TaskRepository } from './infrastructure/repositories/task.repository';
import { GetAllTasksUseCase } from './application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from './application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { DATABASE_CONNECTION } from '@repo/database';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    // Repository
    {
      provide: TASK_REPOSITORY,
      useFactory: (database) => {
        return new TaskRepository(database);
      },
      inject: [DATABASE_CONNECTION],
    },
    // Use Cases with factory providers
    {
      provide: GetAllTasksUseCase,
      useFactory: (taskRepository) => {
        return new GetAllTasksUseCase(taskRepository);
      },
      inject: [TASK_REPOSITORY],
    },
    {
      provide: GetTaskByIdUseCase,
      useFactory: (taskRepository) => {
        return new GetTaskByIdUseCase(taskRepository);
      },
      inject: [TASK_REPOSITORY],
    },
    {
      provide: CreateTaskUseCase,
      useFactory: (taskRepository) => {
        return new CreateTaskUseCase(taskRepository);
      },
      inject: [TASK_REPOSITORY],
    },
    {
      provide: UpdateTaskUseCase,
      useFactory: (taskRepository) => {
        return new UpdateTaskUseCase(taskRepository);
      },
      inject: [TASK_REPOSITORY],
    },
    {
      provide: DeleteTaskUseCase,
      useFactory: (taskRepository) => {
        return new DeleteTaskUseCase(taskRepository);
      },
      inject: [TASK_REPOSITORY],
    },
  ],
})
export class TasksModule {}
