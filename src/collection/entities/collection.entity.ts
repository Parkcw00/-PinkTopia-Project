import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({
  name: 'collection',
})
export class Collection {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정(숫자타입)

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string; // 핑크몽 이름

  @Column({ type: 'text', nullable: true })
  explanation: string; // 핑크몽 설명

  @Column({ type: 'varchar', nullable: true })
  type: string; // 예: 핑크몽 속성 (ex. 물, 불 등)

  @Column({ type: 'boolean', default: false })
  grade: boolean; // 등급 (일반, 희귀, 전설)
}
