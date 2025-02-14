import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file')) // Multer를 사용하여 파일 업로드 처리
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file); // 서비스 계층에서 파일을 S3에 업로드
  }
}
