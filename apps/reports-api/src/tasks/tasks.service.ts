import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';
import { Task } from '@tasks/domain/entities/task.entity';
import type { CreateTaskDto, UpdateTaskDto } from '@repo/reports';

@Injectable()
export class TasksService {
  constructor(
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  async create(taskData: CreateTaskDto): Promise<Task> {
    return this.createTaskUseCase.execute(taskData);
  }

  async findAll(): Promise<Task[]> {
    return this.getAllTasksUseCase.execute();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.getTaskByIdUseCase.execute(id);
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  async update(
    id: number,
    taskData: Partial<Omit<UpdateTaskDto, 'id' | 'createdAt'>>,
  ): Promise<Task> {
    return this.updateTaskUseCase.execute(id, taskData);
  }

  async remove(id: number): Promise<void> {
    await this.deleteTaskUseCase.execute(id);
  }
}
