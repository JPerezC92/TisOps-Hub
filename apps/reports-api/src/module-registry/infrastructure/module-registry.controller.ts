import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type {
  CreateModuleDto,
  UpdateModuleDto,
} from '@module-registry/domain/repositories/module-registry.repository.interface';
import { GetAllModulesUseCase } from '@module-registry/application/use-cases/get-all-modules.use-case';
import { GetModuleByIdUseCase } from '@module-registry/application/use-cases/get-module-by-id.use-case';
import { GetModulesByApplicationUseCase } from '@module-registry/application/use-cases/get-modules-by-application.use-case';
import { CreateModuleUseCase } from '@module-registry/application/use-cases/create-module.use-case';
import { UpdateModuleUseCase } from '@module-registry/application/use-cases/update-module.use-case';
import { DeleteModuleUseCase } from '@module-registry/application/use-cases/delete-module.use-case';

@ApiTags('module-registry')
@Controller('module-registry')
export class ModuleRegistryController {
  constructor(
    private readonly getAllModulesUseCase: GetAllModulesUseCase,
    private readonly getModuleByIdUseCase: GetModuleByIdUseCase,
    private readonly getModulesByApplicationUseCase: GetModulesByApplicationUseCase,
    private readonly createModuleUseCase: CreateModuleUseCase,
    private readonly updateModuleUseCase: UpdateModuleUseCase,
    private readonly deleteModuleUseCase: DeleteModuleUseCase,
  ) {}

  @Get()
  async findAll(@Query('application') application?: string) {
    return application
      ? this.getModulesByApplicationUseCase.execute(application)
      : this.getAllModulesUseCase.execute();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getModuleByIdUseCase.execute(id);
  }

  @Post()
  async create(@Body() data: CreateModuleDto) {
    return this.createModuleUseCase.execute(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateModuleDto,
  ) {
    return this.updateModuleUseCase.execute(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteModuleUseCase.execute(id);
    return result ?? { deleted: true };
  }
}
