import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { CreateVariantDto, UpdateVariantDto } from './dto/create-variant.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public endpoints
  @Get()
  list() {
    return this.productsService.list();
  }

  @Get(':id')
  details(@Param('id') id: string) {
    return this.productsService.details(id);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  createProduct(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(user, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteProduct(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productsService.deleteProduct(user, id);
  }

  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard)
  createVariant(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(user, productId, dto);
  }

  @Put('variants/:id')
  @UseGuards(JwtAuthGuard)
  updateVariant(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(user, id, dto);
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard)
  deleteVariant(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productsService.deleteVariant(user, id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  adminListProducts(@CurrentUser() user: AuthUser) {
    return this.productsService.adminListProducts(user);
  }
}
