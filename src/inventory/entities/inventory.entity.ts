import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'inventories' })
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;
}
