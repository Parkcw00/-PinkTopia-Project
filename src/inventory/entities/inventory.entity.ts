import { CatchPinkmong } from 'src/catch_pinkmong/entities/catch_pinkmong.entity';
import { Item } from 'src/item/entities/item.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'inventories' })
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.inventory)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ type: 'int', nullable: false })
  user_id: number;

  @OneToOne(() => CatchPinkmong, (catch_pinkmong) => catch_pinkmong.inventory)
  catch_pinkmong: CatchPinkmong;

  @OneToMany(() => Item, (item) => item.inventory) // 카드 엔티티와 1:n 관계 설정
  item: Item[];
}
