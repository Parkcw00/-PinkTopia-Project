import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
  name: 'user',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true, length: 15 })
  nickname: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', nullable: true})
  profile_image: string;

  @Column({ type: 'boolean', default: false})
  email_verify: boolean;

  @Column({ type: 'varchar', nullable: true})
  verification_code: string;

  @Column({ type: 'int', default: 0})
  collection_point: number;

  @Column({ type: 'int', default: 0})
  pink_gem: number;

  @Column({ type: 'int', default: 0})
  pink_dia: number;

  @Column({ type: 'boolean', default: false})
  role: boolean;

  @Column({ type: 'int', default: 0})
  appearance: number;

  @Column({ type: 'date', nullable: true})
  birthday: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
