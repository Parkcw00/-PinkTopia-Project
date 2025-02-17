import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseFloatPipe,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { CreateCatchPinkmongDto } from './dto/create-catch_pinkmong.dto';
import { UpdateCatchPinkmongDto } from './dto/update-catch_pinkmong.dto';
import { UserGuard } from 'src/user/guards/user-guard';
@UseGuards(UserGuard)
@Controller('catch-pinkmong')
export class CatchPinkmongController {
  constructor(private readonly catchPinkmongService: CatchPinkmongService) {}
  @Post('catchpinkmong')
  catchPinkmong(@Request() req) {
    return this.catchPinkmongService.appearPinkmong(req.user.id);
  }
  @Get('feeding')
  feeding(@Request() req, @Body('itemId', ParseIntPipe) itemId: number) {
    return this.catchPinkmongService.feeding(req.user.id, itemId);
  }
  @Post('giveup')
  giveup(@Request() req) {
    return this.catchPinkmongService.giveup(req.user.id);
  }
}
