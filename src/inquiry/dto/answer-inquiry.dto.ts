import { IsString, IsNotEmpty } from 'class-validator';

export class AnswerInquiryDto {
  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  attachmentUrl: string;
} 