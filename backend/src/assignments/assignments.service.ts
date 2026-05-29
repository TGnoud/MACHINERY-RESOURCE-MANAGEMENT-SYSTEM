import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { Machinery, MachineryDocument } from '../machineries/schemas/machinery.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Machinery.name)
    private readonly machineryModel: Model<MachineryDocument>,
  ) {}

  async findAll(query: QueryAssignmentDto) {
    const { page = 1, limit = 10, status, search, startDate, endDate, sort = 'createdAt', order = 'desc' } = query;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      // Search matching machineries
      const matchingMachineries = await this.machineryModel
        .find({
          $or: [{ name: regex }, { serialNumber: regex }],
        })
        .select('_id')
        .lean();

      const machineryIds = matchingMachineries.map((m) => m._id);

      filter.$or = [
        { destination: regex },
        { machinery: { $in: machineryIds } },
      ];
    }

    if (startDate) {
      filter.startDate = { $gte: new Date(startDate) };
    }

    if (endDate) {
      filter.endDate = { $lte: new Date(endDate) };
    }

    const sortObj: Record<string, 1 | -1> = {
      [sort]: order === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.assignmentModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('machinery')
        .populate('dispatcher', 'fullName email')
        .lean(),
      this.assignmentModel.countDocuments(filter),
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
    const assignment = await this.assignmentModel
      .findById(id)
      .populate('machinery')
      .populate('dispatcher', 'fullName email')
      .lean();

    if (!assignment) {
      throw new NotFoundException(`Assignment with id "${id}" not found`);
    }

    return assignment;
  }

  async create(dto: CreateAssignmentDto) {
    const created = await this.assignmentModel.create(dto);
    const populated = await created.populate(['machinery', 'dispatcher']);
    return populated;
  }

  async update(id: string, dto: any) {
    const updated = await this.assignmentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('machinery')
      .populate('dispatcher', 'fullName email')
      .lean();

    if (!updated) {
      throw new NotFoundException(`Assignment with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.assignmentModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException(`Assignment with id "${id}" not found`);
    }

    return { message: 'Deleted' };
  }
}
