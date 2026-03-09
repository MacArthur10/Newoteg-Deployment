import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AdminConvertReservationDto } from './dto/admin-convert-reservation.dto';
import { CreatePublicReservationDto } from './dto/create-public-reservation.dto';

function assertAdmin(user: AuthUser) {
  if (user.role !== 'ADMIN') {
    throw new ForbiddenException('Admin access required');
  }
}

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('guest')
  createGuest(@Body() input: CreatePublicReservationDto) {
    return this.reservationsService.createForGuest(input);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: AuthUser,
    @Body() input: CreateReservationDto,
  ) {
    return this.reservationsService.createForUser(user.id, input);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMine(@CurrentUser() user: AuthUser) {
    return this.reservationsService.getMine(user.id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  getAll(@CurrentUser() user: AuthUser) {
    assertAdmin(user);
    return this.reservationsService.getAll();
  }

  @Get('admin/sales-history')
  @UseGuards(JwtAuthGuard)
  getSalesHistory(@CurrentUser() user: AuthUser) {
    assertAdmin(user);
    return this.reservationsService.getSalesHistory();
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.reservationsService.cancelMine(user.id, id);
  }

  @Patch('admin/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelAny(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    assertAdmin(user);
    return this.reservationsService.cancelAny(id);
  }

  @Patch('admin/:id/convert')
  @UseGuards(JwtAuthGuard)
  convertAnyToSale(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() input: AdminConvertReservationDto,
  ) {
    assertAdmin(user);
    return this.reservationsService.convertAnyToSale(id, input);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  deleteReservation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    assertAdmin(user);
    return this.reservationsService.deleteReservation(id);
  }
}
