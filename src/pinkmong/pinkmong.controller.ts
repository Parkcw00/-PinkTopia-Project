import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PinkmongService } from './pinkmong.service';
import { UserGuard } from 'src/user/guards/user-guard';
import { AdminGuard } from 'src/user/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('pinkmong')
export class PinkmongController {
  constructor(private readonly pinkmongService: PinkmongService) {}

  /**
   * 핑크몽 생성 API
   * [POST] /pinkmong
   */
  @Post()
  @UseGuards(UserGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  createPinkmong(@Body() body, @UploadedFile() file: Express.Multer.File) {
    return this.pinkmongService.createPinkmong(body, file);
  }

  /**
   * 모든 핑크몽 조회 API
   * [GET] /pinkmong/pinkmongs
   */
  @Get('pinkmongs')
  getAllPinkmongs() {
    return this.pinkmongService.getAllPinkmongs();
  }

  /**
   * 특정 핑크몽 조회 API
   * [GET] /pinkmong/:pinkmongId
   */
  @Get(':pinkmongId')
  getPinkmong(@Param('pinkmongId') pinkmongId: number) {
    return this.pinkmongService.getPinkmong(pinkmongId);
  }

  /**
   * 핑크몽 수정 API
   * [PATCH] /pinkmong/:pinkmongId
   */
  @Patch(':pinkmongId')
  @UseGuards(UserGuard, AdminGuard)
  updatePinkmong(@Param('pinkmongId') pinkmongId: number, @Body() body) {
    return this.pinkmongService.updatePinkmong(pinkmongId, body);
  }

  /**
   * 핑크몽 삭제 API
   * [DELETE] /pinkmong/:pinkmongId
   */
  @Delete(':pinkmongId')
  @UseGuards(UserGuard, AdminGuard)
  deletePinkmong(@Param('pinkmongId') pinkmongId: number) {
    return this.pinkmongService.deletePinkmong(pinkmongId);
  }
}
