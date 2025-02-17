import { CatchPinkmong } from 'src/catch_pinkmong/entities/catch_pinkmong.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Pinkmong 엔티티 정의
 *
 * 핑크몽의 기본 정보, 이미지, 위치 정보, 설명, 지역 테마, 등급, 포인트 등을 포함하는 데이터 모델입니다.
 */
@Entity({
  name: 'pinkmong',
})
export class Pinkmong {
  /** 기본 키 (자동 증가) */
  @PrimaryGeneratedColumn()
  id: number;

  /** 핑크몽 이름 */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** 핑크몽 이미지 URL */
  @Column({ type: 'varchar', length: 255 })
  pinkmong_image: string;

  /** 핑크몽 위치 URL (선택 사항) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  location_url?: string;

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

  /** 삭제된 날짜 (소프트 삭제 처리) */
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => CatchPinkmong, (catch_pinkmong) => catch_pinkmong.pinkmong)
  catch_pinkmong: CatchPinkmong[];

  @OneToMany(() => Collection, (collection) => collection.pinkmong)
  collection: Collection[];
}
