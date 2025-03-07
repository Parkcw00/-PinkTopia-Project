import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum InquiryType {
  REFUND = 'refund',
  PAYMENT = 'payment',
  BUG = 'bug',
  SUGGESTION = 'suggestion',
  OTHER = 'other',
}

export class CreateInquiryDto {
  @IsEnum(InquiryType)
  type: InquiryType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsNumber()
  @IsOptional()
  orderId?: number;

  @IsString()
  @IsOptional()
  paymentKey?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  refundReason?: string;
} 