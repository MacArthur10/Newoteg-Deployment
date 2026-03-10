import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  UploadedFile,
  Param,
  Patch,
  Post,
  UseGuards,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';
import { AdminUpdateProductDto } from './dto/admin-update-product.dto';
import { AdminUpdateVariantStockDto } from './dto/admin-update-variant-stock.dto';
import { AdminUpdateVariantDto } from './dto/admin-update-variant.dto';
import { AdminCreateCategoryDto } from './dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

function assertAdmin(user: AuthUser) {
  if (user.role !== 'ADMIN') {
    throw new ForbiddenException('Admin access required');
  }
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('categories')
  listCategories() {
    return this.productsService.listCategories();
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard)
  listCategoriesForAdmin(@CurrentUser() user: AuthUser) {
    assertAdmin(user);
    return this.productsService.listCategories();
  }

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard)
  createCategory(
    @CurrentUser() user: AuthUser,
    @Body() input: AdminCreateCategoryDto,
  ) {
    assertAdmin(user);
    return this.productsService.createCategory(input);
  }

  @Patch('admin/categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(
    @CurrentUser() user: AuthUser,
    @Param('id') categoryId: string,
    @Body() input: AdminUpdateCategoryDto,
  ) {
    assertAdmin(user);
    return this.productsService.updateCategory(categoryId, input);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard)
  deleteCategory(@CurrentUser() user: AuthUser, @Param('id') categoryId: string) {
    assertAdmin(user);
    return this.productsService.deleteCategory(categoryId);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  createProduct(
    @CurrentUser() user: AuthUser,
    @Body() input: AdminCreateProductDto,
  ) {
    assertAdmin(user);
    return this.productsService.createProductWithVariant(input);
  }

  @Patch('admin/:productId')
  @UseGuards(JwtAuthGuard)
  updateProduct(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() input: AdminUpdateProductDto,
  ) {
    assertAdmin(user);
    return this.productsService.updateProduct(productId, input);
  }

  @Delete('admin/:productId')
  @UseGuards(JwtAuthGuard)
  deleteProduct(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
  ) {
    assertAdmin(user);
    return this.productsService.deleteProduct(productId);
  }

  @Post('admin/upload/product-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadProductImage(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    assertAdmin(user);
    return this.productsService.uploadProductImage(file);
  }

  @Post('admin/upload/category-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadCategoryImage(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    assertAdmin(user);
    return this.productsService.uploadCategoryImage(file);
  }

  @Post('admin/variants')
  @UseGuards(JwtAuthGuard)
  createVariant(
    @CurrentUser() user: AuthUser,
    @Body() input: AdminCreateVariantDto,
  ) {
    assertAdmin(user);
    return this.productsService.createVariant(input.productId, input);
  }

  @Patch('admin/variants/:variantId')
  @UseGuards(JwtAuthGuard)
  updateVariant(
    @CurrentUser() user: AuthUser,
    @Param('variantId') variantId: string,
    @Body() input: AdminUpdateVariantDto,
  ) {
    assertAdmin(user);
    return this.productsService.updateVariant(variantId, input);
  }

  @Delete('admin/variants/:variantId')
  @UseGuards(JwtAuthGuard)
  deleteVariant(
    @CurrentUser() user: AuthUser,
    @Param('variantId') variantId: string,
  ) {
    assertAdmin(user);
    return this.productsService.deleteVariant(variantId);
  }

  @Patch('admin/variants/:variantId/stock')
  @UseGuards(JwtAuthGuard)
  updateVariantStock(
    @CurrentUser() user: AuthUser,
    @Param('variantId') variantId: string,
    @Body() input: AdminUpdateVariantStockDto,
  ) {
    assertAdmin(user);
    return this.productsService.updateVariantStock(variantId, input);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
