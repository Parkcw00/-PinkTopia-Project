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
import { CreatePinkmongDto } from './dto/create-pinkmong.dto';
import { UpdatePinkmongDto } from './dto/update-pinkmong.dto';

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
  createPinkmong(
    @Body() createPinkmongDto: CreatePinkmongDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pinkmongService.createPinkmong(createPinkmongDto, file);
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
  @UseInterceptors(FileInterceptor('file')) // 🔹 파일 업로드 지원
  updatePinkmong(
    @Param('pinkmongId') pinkmongId: number,
    @Body() updatePinkmongDto: UpdatePinkmongDto,
    @UploadedFile() file?: Express.Multer.File, // 🔹 파일 추가
  ) {
    return this.pinkmongService.updatePinkmong(
      pinkmongId,
      updatePinkmongDto,
      file,
    );
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
