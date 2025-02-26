import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUser {
  @ApiProperty({ example: '홍길동' })
  @IsNotEmpty({ message: '초대를 원하는 유저 닉네임을 적어주세요' })
  @IsString({ message: '문자열형식으로 작성해 주세요' })
  nickname: string;
}
