import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMachineryDto } from './dto/create-machinery.dto';
import { QueryMachineryDto } from './dto/query-machinery.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';
import { Machinery, MachineryDocument } from './schemas/machinery.schema';

@Injectable()
export class MachineriesService {
  constructor(
    @InjectModel(Machinery.name)
    private readonly machineryModel: Model<MachineryDocument>,
  ) {}

  async findAll(query: QueryMachineryDto) {
    const { page = 1, limit = 20, status, category, search, sort = 'createdAt', order = 'desc' } = query;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { serialNumber: regex }];
    }

    const sortObj: Record<string, 1 | -1> = {
      [sort]: order === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.machineryModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('category')
        .lean(),
      this.machineryModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const machinery = await this.machineryModel
      .findById(id)
      .populate('category')
      .lean();

    if (!machinery) {
      throw new NotFoundException(`Machinery with id "${id}" not found`);
    }

    return machinery;
  }

  async create(dto: CreateMachineryDto) {
    const created = await this.machineryModel.create(dto);
    return created.populate('category');
  }

  async update(id: string, dto: UpdateMachineryDto) {
    const updated = await this.machineryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('category')
      .lean();

    if (!updated) {
      throw new NotFoundException(`Machinery with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.machineryModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException(`Machinery with id "${id}" not found`);
    }

    return { message: 'Deleted' };
  }
}
