import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private toSafeUser(user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    phone: string | null;
    avatarUrl: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }

  private ensureImageFile(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
  }

  async register(input: RegisterDto) {
    // Check if user exists
    const existingUser = await this.db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await this.db.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        phone: input.phone,
        role: 'CUSTOMER',
      },
    });

    // Generate JWT
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      user: this.toSafeUser(user),
    };
  }

  async login(input: LoginDto) {
    const user = await this.db.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      user: this.toSafeUser(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return this.toSafeUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const updated = await this.db.user.update({
      where: { id: userId },
      data: {
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
    });

    return this.toSafeUser(updated);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    this.ensureImageFile(file);
    const avatarUrl = await this.cloudinaryService.uploadImage(
      file.buffer,
      'newoteg/users/avatars',
    );

    const updated = await this.db.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return this.toSafeUser(updated);
  }

  async validateUser(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
