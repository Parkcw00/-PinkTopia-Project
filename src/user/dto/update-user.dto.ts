import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'testUpdateNickname //선택' })
  @IsOptional()
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  nickname?: string;

  @ApiProperty({ example: 'updateqwe123 //선택' })
  @IsOptional()
  @Length(6, 20, { message: '비밀번호는 6자 이상 20자 이하로 입력해주세요.' })
  password?: string;

  @ApiProperty({ example: 'https://example.com/image //선택' })
  @IsOptional()
  profile_image?: string;

  @ApiProperty({ example: '2025-02-17 //선택' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '생일 형식이 올바르지 않습니다.' })
  birthday?: Date;

  @IsOptional()
  @IsNumber()
  pink_gem?: number;

  @IsOptional()
  @IsNumber()
  pink_dia?: number;
}
