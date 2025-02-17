import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @ApiProperty({ example: 'TEST12' })
  @IsNotEmpty({ message: '인증코드를 입력해주세요.' })
  @IsString({ message: '인증코드를는 문자열이어야 합니다.' })
  @Length(6, 6, { message: '인증코드는 여섯 글자로 입력해주세요.' })
  verificationCode: string;
}