import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ReservationStatus } from '@prisma/client';
import { AuthUser } from '../common/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(user: AuthUser, dto: CreateReservationDto) {
    const storeId = this.getStoreId();
    if (user.storeId !== storeId) {
      throw new UnauthorizedException('Invalid store context');
    }

    await this.expirePendingReservations(storeId);

    const variantIds = dto.items.map((item) => item.variantId);

    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        storeId,
        isActive: true,
        status: 'ACTIVE',
        product: {
          isActive: true,
          status: 'ACTIVE',
        },
      },
      include: {
        product: true,
      },
    });

    if (variants.length !== variantIds.length) {
      throw new NotFoundException('One or more variants are unavailable');
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let totalAmount = new Prisma.Decimal(0);
    const reservationItems: {
      storeId: string;
      variantId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }[] = [];

    for (const requested of dto.items) {
      const variant = variantMap.get(requested.variantId);
      if (!variant) {
        throw new NotFoundException(`Variant not found: ${requested.variantId}`);
      }

      if (variant.stock < requested.quantity) {
        throw new BadRequestException(`Insufficient stock for SKU ${variant.sku}`);
      }

      const unitPrice = new Prisma.Decimal(variant.price);
      const lineTotal = unitPrice.mul(requested.quantity);
      totalAmount = totalAmount.add(lineTotal);

      reservationItems.push({
        storeId,
        variantId: variant.id,
        quantity: requested.quantity,
        unitPrice,
        totalPrice: lineTotal,
      });
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.getReservationExpiryMinutes());

    return this.prisma.$transaction(async (tx) => {
      for (const item of reservationItems) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            storeId,
            stock: {
              gte: item.quantity,
            },
            isActive: true,
            status: 'ACTIVE',
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new BadRequestException('Stock changed. Please retry reservation');
        }
      }

      const reservation = await tx.reservation.create({
        data: {
          storeId,
          customerId: user.userId,
          status: ReservationStatus.PENDING,
          totalAmount,
          expiresAt,
          items: {
            create: reservationItems,
          },
        },
        include: {
          items: true,
        },
      });

      return reservation;
    });
  }

  async myReservations(user: AuthUser) {
    const storeId = this.getStoreId();
    if (user.storeId !== storeId) {
      throw new UnauthorizedException('Invalid store context');
    }

    await this.expirePendingReservations(storeId);

    return this.prisma.reservation.findMany({
      where: {
        storeId,
        customerId: user.userId,
      },
      include: {
        items: {
          include: {
            variant: {
              select: {
                id: true,
                sku: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async expirePendingReservations(storeId: string): Promise<void> {
    const now = new Date();

    const expiredReservations = await this.prisma.reservation.findMany({
      where: {
        storeId,
        status: ReservationStatus.PENDING,
        expiresAt: {
          lte: now,
        },
      },
      include: {
        items: true,
      },
    });

    for (const reservation of expiredReservations) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of reservation.items) {
          await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              storeId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        await tx.reservation.update({
          where: { id: reservation.id },
          data: {
            status: ReservationStatus.EXPIRED,
          },
        });
      });
    }
  }

  async updateReservationStatus(user: AuthUser, reservationId: string, newStatus: ReservationStatus) {
    const storeId = this.getStoreId();
    if (user.storeId !== storeId) {
      throw new UnauthorizedException('Invalid store context');
    }

    const reservation = await this.prisma.reservation.findFirst({
      where: { id: reservationId, storeId },
      include: { items: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // If cancelling, restore stock
    if (newStatus === ReservationStatus.CANCELLED && reservation.status !== ReservationStatus.CANCELLED) {
      await this.restoreStock(reservation.items);
    }

    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus },
      include: { items: true },
    });
  }

  async adminListReservations(user: AuthUser) {
    const storeId = this.getStoreId();
    if (user.storeId !== storeId) {
      throw new UnauthorizedException('Invalid store context');
    }

    // Check if user is ADMIN
    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }

    return this.prisma.reservation.findMany({
      where: { storeId },
      include: {
        customer: {
          select: { id: true, email: true, fullName: true },
        },
        items: {
          include: {
            variant: {
              select: { id: true, sku: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async restoreStock(items: Array<{ variantId: string; quantity: number }>) {
    for (const item of items) {
      await this.prisma.productVariant.updateMany({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  private getStoreId(): string {
    return this.configService.get<string>('STORE_ID') ?? 'default-store';
  }

  private getReservationExpiryMinutes(): number {
    const raw = this.configService.get<string>('RESERVATION_EXPIRY_MINUTES');
    const value = raw ? Number(raw) : 30;
    return Number.isFinite(value) && value > 0 ? value : 30;
  }

  private aggregateItems(dto: CreateReservationDto): Array<{ variantId: string; quantity: number }> {
    const map = new Map<string, number>();
    for (const item of dto.items) {
      const current = map.get(item.variantId) || 0;
      map.set(item.variantId, current + item.quantity);
    }
    return Array.from(map).map(([variantId, quantity]) => ({ variantId, quantity }));
  }
}
