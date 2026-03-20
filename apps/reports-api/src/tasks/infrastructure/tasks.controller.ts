import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  taskSchema,
  taskArraySchema,
  taskDeleteResultSchema,
} from '@repo/reports';
import { jsendSuccess, jsendFailSchema } from '@repo/reports/common';
import { DomainError } from '@shared/domain/errors/domain.error';
import { CreateTaskDto, UpdateTaskDto } from '@repo/reports';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';

// JSend success DTOs
class JSendTaskArrayDto extends createZodDto(jsendSuccess(taskArraySchema)) {}
class JSendTaskDto extends createZodDto(jsendSuccess(taskSchema)) {}
class JSendTaskDeleteResultDto extends createZodDto(jsendSuccess(taskDeleteResultSchema)) {}

// JSend fail DTO
class JSendFailDto extends createZodDto(jsendFailSchema) {}

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ZodResponse({ status: 200, description: 'Returns all tasks', type: JSendTaskArrayDto })
  async findAll() {
    const data = await this.getAllTasksUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ZodResponse({ status: 200, description: 'Returns the task', type: JSendTaskDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: JSendFailDto })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getTaskByIdUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ZodResponse({ status: 201, description: 'Task created successfully', type: JSendTaskDto })
  async create(@Body() data: CreateTaskDto) {
    const result = await this.createTaskUseCase.execute(data);
    return { status: 'success' as const, data: result };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ZodResponse({ status: 200, description: 'Task updated successfully', type: JSendTaskDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: JSendFailDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTaskDto,
  ) {
    const result = await this.updateTaskUseCase.execute(id, data);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ZodResponse({ status: 200, description: 'Task deleted successfully', type: JSendTaskDeleteResultDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: JSendFailDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteTaskUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: { deleted: true } };
  }
}
