import { IsEmail, IsString } from 'class-validator';

export class VerifycodeDto {
  @IsEmail()
  email: string;

  @IsString()
  verificationCode: string;
}
