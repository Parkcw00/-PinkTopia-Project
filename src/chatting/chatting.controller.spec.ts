import { Test, TestingModule } from '@nestjs/testing';
import { ChattingController } from './chatting.controller';
import { ChattingService } from './chatting.service';
import { UserGuard } from '../user/guards/user-guard';
import { ExecutionContext } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// ChattingController의 테스트 그룹 정의
describe('ChattingController', () => {
  let controller: ChattingController;
  let mockService: Partial<ChattingService> = {
    create: jest.fn().mockResolvedValue({}), // 채팅 생성 모킹
    uploadFile: jest.fn().mockResolvedValue({}), // 파일 업로드 모킹
    findAll: jest.fn().mockResolvedValue([]), // 전체 조회 모킹
  };

  const mockUser = { id: 1, username: 'testUser' }; // 테스트용 가짜 유저

  // 각 테스트 실행 전 초기 설정
  beforeEach(async () => {
    // 인증 가드 모킹 (항상 통과)
    const mockGuard: Partial<UserGuard> = {
      canActivate: async (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUser; // 요청에 유저 정보 주입
        return true;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChattingController],
      providers: [
        { provide: ChattingService, useValue: mockService }, // 서비스 모킹
      ],
    })
      .overrideGuard(UserGuard) // 실제 가드 대신 모킹 사용
      .useValue(mockGuard)
      .overrideInterceptor(FileInterceptor('file')) // 파일 인터셉터 모킹
      .useValue({})
      .compile();

    controller = module.get<ChattingController>(ChattingController);
  });

  // POST /chatting 엔드포인트 테스트
  describe('POST /chatting', () => {
    it('채팅 생성 API 호출 성공', async () => {
      const result = await controller.create(
        { user: mockUser } as any, // 가짜 요청 객체
        '1', // 채팅방 ID
        { message: 'test' } as any, // 채팅 데이터
      );
      expect(result).toBeDefined();
      // 서비스 계층의 create 메서드 호출 여부 확인
      expect(mockService.create).toHaveBeenCalledWith(
        mockUser,
        '1',
        expect.anything(),
      );
    });
  });

  // GET /chattings 엔드포인트 테스트
  describe('GET /chattings', () => {
    it('채팅 목록 조회 API 호출 성공', async () => {
      const result = await controller.findAll(
        { user: mockUser } as any, // 가짜 요청 객체
        '1', // 채팅방 ID
      );
      expect(result).toBeInstanceOf(Array); // 배열 반환 확인
    });
  });
});
