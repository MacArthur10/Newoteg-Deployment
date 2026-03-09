import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [DatabaseModule],
  providers: [ProductsService, CloudinaryService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
