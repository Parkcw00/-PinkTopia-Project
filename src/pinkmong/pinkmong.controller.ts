import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { PinkmongService } from './pinkmong.service';

@Controller('pinkmong')
export class PinkmongController {
  constructor(private readonly pinkmongService: PinkmongService) {}

  /**
   * 핑크몽 생성 API
   * [POST] /pinkmong
   */
  @Post()
  createPinkmong(@Body() body) {
    return this.pinkmongService.createPinkmong(body);
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
  updatePinkmong(@Param('pinkmongId') pinkmongId: number, @Body() body) {
    return this.pinkmongService.updatePinkmong(pinkmongId, body);
  }

  /**
   * 핑크몽 삭제 API
   * [DELETE] /pinkmong/:pinkmongId
   */
  @Delete(':pinkmongId')
  deletePinkmong(@Param('pinkmongId') pinkmongId: number) {
    return this.pinkmongService.deletePinkmong(pinkmongId);
  }
}
