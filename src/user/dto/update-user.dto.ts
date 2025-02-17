import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  nickname?: string;

  @IsOptional()
  @Length(6, 20, { message: '비밀번호는 6자 이상 20자 이하로 입력해주세요.' })
  password?: string;

  @IsOptional()
  profile_image?: string;

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
