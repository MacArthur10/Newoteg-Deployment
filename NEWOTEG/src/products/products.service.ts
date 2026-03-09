import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { CreateVariantDto, UpdateVariantDto } from './dto/create-variant.dto';
import { AuthUser } from '../common/types/auth-user.type';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // Public: List all active products
  async list() {
    const storeId = this.getStoreId();

    return this.prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        variants: {
          where: {
            storeId,
            isActive: true,
            status: 'ACTIVE',
          },
          select: {
            id: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Public: Get product details
  async details(productId: string) {
    const storeId = this.getStoreId();

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
        isActive: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        createdAt: true,
        variants: {
          where: {
            storeId,
            isActive: true,
            status: 'ACTIVE',
          },
          select: {
            id: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Admin: Create product
  async createProduct(user: AuthUser, dto: CreateProductDto) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    return this.prisma.product.create({
      data: {
        storeId,
        name: dto.name,
        description: dto.description ?? null,
        category: dto.category,
        isActive: true,
        status: 'ACTIVE',
      },
    });
  }

  // Admin: Update product
  async updateProduct(user: AuthUser, productId: string, dto: UpdateProductDto) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    // Verify product exists and belongs to store
    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        isActive: dto.isActive,
      },
    });
  }

  // Admin: Delete (soft) product
  async deleteProduct(user: AuthUser, productId: string) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        status: 'INACTIVE',
      },
    });
  }

  // Admin: Create variant
  async createVariant(user: AuthUser, productId: string, dto: CreateVariantDto) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Generate SKU if not provided
    const sku = dto.sku || `${product.id.substring(0, 8)}-${Date.now()}`;

    // Check SKU uniqueness
    const existingSku = await this.prisma.productVariant.findFirst({
      where: { storeId, sku },
    });

    if (existingSku) {
      throw new BadRequestException('SKU already exists');
    }

    return this.prisma.productVariant.create({
      data: {
        storeId,
        productId,
        sku,
        price: dto.price,
        stock: dto.stock,
        isActive: true,
        status: 'ACTIVE',
      },
    });
  }

  // Admin: Update variant
  async updateVariant(user: AuthUser, variantId: string, dto: UpdateVariantDto) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, storeId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Check SKU uniqueness if changing
    if (dto.sku && dto.sku !== variant.sku) {
      const existingSku = await this.prisma.productVariant.findFirst({
        where: { storeId, sku: dto.sku, id: { not: variantId } },
      });

      if (existingSku) {
        throw new BadRequestException('SKU already exists');
      }
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock,
        isActive: dto.isActive,
      },
    });
  }

  // Admin: Delete (soft) variant
  async deleteVariant(user: AuthUser, variantId: string) {
    this.enforceAdminRole(user);
    const storeId = this.getStoreId();

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, storeId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        isActive: false,
        status: 'INACTIVE',
      },
    });
  }

  // Admin: List all products (including inactive)
  async adminListProducts(user: AuthUser) {
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

  private enforceAdminRole(user: AuthUser): void {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }

  private getStoreId(): string {
    return this.configService.get<string>('STORE_ID') ?? 'default-store';
  }
}
