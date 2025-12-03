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
  NotFoundException,
} from '@nestjs/common';
import { ModuleRegistryService } from './module-registry.service';
import {
  CreateModuleDto,
  UpdateModuleDto,
} from './domain/repositories/module-registry.repository.interface';

@Controller('module-registry')
export class ModuleRegistryController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Get()
  async findAll(@Query('application') application?: string) {
    if (application) {
      return this.moduleRegistryService.findByApplication(application);
    }
    return this.moduleRegistryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const module = await this.moduleRegistryService.findById(id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  @Post()
  async create(@Body() data: CreateModuleDto) {
    return this.moduleRegistryService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateModuleDto,
  ) {
    return this.moduleRegistryService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.moduleRegistryService.delete(id);
  }
}
