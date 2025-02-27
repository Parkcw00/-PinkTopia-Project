import {
  Controller,
  Get,
  Post,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { UserGuard } from 'src/user/guards/user-guard';

@UseGuards(UserGuard)
@Controller('catch-pinkmong')
export class CatchPinkmongController {
  constructor(private readonly catchPinkmongService: CatchPinkmongService) {}

  @Post('catchpinkmong')
  catchPinkmong(@Request() req) {
    return this.catchPinkmongService.appearPinkmong(req.user.id);
  }

  @Post('feeding')
  feeding(@Request() req, @Body('itemId', ParseIntPipe) itemId: number) {
    return this.catchPinkmongService.feeding(req.user.id, itemId);
  }

  @Post('giveup')
  async giveUp(@Body('userId') userId: number) {
    return this.catchPinkmongService.giveup(userId);
  }
}
