import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeAdmin {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: '관리자 위임을 원하는 유저Id를 적어주세요' })
  @IsNumber({}, { message: '숫자형식으로 작성해 주세요' })
  userId: number;
}
