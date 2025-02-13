import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Event 엔티티 정의
 *
 * 이벤트 정보를 저장하는 데이터 모델로, 제목, 내용, 이미지, 생성/수정 날짜 및 만료 날짜를 포함합니다.
 */
@Entity({
  name: 'event',
})
export class Event {
  /** 기본 키 (자동 증가) */
  @PrimaryGeneratedColumn()
  id: number;

  /** 이벤트 제목 (최대 255자) */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /** 이벤트 내용 (긴 텍스트 저장) */
  @Column({ type: 'text' })
  content: string;

  /** 이벤트 이미지 URL (선택 사항) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string;

  /** 생성된 날짜 (자동 설정) */
  @CreateDateColumn()
  created_at: Date;

  /** 수정된 날짜 (자동 업데이트) */
  @UpdateDateColumn()
  updated_at: Date;

  /** 이벤트 만료 날짜 (선택 사항) */
  @Column({ type: 'date', nullable: true })
  expiration_at?: String;

  /** 이벤트 상태 (active: 진행 중, closed: 종료됨) */
  @Column({ type: 'enum', enum: ['active', 'closed'], default: 'active' })
  status: string;
}
