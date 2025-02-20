import { Chatblacklist } from 'src/chatblacklist/entities/chatblacklist.entity';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { Chatting } from 'src/chatting/entities/chatting.entity';
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
