import { Chatblacklist } from 'src/chatblacklist/entities/chatblacklist.entity';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { Chatting } from 'src/chatting/entities/chatting.entity';
import {
  Column,
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

  @Column()
  created_at: Date;

  @Column()
  deleted_at: Date;

  @OneToMany(() => Chatting, (chatting) => chatting.chattingRoom)
  chatting: Chatting[];

  @OneToMany(() => Chatmember, (chatmember) => chatmember.chattingRoom)
  chatmember: Chatmember[];

  @OneToMany(() => Chatblacklist, (chatblacklist) => chatblacklist.chattingRoom)
  chatblacklist: Chatblacklist[];
}
