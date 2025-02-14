import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({
  name: 'collection',
})
export class Collection {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정(숫자타입)

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Pinkmong, (pinkmong) => pinkmong.collection)
  @JoinColumn({ name: 'pinkmong_id' })
  pinkmong: Pinkmong;

  @Column({ type: 'int', nullable: false })
  pinkmong_id: number;

  @ManyToOne(() => User, (user) => user.collection)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  user_id: number;
}
