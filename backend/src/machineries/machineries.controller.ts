import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { MachineriesService } from './machineries.service';
import { CreateMachineryDto } from './dto/create-machinery.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';
import { QueryMachineryDto } from './dto/query-machinery.dto';

@UseGuards(JwtAuthGuard)
@Controller('v1/machineries')
export class MachineriesController {
  constructor(private readonly machineriesService: MachineriesService) {}

  @Get()
  findAll(@Query() query: QueryMachineryDto) {
    return this.machineriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machineriesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  create(@Body() dto: CreateMachineryDto) {
    return this.machineriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateMachineryDto) {
    return this.machineriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  remove(@Param('id') id: string) {
    return this.machineriesService.remove(id);
  }
}
