import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementController } from './sub-achievement.controller';
import { SubAchievementService } from './sub-achievement.service';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { AuthGuard } from '@nestjs/passport';

describe('SubAchievementController (e2e)', () => {
  let app: INestApplication;
  const mockService = {
    fillValkey: jest.fn().mockResolvedValue({ message: 'Valkey 저장 성공' }),
    create: jest.fn().mockResolvedValue({ subAchievement: { id: 1, title: '업적' } }),
    findOne: jest.fn().mockResolvedValue({ id: 1, title: '업적' }),
    update: jest.fn().mockResolvedValue([{ message: '업적 수정 성공' }, { id: 1, title: '업적' }]),
    softDelete: jest.fn().mockResolvedValue({ message: '삭제 성공' }),
  };

  // 더미 인증 가드 생성 – 실제 JWT 검증을 우회하여 항상 통과하도록 함
  class DummyAuthGuard {
    canActivate(context: ExecutionContext): boolean {
      return true;
    }
  }

  beforeAll(async () => {
    // 테스트 모듈 구성: 컨트롤러와 모의 서비스 주입
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SubAchievementController],
      providers: [
        { provide: SubAchievementService, useValue: mockService },
      ],
    })
      // AuthGuard('jwt')를 더미 가드로 오버라이드하여 JWT 관련 검증을 우회합니다.
      .overrideGuard(AuthGuard('jwt'))
      .useClass(DummyAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // POST /sub-achievement/fill-valkey 엔드포인트 테스트
  it('POST /sub-achievement/fill-valkey는 Valkey 저장 메시지를 반환해야 합니다.', () => {
    return request(app.getHttpServer())
      .post('/sub-achievement/fill-valkey')
      .expect(201)
      .expect({ message: 'Valkey 저장 성공' });
  });

  // POST /sub-achievement 엔드포인트 테스트 (파일 업로드 등은 단순화)
  it('POST /sub-achievement는 서브업적 생성 후 반환해야 합니다.', () => {
    return request(app.getHttpServer())
      .post('/sub-achievement')
      .send({ title: '업적', achievement_id: 1 })
      .expect(201)
      .expect({ subAchievement: { id: 1, title: '업적' } });
  });

  // GET /sub-achievement/:subAchievementId 엔드포인트 테스트
  it('GET /sub-achievement/1는 단일 업적 데이터를 반환해야 합니다.', () => {
    return request(app.getHttpServer())
      .get('/sub-achievement/1')
      .expect(200)
      .expect({ id: 1, title: '업적' });
  });

  // PATCH /sub-achievement/:subAchievementId 엔드포인트 테스트
  it('PATCH /sub-achievement/1는 업데이트 후 데이터를 반환해야 합니다.', () => {
    return request(app.getHttpServer())
      .patch('/sub-achievement/1')
      .send({ title: '업적 업데이트' })
      .expect(200)
      .expect([{ message: '업적 수정 성공' }, { id: 1, title: '업적' }]);
  });

  // DELETE /sub-achievement/:subAchievementId 엔드포인트 테스트
  it('DELETE /sub-achievement/1는 삭제 성공 메시지를 반환해야 합니다.', () => {
    return request(app.getHttpServer())
      .delete('/sub-achievement/1')
      .expect(200)
      .expect({ message: '삭제 성공' });
  });
});
