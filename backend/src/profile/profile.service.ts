import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import {
  Assignment,
  AssignmentDocument,
  AssignmentStatus,
} from '../assignments/schemas/assignment.schema';
import {
  MaintenanceLog,
  MaintenanceLogDocument,
  MaintenanceStatus,
} from '../maintenance/schemas/maintenance-log.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

type ActivityTone = 'maintenance' | 'assignment';

type ProfileActivity = {
  id: string;
  type: ActivityTone;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  time: string;
};

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(MaintenanceLog.name)
    private readonly maintenanceLogModel: Model<MaintenanceLogDocument>,
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();

    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại.');
    }

    return this.toProfileUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updateData: Partial<User> = {};

    if (dto.fullName !== undefined) {
      updateData.fullName = dto.fullName.trim();
    }

    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl.trim();
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại.');
    }

    return this.toProfileUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    const user = await this.userModel
      .findById(userId)
      .select('+passwordHash')
      .exec();

    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await user.save();

    return { message: 'Đổi mật khẩu thành công.' };
  }

  async getActivities(userId: string, limit: number): Promise<ProfileActivity[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const objectUserId = new Types.ObjectId(userId);
    const [maintenanceLogs, assignments] = await Promise.all([
      this.maintenanceLogModel
        .find({ technician: objectUserId })
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .populate('machinery', 'name serialNumber')
        .lean<any[]>()
        .exec(),
      this.assignmentModel
        .find({ dispatcher: objectUserId })
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .populate('machinery', 'name serialNumber')
        .lean<any[]>()
        .exec(),
    ]);

    return [
      ...maintenanceLogs.map((log) => this.toMaintenanceActivity(log)),
      ...assignments.map((assignment) => this.toAssignmentActivity(assignment)),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, safeLimit);
  }

  private toProfileUser(user: any) {
    return {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toMaintenanceActivity(log: any): ProfileActivity {
    const equipmentName = log.machinery?.name ?? 'thiết bị không xác định';

    return {
      id: `MT-${String(log._id).slice(-6).toUpperCase()}`,
      type: 'maintenance',
      title:
        log.status === MaintenanceStatus.Completed
          ? 'Hoàn thành bảo trì'
          : 'Phiếu bảo trì',
      description: `${equipmentName}: ${log.description}`,
      status: this.toMaintenanceStatusLabel(log.status),
      createdAt: new Date(log.createdAt).toISOString(),
      time: this.relativeTime(log.createdAt),
    };
  }

  private toAssignmentActivity(assignment: any): ProfileActivity {
    const equipmentName =
      assignment.machinery?.name ?? 'thiết bị không xác định';

    return {
      id: `ASG-${String(assignment._id).slice(-6).toUpperCase()}`,
      type: 'assignment',
      title:
        assignment.status === AssignmentStatus.Completed
          ? 'Hoàn thành điều phối'
          : 'Phiếu điều phối',
      description: `${equipmentName} đến ${assignment.destination}`,
      status: this.toAssignmentStatusLabel(assignment.status),
      createdAt: new Date(assignment.createdAt).toISOString(),
      time: this.relativeTime(assignment.createdAt),
    };
  }

  private toMaintenanceStatusLabel(status: MaintenanceStatus) {
    const labels = {
      [MaintenanceStatus.Pending]: 'Lên lịch',
      [MaintenanceStatus.InProgress]: 'Đang làm',
      [MaintenanceStatus.Completed]: 'Hoàn thành',
    };

    return labels[status] ?? status;
  }

  private toAssignmentStatusLabel(status: AssignmentStatus) {
    const labels = {
      [AssignmentStatus.Pending]: 'Chờ xử lý',
      [AssignmentStatus.Active]: 'Đang hoạt động',
      [AssignmentStatus.Completed]: 'Hoàn thành',
    };

    return labels[status] ?? status;
  }

  private relativeTime(date?: Date | string) {
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
