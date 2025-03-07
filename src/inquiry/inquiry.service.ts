import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from './entities/inquiry.entity';
import { CreateInquiryDto, InquiryType } from './dto/create-inquiry.dto';
import { UserService } from '../user/user.service';
import { S3Service } from '../s3/s3.service';
import { AnswerInquiryDto } from './dto/answer-inquiry.dto';
import { User } from '../user/entities/user.entity';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InquiryService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    // 이메일 전송을 위한 설정
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('NODEMAILER_USER'),
        pass: this.configService.get<string>('NODEMAILER_PASS'),
      },
    });
  }

  async createInquiry(createInquiryDto: CreateInquiryDto, file: Express.Multer.File, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    let attachmentUrl: string | null = null;
    if (file) {
      attachmentUrl = await this.s3Service.uploadFile(file);
    }

    const inquiry = this.inquiryRepository.create({
      user,
      ...createInquiryDto,
      attachmentUrl: attachmentUrl || undefined,
    });

    const savedInquiry = await this.inquiryRepository.save(inquiry);

    // 관리자에게 이메일 알림 전송
    try {
      const NODEMAILER_USER = this.configService.get<string>('NODEMAILER_USER');
      const BASE_URL = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';

      console.log('이메일 전송 시도:', {
        from: NODEMAILER_USER,
        to: NODEMAILER_USER,
        subject: `[PinkTopia] 새로운 문의가 접수되었습니다 - ${createInquiryDto.title}`
      });

      const mailResult = await this.transporter.sendMail({
        from: NODEMAILER_USER,
        to: NODEMAILER_USER,
        subject: `[PinkTopia] 새로운 문의가 접수되었습니다 - ${createInquiryDto.title}`,
        html: `
          <h2>새로운 문의가 접수되었습니다</h2>
          <p><strong>제목:</strong> ${createInquiryDto.title}</p>
          <p><strong>문의 유형:</strong> ${createInquiryDto.type}</p>
          <p><strong>작성자:</strong> ${user.nickname} (${user.email})</p>
          <p><strong>내용:</strong></p>
          <p>${createInquiryDto.content}</p>
          ${createInquiryDto.attachmentUrl ? `<p><strong>첨부파일:</strong> ${createInquiryDto.attachmentUrl}</p>` : ''}
          <p><a href="${BASE_URL}/inquiry/admin">관리자 페이지에서 확인하기</a></p>
        `,
      });
      console.log('이메일 전송 성공');
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      // 이메일 전송 실패는 문의 등록에 영향을 주지 않음
    }

    // 환불 요청인 경우 관리자에게 이메일 알림
    if (createInquiryDto.type === InquiryType.REFUND) {
      await this.sendRefundRequestEmail(inquiry);
    }

    return {
      success: true,
      message: '문의가 등록되었습니다.',
      inquiryId: savedInquiry.id,
    };
  }

  async findByUserId(userId: number) {
    return await this.inquiryRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll({ type, status, page, limit }) {
    const query = this.inquiryRepository.createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.user', 'user')
      .orderBy('inquiry.createdAt', 'DESC');

    if (type) {
      query.andWhere('inquiry.type = :type', { type });
    }

    if (status) {
      query.andWhere('inquiry.status = :status', { status });
    }

    const [inquiries, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      inquiries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const total = await this.inquiryRepository.count();
    const pending = await this.inquiryRepository.count({
      where: { status: 'pending' }
    });
    const completed = await this.inquiryRepository.count({
      where: { status: 'completed' }
    });
    const refundRequests = await this.inquiryRepository.count({
      where: { type: InquiryType.REFUND }
    });

    return {
      total,
      pending,
      completed,
      refundRequests,
    };
  }

  async findById(id: number) {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    return inquiry;
  }

  async answerInquiry(id: number, answerInquiryDto: AnswerInquiryDto) {
    const inquiry = await this.findById(id);
    
    inquiry.answer = answerInquiryDto.answer;
    inquiry.status = 'completed';
    inquiry.answeredAt = new Date();

    await this.inquiryRepository.save(inquiry);

    // 답변 완료 시 사용자에게 이메일 알림
    await this.sendAnswerNotificationEmail(inquiry);

    return {
      success: true,
      message: '답변이 등록되었습니다.',
    };
  }

  private async sendRefundRequestEmail(inquiry: Inquiry) {
    // 이메일 전송 로직 구현
    // nodemailer 등을 사용하여 관리자에게 환불 요청 알림 이메일 전송
  }

  private async sendAnswerNotificationEmail(inquiry: Inquiry) {
    // 이메일 전송 로직 구현
    // nodemailer 등을 사용하여 사용자에게 답변 완료 알림 이메일 전송
  }
} 