import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types';
import {
  Machinery,
  MachineryDocument,
  MachineryStatus,
} from '../machineries/schemas/machinery.schema';
import {
  MaintenanceLog,
  MaintenanceLogDocument,
  MaintenanceStatus,
} from './schemas/maintenance-log.schema';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { QueryMaintenanceLogDto } from './dto/query-maintenance-log.dto';
import { UpdateMaintenanceLogDto } from './dto/update-maintenance-log.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(MaintenanceLog.name)
    private readonly maintenanceLogModel: Model<MaintenanceLogDocument>,
    @InjectModel(Machinery.name)
    private readonly machineryModel: Model<MachineryDocument>,
  ) {}

  async findAll(query: QueryMaintenanceLogDto) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      machinery,
      technician,
      search,
      minCost,
      maxCost,
      sort = 'createdAt',
      order = 'desc',
    } = query;

    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (machinery) filter.machinery = machinery;
    if (technician) filter.technician = technician;
    if (minCost !== undefined || maxCost !== undefined) {
      filter.cost = {};

      if (minCost !== undefined) {
        filter.cost.$gte = minCost;
      }

      if (maxCost !== undefined) {
        filter.cost.$lte = maxCost;
      }
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      const matchingMachineries = await this.machineryModel
        .find({ $or: [{ name: regex }, { serialNumber: regex }] })
        .select('_id')
        .lean();

      filter.$or = [
        { description: regex },
        { machinery: { $in: matchingMachineries.map((item) => item._id) } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {
      [sort]: order === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.maintenanceLogModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('machinery')
        .populate('technician', 'fullName email role')
        .lean(),
      this.maintenanceLogModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, completed, inProgress, pending, costResult] =
      await Promise.all([
        this.maintenanceLogModel.countDocuments(),
        this.maintenanceLogModel.countDocuments({
          status: MaintenanceStatus.Completed,
        }),
        this.maintenanceLogModel.countDocuments({
          status: MaintenanceStatus.InProgress,
        }),
        this.maintenanceLogModel.countDocuments({
          status: MaintenanceStatus.Pending,
        }),
        this.maintenanceLogModel.aggregate<{ totalCost: number }>([
          { $match: { createdAt: { $gte: monthStart } } },
          { $group: { _id: null, totalCost: { $sum: '$cost' } } },
        ]),
      ]);

    return {
      total,
      completed,
      inProgress,
      pending,
      monthlyCost: costResult[0]?.totalCost ?? 0,
    };
  }

  async findOne(id: string) {
    const log = await this.maintenanceLogModel
      .findById(id)
      .populate('machinery')
      .populate('technician', 'fullName email role')
      .lean();

    if (!log) {
      throw new NotFoundException(`Maintenance log with id "${id}" not found`);
    }

    return log;
  }

  async create(dto: CreateMaintenanceLogDto, user: AuthenticatedUser) {
    const machinery = await this.machineryModel.findById(dto.machinery).lean();

    if (!machinery) {
      throw new NotFoundException(
        `Machinery with id "${dto.machinery}" not found`,
      );
    }

    const status = MaintenanceStatus.Pending;
    const created = await this.maintenanceLogModel.create({
      ...dto,
      technician: dto.technician ?? user.id,
      status,
      completedAt: undefined,
    });

    return created.populate(['machinery', 'technician']);
  }

  async update(id: string, dto: UpdateMaintenanceLogDto) {
    const existing = await this.maintenanceLogModel.findById(id).lean();

    if (!existing) {
      throw new NotFoundException(`Maintenance log with id "${id}" not found`);
    }

    const updateData = {
      ...dto,
      completedAt:
        dto.status === MaintenanceStatus.Completed && !dto.completedAt
          ? new Date()
          : dto.completedAt,
    };

    const updated = await this.maintenanceLogModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('machinery')
      .populate('technician', 'fullName email role')
      .lean();

    const machineryId = dto.machinery ?? String(existing.machinery);
    await this.syncMachineryMaintenanceStatus(machineryId);

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.maintenanceLogModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException(`Maintenance log with id "${id}" not found`);
    }

    await this.syncMachineryMaintenanceStatus(String(deleted.machinery));

    return { message: 'Deleted' };
  }

  private async syncMachineryMaintenanceStatus(machineryId: string) {
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

    await this.machineryModel.findOneAndUpdate(
      { _id: machineryId, status: MachineryStatus.Maintenance },
      { status: MachineryStatus.Available },
    );
  }
}
