import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChattingDto {
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  @IsString({ message: '메시지는 문자열이어야 합니다.' })
  @ApiProperty({ example: '오혜성' })
  message: string;
}
