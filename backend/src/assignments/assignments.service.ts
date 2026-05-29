import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Assignment,
  AssignmentDocument,
  AssignmentStatus,
} from './schemas/assignment.schema';
import {
  Machinery,
  MachineryDocument,
  MachineryStatus,
} from '../machineries/schemas/machinery.schema';
import {
  MaintenanceLog,
  MaintenanceLogDocument,
  MaintenanceStatus,
} from '../maintenance/schemas/maintenance-log.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Machinery.name)
    private readonly machineryModel: Model<MachineryDocument>,
    @InjectModel(MaintenanceLog.name)
    private readonly maintenanceLogModel: Model<MaintenanceLogDocument>,
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
    if (dto.status === AssignmentStatus.Active) {
      await this.assertNoInProgressMaintenance(dto.machinery);
    }

    const created = await this.assignmentModel.create({
      ...dto,
      status: dto.status ?? AssignmentStatus.Pending,
    });
    await this.syncMachineryStatus(dto.machinery);
    const populated = await created.populate(['machinery', 'dispatcher']);
    return populated;
  }

  async update(id: string, dto: any) {
    const existing = await this.assignmentModel.findById(id).lean();

    if (!existing) {
      throw new NotFoundException(`Assignment with id "${id}" not found`);
    }

    if (
      existing.status === AssignmentStatus.Completed &&
      dto.status &&
      dto.status !== AssignmentStatus.Completed
    ) {
      throw new BadRequestException(
        'Phiếu điều phối đã hoàn thành không thể đổi trạng thái.',
      );
    }

    const targetMachineryId = dto.machinery ?? String(existing.machinery);

    if (dto.status === AssignmentStatus.Active) {
      await this.assertNoInProgressMaintenance(targetMachineryId);
    }

    const updated = await this.assignmentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('machinery')
      .populate('dispatcher', 'fullName email')
      .lean();

    await this.syncMachineryStatus(String(existing.machinery));

    if (targetMachineryId !== String(existing.machinery)) {
      await this.syncMachineryStatus(targetMachineryId);
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.assignmentModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException(`Assignment with id "${id}" not found`);
    }

    await this.syncMachineryStatus(String(deleted.machinery));

    return { message: 'Deleted' };
  }

  private async assertNoInProgressMaintenance(machineryId: string) {
    const activeMaintenance = await this.maintenanceLogModel.exists({
      machinery: machineryId,
      status: MaintenanceStatus.InProgress,
    });

    if (activeMaintenance) {
      throw new BadRequestException(
        'Thiết bị đang bảo trì, không thể chuyển phiếu điều phối sang đang hoạt động.',
      );
    }
  }

  private async syncMachineryStatus(machineryId: string) {
    if (!Types.ObjectId.isValid(machineryId)) {
      return;
    }

    const activeMaintenance = await this.maintenanceLogModel.exists({
      machinery: machineryId,
      status: MaintenanceStatus.InProgress,
    });

    if (activeMaintenance) {
      await this.machineryModel.findByIdAndUpdate(machineryId, {
        status: MachineryStatus.Maintenance,
      });
      return;
    }

    const activeAssignment = await this.assignmentModel.exists({
      machinery: machineryId,
      status: AssignmentStatus.Active,
    });

    await this.machineryModel.findByIdAndUpdate(machineryId, {
      status: activeAssignment
        ? MachineryStatus.Rented
        : MachineryStatus.Available,
    });
  }
}
