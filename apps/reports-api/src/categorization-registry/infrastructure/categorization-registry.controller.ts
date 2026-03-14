import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type {
  CreateCategorizationDto,
  UpdateCategorizationDto,
} from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { GetAllCategorizationsUseCase } from '@categorization-registry/application/use-cases/get-all-categorizations.use-case';
import { GetCategorizationByIdUseCase } from '@categorization-registry/application/use-cases/get-categorization-by-id.use-case';
import { CreateCategorizationUseCase } from '@categorization-registry/application/use-cases/create-categorization.use-case';
import { UpdateCategorizationUseCase } from '@categorization-registry/application/use-cases/update-categorization.use-case';
import { DeleteCategorizationUseCase } from '@categorization-registry/application/use-cases/delete-categorization.use-case';

@ApiTags('categorization-registry')
@Controller('categorization-registry')
export class CategorizationRegistryController {
  constructor(
    private readonly getAllCategorizationsUseCase: GetAllCategorizationsUseCase,
    private readonly getCategorizationByIdUseCase: GetCategorizationByIdUseCase,
    private readonly createCategorizationUseCase: CreateCategorizationUseCase,
    private readonly updateCategorizationUseCase: UpdateCategorizationUseCase,
    private readonly deleteCategorizationUseCase: DeleteCategorizationUseCase,
  ) {}

  @Get()
  async findAll() {
    return this.getAllCategorizationsUseCase.execute();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getCategorizationByIdUseCase.execute(id);
  }

  @Post()
  async create(@Body() data: CreateCategorizationDto) {
    return this.createCategorizationUseCase.execute(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategorizationDto,
  ) {
    return this.updateCategorizationUseCase.execute(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteCategorizationUseCase.execute(id);
    return result ?? { deleted: true };
  }
}
