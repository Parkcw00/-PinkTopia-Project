import { IsInt, IsNotEmpty } from 'class-validator'; // 데이터 검증을 위한 데코레이터를 가져옴

export class CreateCatchPinkmongDto {
  @IsInt() // 정수 타입인지 확인
  @IsNotEmpty() // 값이 비어있지 않은지 확인
  user_id: number; // 사용자 ID (필수)

  @IsInt()
  @IsNotEmpty()
  pinkmong_id: number; // 잡은 Pinkmong의 ID (필수)

  @IsInt()
  @IsNotEmpty()
  inventory_id: number; // 관련된 인벤토리 ID (필수)
}
