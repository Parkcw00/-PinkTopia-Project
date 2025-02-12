import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({
  name: 'catchPinkmong',
})
export class CreateCollectionDto {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정(숫자타입)

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string; // 핑크몽 이름

  @Column({ type: 'text', nullable: true })
  explanation: string; // 핑크몽 설명

  @Column({ type: 'boolean', default: false })
  grade: boolean; // 등급 (일반, 희귀, 전설)

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
