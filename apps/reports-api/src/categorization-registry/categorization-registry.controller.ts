import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import type { JSendSuccess } from '@repo/reports/common';
import { CategorizationRegistryService } from './categorization-registry.service';
import {
  CreateCategorizationDto,
  UpdateCategorizationDto,
} from './domain/repositories/categorization-registry.repository.interface';
import type { Categorization } from './domain/entities/categorization.entity';

@Controller('categorization-registry')
export class CategorizationRegistryController {
  constructor(private readonly categorizationRegistryService: CategorizationRegistryService) {}

  @Get()
  async findAll(): Promise<JSendSuccess<Categorization[]>> {
    const categorizations = await this.categorizationRegistryService.findAll();
    return {
      status: 'success',
      data: categorizations,
    };
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<Categorization>> {
    const categorization = await this.categorizationRegistryService.findById(id);
    if (!categorization) {
      throw new NotFoundException(`Categorization with ID ${id} not found`);
    }
    return {
      status: 'success',
      data: categorization,
    };
  }

  @Post()
  async create(@Body() data: CreateCategorizationDto): Promise<JSendSuccess<Categorization>> {
    const categorization = await this.categorizationRegistryService.create(data);
    return {
      status: 'success',
      data: categorization,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategorizationDto,
  ): Promise<JSendSuccess<Categorization>> {
    const categorization = await this.categorizationRegistryService.update(id, data);
    return {
      status: 'success',
      data: categorization,
    };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<{ deleted: boolean }>> {
    await this.categorizationRegistryService.delete(id);
    return {
      status: 'success',
      data: { deleted: true },
    };
  }
}
