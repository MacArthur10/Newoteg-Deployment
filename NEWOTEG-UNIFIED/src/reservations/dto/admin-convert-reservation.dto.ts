import { IsOptional, IsString } from 'class-validator';

export class AdminConvertReservationDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
