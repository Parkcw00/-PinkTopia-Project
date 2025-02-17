import { PartialType } from '@nestjs/mapped-types';
import { CreateChattingDto } from './create-chatting.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadChattingDto extends PartialType(CreateChattingDto) {
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  @IsString({ message: '메시지는 문자열이어야 합니다.' })
  @ApiProperty({ example: '오혜성' })
  message: string;

  @IsOptional()
  @IsString({ message: '이미지는 주소열이어야 합니다.' })
  image?: string;

  @IsNotEmpty({ message: '메시지 타입을 입력해주세요.' })
  @IsEnum(['text', 'image'], { message: '유효한 메시지 타입이어야 합니다.' })
  type: 'text' | 'image';
}
