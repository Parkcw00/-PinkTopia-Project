import { ChattingRoom } from '../../chattingroom/entities/chattingroom.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'chatblacklist',
})
export class Chatblacklist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChattingRoom, (chattingRoom) => chattingRoom.chatblacklist, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatting_room_id' })
  chattingRoom: ChattingRoom;
  @Column()
  chatting_room_id: number;

  @ManyToOne(() => User, (user) => user.chatblacklist)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: number;
}
