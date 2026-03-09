import { IsInt, Min } from 'class-validator';

export class AdminUpdateVariantStockDto {
  @IsInt()
  @Min(0)
  stock: number;
}
