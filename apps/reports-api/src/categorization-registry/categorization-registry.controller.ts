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
import { CategorizationRegistryService } from './categorization-registry.service';
import {
  CreateCategorizationDto,
  UpdateCategorizationDto,
} from './domain/repositories/categorization-registry.repository.interface';

@Controller('categorization-registry')
export class CategorizationRegistryController {
  constructor(private readonly categorizationRegistryService: CategorizationRegistryService) {}

  @Get()
  async findAll() {
    return this.categorizationRegistryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const categorization = await this.categorizationRegistryService.findById(id);
    if (!categorization) {
      throw new NotFoundException(`Categorization with ID ${id} not found`);
    }
    return categorization;
  }

  @Post()
  async create(@Body() data: CreateCategorizationDto) {
    return this.categorizationRegistryService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategorizationDto,
  ) {
    return this.categorizationRegistryService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.categorizationRegistryService.delete(id);
  }
}
