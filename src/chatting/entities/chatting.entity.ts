import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  created_at: Date;

  @Column()
  deleted_at: Date;

  //관계 설정 해야하는 부분! 채팅룸 id 유저 id 받아오기!
}
