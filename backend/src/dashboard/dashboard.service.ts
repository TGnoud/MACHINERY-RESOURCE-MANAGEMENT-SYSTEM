import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Assignment,
  AssignmentDocument,
  AssignmentStatus,
} from '../assignments/schemas/assignment.schema';
import {
  Machinery,
  MachineryDocument,
  MachineryStatus,
} from '../machineries/schemas/machinery.schema';
import {
  MaintenanceLog,
  MaintenanceLogDocument,
  MaintenancePriority,
  MaintenanceStatus,
} from '../maintenance/schemas/maintenance-log.schema';

type MachineryStatusCount = {
  _id: MachineryStatus;
  count: number;
};

type CostAggregation = {
  _id: {
    year: number;
    month: number;
  };
  totalCost: number;
};

type PopulatedMaintenance = {
  _id: Types.ObjectId;
  machinery?: { name?: string } | null;
  technician?: { fullName?: string } | null;
  cost: number;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  completedAt?: Date;
  createdAt?: Date;
};

type PopulatedAssignment = {
  _id: Types.ObjectId;
  machinery?: { name?: string } | null;
  dispatcher?: { fullName?: string } | null;
  destination: string;
  status: AssignmentStatus;
  startDate: Date;
  endDate?: Date;
  createdAt?: Date;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Machinery.name)
    private readonly machineryModel: Model<MachineryDocument>,
    @InjectModel(MaintenanceLog.name)
    private readonly maintenanceLogModel: Model<MaintenanceLogDocument>,
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
  ) {}

  async getStats() {
    const [total, groupedStatus] = await Promise.all([
      this.machineryModel.countDocuments().exec(),
      this.machineryModel
        .aggregate<MachineryStatusCount>([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ])
        .exec(),
    ]);

    const statusMap = new Map(
      groupedStatus.map((item) => [item._id, item.count]),
    );
    const available = statusMap.get(MachineryStatus.Available) ?? 0;
    const rented = statusMap.get(MachineryStatus.Rented) ?? 0;
    const maintenance = statusMap.get(MachineryStatus.Maintenance) ?? 0;

    return {
      total,
      available,
      rented,
      maintenance,
      availabilityRate: this.toRate(available, total),
      rentedRate: this.toRate(rented, total),
      maintenanceRate: this.toRate(maintenance, total),
    };
  }

  async getCostHistory() {
    const months = this.getLastSixMonths();
    const firstMonth = months[0];
    const startDate = new Date(firstMonth.year, firstMonth.month - 1, 1);

    const costs = await this.maintenanceLogModel
      .aggregate<CostAggregation>([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            totalCost: { $sum: '$cost' },
          },
        },
      ])
      .exec();
    const costMap = new Map(
      costs.map((item) => [
        `${item._id.year}-${item._id.month}`,
        item.totalCost,
      ]),
    );

    return months.map((item) => ({
      month: item.month,
      year: item.year,
      label: `T${item.month}`,
      totalCost: costMap.get(`${item.year}-${item.month}`) ?? 0,
    }));
  }

  async getRecentMaintenance() {
    const logs = await this.maintenanceLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('machinery', 'name')
      .populate('technician', 'fullName')
      .lean<PopulatedMaintenance[]>()
      .exec();

    return logs.map((log) => ({
      id: `MT-${String(log._id).slice(-6).toUpperCase()}`,
      equipment: log.machinery?.name ?? 'Thiết bị không xác định',
      technician: log.technician?.fullName ?? 'Chưa phân công',
      date: this.formatDate(log.createdAt),
      level: this.toPriorityLabel(log.priority),
      status: this.toMaintenanceStatusLabel(log.status),
      cost: log.cost,
    }));
  }

  async getRecentActivities() {
    const [maintenanceLogs, assignments] = await Promise.all([
      this.maintenanceLogModel
        .find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('machinery', 'name')
        .populate('technician', 'fullName')
        .lean<PopulatedMaintenance[]>()
        .exec(),
      this.assignmentModel
        .find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('machinery', 'name')
        .populate('dispatcher', 'fullName')
        .lean<PopulatedAssignment[]>()
        .exec(),
    ]);

    const maintenanceActivities = maintenanceLogs.map((log) => ({
      title:
        log.status === MaintenanceStatus.Completed
          ? 'Hoàn thành bảo trì'
          : 'Tạo phiếu bảo trì mới',
      body: `${log.technician?.fullName ?? 'Kỹ thuật viên'} xử lý ${log.machinery?.name ?? 'thiết bị'}: ${log.description}`,
      time: this.relativeTime(log.createdAt),
      tone: this.toActivityTone(log.status),
      createdAt: log.createdAt ?? new Date(0),
    }));
    const assignmentActivities = assignments.map((assignment) => ({
      title:
        assignment.status === AssignmentStatus.Completed
          ? 'Hoàn thành điều phối'
          : 'Tạo phiếu điều phối mới',
      body: `${assignment.dispatcher?.fullName ?? 'Điều phối viên'} điều động ${assignment.machinery?.name ?? 'thiết bị'} đến ${assignment.destination}.`,
      time: this.relativeTime(assignment.createdAt),
      tone:
        assignment.status === AssignmentStatus.Completed
          ? ('green' as const)
          : ('sky' as const),
      createdAt: assignment.createdAt ?? new Date(0),
    }));

    return [...maintenanceActivities, ...assignmentActivities]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8)
      .map((activity) => ({
        title: activity.title,
        body: activity.body,
        time: activity.time,
        tone: activity.tone,
      }));
  }

  private getLastSixMonths() {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
    });
  }

  private toRate(value: number, total: number) {
    if (total === 0) {
      return 0;
    }

    return Number(((value / total) * 100).toFixed(1));
  }

  private toPriorityLabel(priority: MaintenancePriority) {
    const labels = {
      [MaintenancePriority.Low]: 'Thường',
      [MaintenancePriority.Medium]: 'Trung bình',
      [MaintenancePriority.High]: 'Cao',
      [MaintenancePriority.Critical]: 'Khẩn cấp',
    };

    return labels[priority] ?? 'Trung bình';
  }

  private toMaintenanceStatusLabel(status: MaintenanceStatus) {
    const labels = {
      [MaintenanceStatus.Pending]: 'Đang xử lý',
      [MaintenanceStatus.InProgress]: 'Đang xử lý',
      [MaintenanceStatus.Completed]: 'Hoàn thành',
    };

    return labels[status] ?? 'Đang xử lý';
  }

  private toActivityTone(status: MaintenanceStatus) {
    if (status === MaintenanceStatus.Completed) {
      return 'green' as const;
    }

    if (status === MaintenanceStatus.InProgress) {
      return 'amber' as const;
    }

    return 'sky' as const;
  }

  private formatDate(date?: Date) {
    if (!date) {
      return 'Chưa xác định';
    }

    return new Intl.DateTimeFormat('vi-VN').format(date);
  }

  private relativeTime(date?: Date) {
    if (!date) {
      return 'Vừa xong';
    }

    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60_000));

    if (minutes < 60) {
      return `${minutes} phút trước`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} giờ trước`;
    }

    const days = Math.floor(hours / 24);

    return `${days} ngày trước`;
  }
}
