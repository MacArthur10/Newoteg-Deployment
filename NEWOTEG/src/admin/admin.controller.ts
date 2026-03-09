import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: AuthUser) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    const [totalProducts, totalVariants, totalReservations, pendingReservations, revenue] = await Promise.all([
      this.prisma.product.count({ where: { storeId, isActive: true } }),
      this.prisma.productVariant.count({ where: { storeId, isActive: true } }),
      this.prisma.reservation.count({ where: { storeId } }),
      this.prisma.reservation.count({ where: { storeId, status: 'PENDING' } }),
      this.prisma.reservation.aggregate({
        where: { storeId, status: { in: ['CONFIRMED'] } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      store: storeId,
      stats: {
        totalProducts,
        totalVariants,
        totalReservations,
        pendingReservations,
        confirmedRevenue: revenue._sum.totalAmount || 0,
      },
    };
  }

  @Get('products')
  async listProducts(@CurrentUser() user: AuthUser) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    return this.prisma.product.findMany({
      where: { storeId },
      include: {
        variants: {
          where: { storeId },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('reservations')
  async listReservations(@CurrentUser() user: AuthUser) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    return this.prisma.reservation.findMany({
      where: { storeId },
      include: {
        customer: {
          select: { id: true, email: true, fullName: true, phone: true },
        },
        items: {
          include: {
            variant: {
              select: { 
                id: true, 
                sku: true, 
                price: true,
                product: {
                  select: { id: true, name: true, category: true }
                }
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('users')
  async listUsers(@CurrentUser() user: AuthUser) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    return this.prisma.user.findMany({
      where: { storeId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        phone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('analytics/revenue')
  async revenueAnalytics(@CurrentUser() user: AuthUser) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    const reservations = await this.prisma.reservation.findMany({
      where: { storeId, status: 'CONFIRMED' },
      select: { totalAmount: true, createdAt: true },
    });

    const byStatus = await this.prisma.reservation.groupBy({
      by: ['status'],
      where: { storeId },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    return {
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        total: s._sum.totalAmount || 0,
      })),
      totalReservations: reservations.length,
      totalRevenue: reservations.reduce((sum, r) => sum + Number(r.totalAmount), 0),
    };
  }

  private enforceAdminRole(user: AuthUser): void {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }

  private getStoreId(): string {
    return this.configService.get<string>('STORE_ID') ?? 'default-store';
  }
}
