import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { InquiryType } from '../dto/create-inquiry.dto';

@Entity()
export class Inquiry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: InquiryType,
    default: InquiryType.OTHER
  })
  type: InquiryType;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  orderId: number;

  @Column({ nullable: true })
  paymentKey: string;

  @Column({ nullable: true })
  refundReason: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed'],
    default: 'pending'
  })
  status: string;

  @Column({ nullable: true })
  answer: string;

  @Column({ nullable: true })
  answeredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 