import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  nickname: string;

  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @Length(6, 20, { message: '비밀번호는 6자 이상 20자 이하로 입력해주세요.' })
  password: string;

  @IsNotEmpty({ message: '비밀번호를 확인칸을 입력해주세요.' })
  @IsString({ message: '비밀번호 확인은 문자열이어야 합니다.' })
  @Length(6, 20, { message: '비밀번호 확인은 6자 이상 20자 이하로 입력해주세요.' })
  confirmedPassword: string;

  @IsOptional()
  @IsDate({ message: '생일 형식이 올바르지 않습니다.' })
  birthday?: Date;
}