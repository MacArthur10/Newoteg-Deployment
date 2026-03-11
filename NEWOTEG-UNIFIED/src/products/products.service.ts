import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AdminCreateProductDto, AdminCreateVariantDto } from './dto/admin-create-product.dto';
import { AdminUpdateProductDto } from './dto/admin-update-product.dto';
import { AdminUpdateVariantStockDto } from './dto/admin-update-variant-stock.dto';
import { AdminUpdateVariantDto } from './dto/admin-update-variant.dto';
import { AdminCreateCategoryDto } from './dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private ensureImageFile(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
  }

  async findAll() {
    return this.db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        variants: {
          include: {
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          include: {
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async listCategories() {
    return this.db.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createProductWithVariant(input: AdminCreateProductDto) {
    const categoryName = input.categoryName?.trim() || 'General';

    const category = await this.db.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        description: `Category for ${categoryName}`,
      },
    });

    // Build variant data - support both multiple variants array and single variant properties
    let variantsData = {};
    if (input.variants && input.variants.length > 0) {
      variantsData = { create: input.variants };
    } else if (input.sku) {
      variantsData = {
        create: {
          sku: input.sku,
          purchasePrice: input.purchasePrice || 0,
          salePrice: input.salePrice || 0,
          stock: input.stock || 0,
        },
      };
    }

    return this.db.product.create({
      data: {
        categoryId: category.id,
        name: input.name,
        description: input.description,
        brand: input.brand,
        imageUrl: input.imageUrl,
        status: 'ACTIVE',
        ...(Object.keys(variantsData).length > 0 ? { variants: variantsData } : {}),
      },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async updateProduct(productId: string, input: AdminUpdateProductDto) {
    const existing = await this.db.product.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    let categoryId = existing.categoryId;
    if (input.categoryName) {
      const categoryName = input.categoryName.trim();
      const category = await this.db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          description: `Category for ${categoryName}`,
        },
      });
      categoryId = category.id;
    }

    return this.db.product.update({
      where: { id: productId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.brand !== undefined ? { brand: input.brand } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async deleteProduct(productId: string) {
    const existing = await this.db.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    // Get variant IDs for cleanup
    const variantIds = existing.variants.map((v) => v.id);

    if (variantIds.length > 0) {
      // Delete variant attributes first (has cascade)
      await this.db.variantAttribute.deleteMany({
        where: { variantId: { in: variantIds } },
      });

      // Delete stock movements (has cascade)
      await this.db.stockMovement.deleteMany({
        where: { variantId: { in: variantIds } },
      });
    }

    // Delete all variants
    await this.db.productVariant.deleteMany({
      where: { productId },
    });

    // Delete the product
    return this.db.product.delete({ where: { id: productId } });
  }

  async updateVariantStock(
    variantId: string,
    input: AdminUpdateVariantStockDto,
  ) {
    const variant = await this.db.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.db.productVariant.update({
      where: { id: variantId },
      data: { stock: input.stock },
      include: {
        product: true,
      },
    });
  }

  // -- new variant CRUD --------------------------------------------------
  async createVariant(productId: string, data: {
    sku: string;
    purchasePrice: number;
    salePrice: number;
    stock: number;
  }) {
    // ensure product exists
    const product = await this.db.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.db.productVariant.create({
      data: {
        productId,
        sku: data.sku,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        stock: data.stock,
      },
    });
  }

  async updateVariant(variantId: string, input: AdminUpdateVariantDto) {
    const variant = await this.db.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return this.db.productVariant.update({
      where: { id: variantId },
      data: {
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.purchasePrice !== undefined ? { purchasePrice: input.purchasePrice } : {}),
        ...(input.salePrice !== undefined ? { salePrice: input.salePrice } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
      },
    });
  }

  async deleteVariant(variantId: string) {
    const variant = await this.db.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return this.db.productVariant.delete({ where: { id: variantId } });
  }

  async createCategory(input: AdminCreateCategoryDto) {
    return this.db.category.create({
      data: {
        name: input.name.trim(),
        description: input.description,
        imageUrl: input.imageUrl,
      },
    });
  }

  async updateCategory(categoryId: string, input: AdminUpdateCategoryDto) {
    const existing = await this.db.category.findUnique({ where: { id: categoryId } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    return this.db.category.update({
      where: { id: categoryId },
      data: {
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      },
    });
  }

  async deleteCategory(categoryId: string) {
    const existing = await this.db.category.findUnique({ where: { id: categoryId } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const productCount = await this.db.product.count({ where: { categoryId } });
    if (productCount > 0) {
      throw new BadRequestException('Cannot delete category with linked products');
    }

    return this.db.category.delete({ where: { id: categoryId } });
  }

  async uploadProductImage(file: Express.Multer.File) {
    this.ensureImageFile(file);
    const imageUrl = await this.cloudinaryService.uploadImage(
      file.buffer,
      'newoteg/products',
    );

    return { imageUrl };
  }

  async uploadCategoryImage(file: Express.Multer.File) {
    this.ensureImageFile(file);
    const imageUrl = await this.cloudinaryService.uploadImage(
      file.buffer,
      'newoteg/categories',
    );

    return { imageUrl };
  }
}
