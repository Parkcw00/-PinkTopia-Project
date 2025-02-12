import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({
  name: 'collection',
})
export class Collection {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정(숫자타입)

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string; // 핑크몽 이름

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
