import { CatchPinkmong } from '../../catch_pinkmong/entities/catch_pinkmong.entity';
import { Collection } from '../../collection/entities/collection.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

@Entity({
  name: 'pinkmong',
})
export class Pinkmong {
  @PrimaryGeneratedColumn()
  id: number;

  /** 핑크몽 이름 */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** 핑크몽 이미지 URL */
  @Column({ type: 'varchar', length: 255 })
  pinkmong_image: string;

  /** 핑크몽 설명 (긴 텍스트) */
  @Column({ type: 'text' })
  explain: string;

  /** 지역 테마 (ENUM) */
  @Column({
    type: 'enum',
    enum: ['forest', 'desert', 'ocean', 'mountain', 'city'],
  })
  region_theme: string;

  /** 핑크몽 등급 (ENUM) */
  @Column({ type: 'enum', enum: ['common', 'rare', 'epic', 'legendary'] })
  grade: string;

  /** 핑크몽 포인트 */
  @Column({ type: 'int', default: 0 })
  point: number;

  /** 생성된 날짜 (자동 설정) */
  @CreateDateColumn()
  created_at: Date;

  /** 수정된 날짜 (자동 업데이트) */
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => CatchPinkmong, (catch_pinkmong) => catch_pinkmong.pinkmong)
  catch_pinkmong: CatchPinkmong[];

  @OneToMany(() => Collection, (collection) => collection.pinkmong)
  collection: Collection[];
}
