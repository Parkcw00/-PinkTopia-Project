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
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePinkmongDto } from './dto/create-pinkmong.dto';
import { UpdatePinkmongDto } from './dto/update-pinkmong.dto';

@Controller('pinkmong')
export class PinkmongController {
  constructor(private readonly pinkmongService: PinkmongService) {}

  @Post()
  @UseGuards(UserGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  createPinkmong(
    @Body() createPinkmongDto: CreatePinkmongDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pinkmongService.createPinkmong(createPinkmongDto, file);
  }

  @Get('pinkmongs')
  getAllPinkmongs() {
    return this.pinkmongService.getAllPinkmongs();
  }

  @Get(':pinkmongId')
  getPinkmong(@Param('pinkmongId') pinkmongId: number) {
    return this.pinkmongService.getPinkmong(pinkmongId);
  }

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

  @Delete(':pinkmongId')
  @UseGuards(UserGuard, AdminGuard)
  deletePinkmong(@Param('pinkmongId') pinkmongId: number) {
    return this.pinkmongService.deletePinkmong(pinkmongId);
  }
}
