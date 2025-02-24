import { User } from 'src/user/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'location_history' })
export class LocationHistory {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'timestamp', nullable: false })
  timestamp: Date;

  @OneToOne(() => User, (user) => user.locationHistory)
  user: User;
  @Column({ type: 'int', nullable: false })
  user_id: number;
}
