import { Chatblacklist } from '../../chatblacklist/entities/chatblacklist.entity';
import { Chatmember } from '../../chatmember/entities/chatmember.entity';
import { Chatting } from '../../chatting/entities/chatting.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'chattingroom',
})
export class ChattingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => Chatting, (chatting) => chatting.chattingRoom)
  chatting: Chatting[];

  @OneToMany(() => Chatmember, (chatmember) => chatmember.chattingRoom)
  chatmember: Chatmember[];

  @OneToMany(() => Chatblacklist, (chatblacklist) => chatblacklist.chattingRoom)
  chatblacklist: Chatblacklist[];
}
