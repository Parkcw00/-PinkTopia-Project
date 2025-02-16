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
} from '@nestjs/common';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { CreateCatchPinkmongDto } from './dto/create-catch_pinkmong.dto';
import { UpdateCatchPinkmongDto } from './dto/update-catch_pinkmong.dto';

@Controller('catch-pinkmong')
export class CatchPinkmongController {
  constructor(private readonly catchPinkmongService: CatchPinkmongService) {}

  @Post('catchpinkmong/:userId')
  catchPinkmong(@Param('userId', ParseIntPipe) userId: number) {
    return this.catchPinkmongService.appearPinkmong(userId);
  }

  @Get('feeding/:catchId/:itemId')
  feeding(
    @Param('catchId', ParseIntPipe) catchId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.catchPinkmongService.feeding(catchId, itemId);
  }

  @Post(':id')
  giveup(@Param('id') id: string) {
    return this.catchPinkmongService.giveup(+id);
  }
}
