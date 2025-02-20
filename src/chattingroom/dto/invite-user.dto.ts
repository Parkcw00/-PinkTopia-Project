import { IsNotEmpty, IsNumber } from 'class-validator';

export class InviteUser {
  @IsNotEmpty({ message: '초대를 원하는 유저Id를 적어주세요' })
  @IsNumber({}, { message: '숫자형식으로 작성해 주세요' })
  userId: number;
}
