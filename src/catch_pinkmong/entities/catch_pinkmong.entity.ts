import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({
  name: 'catchPinkmong',
})
export class CreateCollectionDto {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정(숫자타입)

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
