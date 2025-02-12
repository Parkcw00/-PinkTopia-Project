import { ChattingRoom } from 'src/chattingroom/entities/chattingroom.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'chatmember',
})
export class Chatmember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chatmember)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: number;

  @Column()
  admin: boolean;

  @ManyToOne(() => ChattingRoom, (chattingRoom) => chattingRoom.chatmember)
  @JoinColumn({ name: 'chatting_room_id' })
  chattingRoom: ChattingRoom;
  @Column()
  chatting_room_id: number;
}
