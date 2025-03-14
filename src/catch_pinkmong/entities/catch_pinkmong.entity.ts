import { Inventory } from '../../inventory/entities/inventory.entity';
import { PinkmongAppearLocation } from '../../pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { Pinkmong } from '../../pinkmong/entities/pinkmong.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({
  name: 'catchPinkmong',
})
export class CatchPinkmong {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정(숫자타입)

  @ManyToOne(() => User, (user) => user.catch_pinkmong, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ type: 'int', nullable: false })
  user_id: number;

  @ManyToOne(() => Pinkmong, (pinkmong) => pinkmong.catch_pinkmong, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pinkmong_id' })
  pinkmong: Pinkmong;

  @Column({ type: 'int', nullable: false })
  pinkmong_id: number;

  @OneToOne(() => Inventory, (inventory) => inventory.catch_pinkmong, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;
  @Column({ type: 'int', nullable: false })
  inventory_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;

  @Column({ type: 'varchar', nullable: false })
  latitude: string;

  @Column({ type: 'varchar', nullable: false })
  longitude: string;

  @ManyToOne(
    () => PinkmongAppearLocation,
    (pinkmongAppearLocation) => pinkmongAppearLocation.catchPinkmong,
    {},
  )
  @JoinColumn({ name: 'pinkmongAppearLocation_id' })
  pinkmongAppearLocation: PinkmongAppearLocation;

  @Column({ type: 'int', nullable: false })
  pinkmongAppearLocation_id: number;
}
