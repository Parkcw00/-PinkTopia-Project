import { Inventory } from 'src/inventory/entities/inventory.entity';
import { StoreItem } from 'src/store-item/entities/store-item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'item' })
@Unique(['inventory_id', 'store_item_id'])
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, default: 1 })
  count: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.item, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;
  @Column({ type: 'int', nullable: false })
  inventory_id: number;

  @ManyToOne(() => StoreItem, (store_item) => store_item.item, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_item_id' })
  store_item: StoreItem;
  @Column({ type: 'int', nullable: false })
  store_item_id: number;
}
