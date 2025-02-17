import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChattingDto {
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  @IsString({ message: '메시지는 문자열이어야 합니다.' })
  @ApiProperty({ example: '오혜성' })
  message: string;

  @IsOptional()
  @IsString({ message: '이미지는 주소열이어야 합니다.' })
  image?: string;
}
