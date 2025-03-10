import { Item } from '../../item/entities/item.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'store_item' })
export class StoreItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  item_image: string;

  @Column({ type: 'boolean', nullable: false })
  potion: boolean;

  @Column({ type: 'int', nullable: false })
  potion_time?: number;

  @Column({ type: 'int', nullable: false })
  gem_price: number;

  @Column({ type: 'int', nullable: false })
  dia_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => Item, (item) => item.store_item) 
  item: Item[];
}
