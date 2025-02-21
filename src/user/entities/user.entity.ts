import { AchievementC } from 'src/achievement-c/entities/achievement-c.entity';
import { AchievementP } from 'src/achievement-p/entities/achievement-p.entity';
import { CatchPinkmong } from 'src/catch_pinkmong/entities/catch_pinkmong.entity';
import { Chatting } from 'src/chatting/entities/chatting.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chatblacklist } from 'src/chatblacklist/entities/chatblacklist.entity';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { LocationHistory } from 'src/location-history/entities/location-history.entity';

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

  @Column({ type: 'varchar', nullable: true })
  profile_image: string;

  @Column({ type: 'boolean', default: false })
  email_verify: boolean;

  @Column({ type: 'varchar', nullable: true })
  verification_code: string;

  @Column({ type: 'int', default: 0 })
  collection_point: number;

  @Column({ type: 'int', default: 0 })
  pink_gem: number;

  @Column({ type: 'int', default: 0 })
  pink_dia: number;

  @Column({ type: 'boolean', default: false })
  role: boolean;

  @Column({ type: 'int', default: 0 })
  appearance: number;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => Chatting, (chatting) => chatting.user)
  chatting: Chatting[];

  @OneToMany(() => AchievementC, (achievement_c) => achievement_c.user)
  achievement_c: AchievementC[];

  @OneToMany(() => AchievementP, (achievement_p) => achievement_p.user)
  achievement_p: AchievementP[];

  @OneToMany(() => Collection, (collection) => collection.user)
  collection: Collection[];

  @OneToMany(() => CatchPinkmong, (catch_pinkmong) => catch_pinkmong.user)
  catch_pinkmong: CatchPinkmong[];

  @OneToOne(() => Inventory, (inventory) => inventory.user)
  inventory: Inventory;

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany(() => Chatmember, (chatmember) => chatmember.user)
  chatmember: Chatmember[];

  @OneToMany(() => Chatblacklist, (chatblacklist) => chatblacklist.user)
  chatblacklist: Chatblacklist[];

  @OneToMany(() => LocationHistory, (locationHistory) => locationHistory.user)
  locationHistory: LocationHistory[];
}
