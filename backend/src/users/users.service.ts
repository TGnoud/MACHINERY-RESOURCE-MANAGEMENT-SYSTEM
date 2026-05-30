import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 20, search, role, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      const trimmed = search.trim();
      filter.$or = [
        { fullName: { $regex: trimmed, $options: 'i' } },
        { email: { $regex: trimmed, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    // Format data to map _id to id or clean up output
    const formattedData = data.map((user: any) => {
      const { passwordHash, refreshTokenHash, ...rest } = user;
      return { ...rest, id: String(user._id) };
    });

    return {
      data: formattedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) {
      throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại.`);
    }

    const { passwordHash, refreshTokenHash, ...rest } = user as any;
    return { ...rest, id: String(user._id) };
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userModel.exists({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng bởi một tài khoản khác.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const newUser = await this.userModel.create({
      fullName: dto.fullName.trim(),
      email,
      role: dto.role,
      status: dto.status || UserStatus.Active,
      passwordHash,
    });

    const { passwordHash: _, ...rest } = newUser.toObject();
    return { ...rest, id: String(newUser._id) };
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại.`);
    }

    // Safety constraint: Prevent editing self to demote role or disable status
    if (String(user._id) === currentUserId) {
      if (dto.role && dto.role !== UserRole.Admin) {
        throw new BadRequestException(
          'Bạn không thể tự hạ quyền ADMIN của chính mình.',
        );
      }
      if (dto.status && dto.status !== UserStatus.Active) {
        throw new BadRequestException(
          'Bạn không thể tự vô hiệu hóa tài khoản của chính mình.',
        );
      }
    }

    // Email duplicate check
    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      if (email !== user.email) {
        const emailConflict = await this.userModel.exists({ email }).exec();
        if (emailConflict) {
          throw new ConflictException('Email này đã được sử dụng bởi một tài khoản khác.');
        }
        user.email = email;
      }
    }

    if (dto.fullName) {
      user.fullName = dto.fullName.trim();
    }

    if (dto.role) {
      user.role = dto.role;
    }

    if (dto.status) {
      user.status = dto.status;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    await user.save();

    const { passwordHash, refreshTokenHash, ...rest } = user.toObject();
    return { ...rest, id: String(user._id) };
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại.`);
    }

    // Safety constraint: Prevent self-deletion
    if (String(user._id) === currentUserId) {
      throw new BadRequestException('Không thể tự xóa tài khoản của chính mình.');
    }

    await this.userModel.findByIdAndDelete(id).exec();
    return { message: 'Xóa tài khoản thành công.' };
  }

  async getStats() {
    const [total, adminCount, dispatcherCount, technicianCount] = await Promise.all([
      this.userModel.countDocuments({}).exec(),
      this.userModel.countDocuments({ role: UserRole.Admin }).exec(),
      this.userModel.countDocuments({ role: UserRole.Dispatcher }).exec(),
      this.userModel.countDocuments({ role: UserRole.Technician }).exec(),
    ]);

    return {
      total,
      admin: adminCount,
      dispatcher: dispatcherCount,
      technician: technicianCount,
    };
  }
}
