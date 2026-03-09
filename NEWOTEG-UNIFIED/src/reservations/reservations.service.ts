import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AdminConvertReservationDto } from './dto/admin-convert-reservation.dto';
import { CreatePublicReservationDto } from './dto/create-public-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly db: DatabaseService) {}

  private splitFullName(fullName: string) {
    const trimmed = fullName.trim();
    const [firstName = 'Client', ...rest] = trimmed.split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    return { firstName, lastName };
  }

  private async loadAndValidateVariants(
    items: Array<{ variantId: string; quantity: number }>,
  ) {
    const variants = await this.db.productVariant.findMany({
      where: {
        id: { in: items.map((item) => item.variantId) },
      },
      include: { product: true },
    });

    if (variants.length !== items.length) {
      throw new BadRequestException('One or more variants do not exist');
    }

    const variantById = new Map(variants.map((v) => [v.id, v]));

    for (const item of items) {
      const variant = variantById.get(item.variantId);
      if (!variant) {
        throw new BadRequestException(`Variant ${item.variantId} not found`);
      }
      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${variant.sku}`,
        );
      }
    }

    return variantById;
  }

  async createForUser(userId: string, input: CreateReservationDto) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const variantById = await this.loadAndValidateVariants(input.items);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return this.db.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: user.email },
        update: {
          firstName: user.fullName.split(' ')[0] || user.fullName,
          lastName:
            user.fullName.split(' ').slice(1).join(' ') || user.fullName,
          phone: user.phone || undefined,
        },
        create: {
          userId: user.id,
          firstName: user.fullName.split(' ')[0] || user.fullName,
          lastName:
            user.fullName.split(' ').slice(1).join(' ') || user.fullName,
          email: user.email,
          phone: user.phone || undefined,
        },
      });

      const reservation = await tx.reservation.create({
        data: {
          customerId: customer.id,
          userId: user.id,
          status: 'ACTIVE',
          expiresAt,
          items: {
            create: input.items.map((item) => {
              const variant = variantById.get(item.variantId)!;
              return {
                variantId: item.variantId,
                productId: variant.productId,
                quantity: item.quantity,
                reservedPrice: variant.salePrice,
              };
            }),
          },
        },
        include: { items: true },
      });

      for (const item of input.items) {
        const variant = variantById.get(item.variantId)!;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: variant.stock - item.quantity },
        });
      }

      return reservation;
    });
  }

  async createForGuest(input: CreatePublicReservationDto) {
    const variantById = await this.loadAndValidateVariants(input.items);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const { firstName, lastName } = this.splitFullName(input.customer.fullName);

    return this.db.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: input.customer.email.trim().toLowerCase() },
        update: {
          firstName,
          lastName,
          phone: input.customer.phone,
        },
        create: {
          firstName,
          lastName,
          email: input.customer.email.trim().toLowerCase(),
          phone: input.customer.phone,
        },
      });

      const reservation = await tx.reservation.create({
        data: {
          customerId: customer.id,
          status: 'ACTIVE',
          expiresAt,
          items: {
            create: input.items.map((item) => {
              const variant = variantById.get(item.variantId)!;
              return {
                variantId: item.variantId,
                productId: variant.productId,
                quantity: item.quantity,
                reservedPrice: variant.salePrice,
              };
            }),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      for (const item of input.items) {
        const variant = variantById.get(item.variantId)!;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: variant.stock - item.quantity },
        });
      }

      return reservation;
    });
  }

  async getMine(userId: string) {
    return this.db.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async cancelMine(userId: string, reservationId: string) {
    const reservation = await this.db.reservation.findFirst({
      where: {
        id: reservationId,
        userId,
        status: 'ACTIVE',
      },
      include: { items: true },
    });

    if (!reservation) {
      throw new NotFoundException('Active reservation not found');
    }

    return this.db.$transaction(async (tx) => {
      for (const item of reservation.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: variant.stock + item.quantity },
          });
        }
      }

      return tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' },
      });
    });
  }

  async getAll() {
    return this.db.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async getSalesHistory() {
    return this.db.sale.findMany({
      orderBy: { saleDate: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async cancelAny(reservationId: string) {
    const reservation = await this.db.reservation.findFirst({
      where: {
        id: reservationId,
        status: 'ACTIVE',
      },
      include: { items: true },
    });

    if (!reservation) {
      throw new NotFoundException('Active reservation not found');
    }

    return this.db.$transaction(async (tx) => {
      for (const item of reservation.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: variant.stock + item.quantity },
          });
        }
      }

      return tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' },
      });
    });
  }

  async convertAnyToSale(
    reservationId: string,
    input: AdminConvertReservationDto,
  ) {
    const reservation = await this.db.reservation.findFirst({
      where: {
        id: reservationId,
        status: 'ACTIVE',
      },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Active reservation not found');
    }

    const totalAmount = reservation.items.reduce(
      (sum, item) => sum + item.quantity * item.reservedPrice,
      0,
    );

    const saleNumber = `SAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return this.db.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          customerId: reservation.customerId,
          saleNumber,
          totalAmount,
          paymentStatus: 'PENDING',
          paymentMethod: input.paymentMethod || 'CASH',
          notes: input.notes,
          items: {
            create: reservation.items.map((item) => ({
              variantId: item.variantId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.reservedPrice,
              totalPrice: item.quantity * item.reservedPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'COMPLETED' },
      });

      return sale;
    });
  }

  async deleteReservation(reservationId: string) {
    const reservation = await this.db.reservation.findUnique({
      where: { id: reservationId },
      include: { items: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // If the reservation is ACTIVE, restore stock first
    if (reservation.status === 'ACTIVE') {
      await this.db.$transaction(async (tx) => {
        for (const item of reservation.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (variant) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: variant.stock + item.quantity },
            });
          }
        }
      });
    }

    // Delete reservation items first (due to foreign key constraints)
    await this.db.reservationItem.deleteMany({
      where: { reservationId },
    });

    // Delete the reservation
    return this.db.reservation.delete({
      where: { id: reservationId },
    });
  }
}
