import { User } from 'src/user/entities/user.entity';
import { ChattingRoom } from 'src/chattingroom/entities/chattingroom.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'chatting',
})
export class Chatting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  image?: string;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.chatting)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: number;

  @ManyToOne(() => ChattingRoom, (chattingRoom) => chattingRoom.chatting)
  @JoinColumn({ name: 'chatting_room_id' })
  chattingRoom: Chatting;
  @Column()
  chatting_room_id: number;
  //관계 설정 해야하는 부분! 채팅룸 id 유저 id 받아오기!
}
