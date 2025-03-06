import { CatchPinkmong } from '../../catch_pinkmong/entities/catch_pinkmong.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'pinkmongAppearLocation',
})
export class PinkmongAppearLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: false,
    default: 0,
  })
  latitude: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: false,
    default: 0,
  })
  longitude: number;

  @Column({
    type: 'enum',
    enum: ['forest', 'desert', 'ocean', 'mountain', 'city'],
  })
  region_theme: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;

  @OneToMany(
    () => CatchPinkmong,
    (catchPinkmong) => catchPinkmong.pinkmongAppearLocation,
  )
  catchPinkmong: CatchPinkmong[];
}

export enum RegionTheme {
  FOREST = 'forest',
  DESERT = 'desert',
  OCEAN = 'ocean',
  MOUNTAIN = 'mountain',
  CITY = 'city',
}
