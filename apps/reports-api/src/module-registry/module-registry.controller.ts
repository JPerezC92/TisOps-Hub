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
import type { JSendSuccess } from '@repo/reports/common';
import { ModuleRegistryService } from './module-registry.service';
import {
  CreateModuleDto,
  UpdateModuleDto,
} from './domain/repositories/module-registry.repository.interface';
import type { Module } from './domain/entities/module.entity';

@Controller('module-registry')
export class ModuleRegistryController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Get()
  async findAll(
    @Query('application') application?: string,
  ): Promise<JSendSuccess<Module[]>> {
    const data = application
      ? await this.moduleRegistryService.findByApplication(application)
      : await this.moduleRegistryService.findAll();
    return { status: 'success', data };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<JSendSuccess<Module>> {
    const module = await this.moduleRegistryService.findById(id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return { status: 'success', data: module };
  }

  @Post()
  async create(
    @Body() data: CreateModuleDto,
  ): Promise<JSendSuccess<Module>> {
    const module = await this.moduleRegistryService.create(data);
    return { status: 'success', data: module };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateModuleDto,
  ): Promise<JSendSuccess<Module>> {
    const module = await this.moduleRegistryService.update(id, data);
    return { status: 'success', data: module };
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<JSendSuccess<{ deleted: boolean }>> {
    await this.moduleRegistryService.delete(id);
    return { status: 'success', data: { deleted: true } };
  }
}
