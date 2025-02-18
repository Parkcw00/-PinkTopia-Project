import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'testNickname' })
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  nickname: string;

  @ApiProperty({ example: 'test@gmail.com' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @ApiProperty({ example: 'qwe123' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @Length(6, 20, { message: '비밀번호는 6자 이상 20자 이하로 입력해주세요.' })
  password: string;

  @ApiProperty({ example: 'qwe123' })
  @IsNotEmpty({ message: '비밀번호를 확인칸을 입력해주세요.' })
  @IsString({ message: '비밀번호 확인은 문자열이어야 합니다.' })
  @Length(6, 20, { message: '비밀번호 확인은 6자 이상 20자 이하로 입력해주세요.' })
  confirmedPassword: string;

  @ApiProperty({ example: '2025-02-17 // 선택' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '생일 형식이 올바르지 않습니다.' })
  birthday?: Date;
}