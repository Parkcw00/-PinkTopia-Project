import { Controller, Post, Get, UseGuards, UseInterceptors, UploadedFile, Body, Request, Put, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { AnswerInquiryDto } from './dto/answer-inquiry.dto';

@Controller('inquiry')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Post()
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('attachment'))
  async createInquiry(
    @UploadedFile() file: Express.Multer.File,
    @Body() createInquiryDto: CreateInquiryDto,
    @Request() req
  ) {
    return await this.inquiryService.createInquiry(createInquiryDto, file, req.user.id);
  }

  @Get('my')
  @UseGuards(UserGuard)
  async getMyInquiries(@Request() req) {
    return await this.inquiryService.findByUserId(req.user.id);
  }

  // 관리자용 엔드포인트
  @Get('admin')
  @UseGuards(UserGuard, AdminGuard)
  async getInquiryList(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.inquiryService.findAll({
      type,
      status,
      page: 1,
      limit: 100, // 한 번에 모든 문의를 가져옴
    });
    return result.inquiries; // 문의 목록만 반환
  }

  @Get('admin/stats')
  @UseGuards(UserGuard, AdminGuard)
  async getInquiryStats() {
    return await this.inquiryService.getStats();
  }

  @Get('admin/:id')
  @UseGuards(UserGuard, AdminGuard)
  async getInquiryDetail(@Param('id') id: number) {
    return await this.inquiryService.findById(id);
  }

  @Put(':id/answer')
  @UseGuards(UserGuard, AdminGuard)
  async answerInquiry(
    @Param('id') id: number,
    @Body() answerInquiryDto: AnswerInquiryDto,
  ) {
    return await this.inquiryService.answerInquiry(id, answerInquiryDto);
  }
}