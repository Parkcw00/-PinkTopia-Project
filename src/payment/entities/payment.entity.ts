import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  paymentKey: string;

  @Column()
  itemName: string;

  @Column()
  amount: number;

  @Column({ default: false })
  isRefunded: boolean;

  @Column({ nullable: true })
  diamondBeforePurchase: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;
} 