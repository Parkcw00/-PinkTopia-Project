import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockRepository: any;

  const mockUserData = {
    id: 1,
    nickname: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    profile_image: 'image.jpg',
    email_verify: true,
    verification_code: 'CODE123',
    collection_point: 100,
    pink_gem: 50,
    pink_dia: 20,
    role: false,
    appearance: 0,
    birthday: new Date('2000-01-01'),
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('findUsersByCollectionPoint', () => {
    it('컬렉션 포인트로 정렬된 사용자 목록을 반환해야 함', async () => {
      const users = [
        { nickname: 'user1', collection_point: 100 },
        { nickname: 'user2', collection_point: 50 },
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await userRepository.findUsersByCollectionPoint();

      expect(mockRepository.find).toHaveBeenCalledWith({
        select: ['nickname', 'collection_point'],
        order: {
          collection_point: 'DESC',
        },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findUsersByAchievement', () => {
    it('업적 개수로 정렬된 사용자 목록을 반환해야 함', async () => {
      const users = [
        { nickname: 'user1', achievement_c: [{ id: 1 }, { id: 2 }] },
        { nickname: 'user2', achievement_c: [{ id: 3 }] },
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await userRepository.findUsersByAchievement();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['achievement_c'],
        order: {
          achievement_c: {
            id: 'DESC',
          },
        },
      });
      expect(result).toEqual([
        { nickname: 'user1', achievementCount: 2 },
        { nickname: 'user2', achievementCount: 1 },
      ]);
    });
  });

  describe('findNickname', () => {
    it('닉네임으로 사용자를 찾아야 함', async () => {
      const nickname = 'testuser';
      mockRepository.findOne.mockResolvedValue(mockUserData);

      const result = await userRepository.findNickname(nickname);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { nickname },
      });
      expect(result).toEqual(mockUserData);
    });

    it('존재하지 않는 닉네임일 경우 null을 반환해야 함', async () => {
      const nickname = 'nonexistent';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findNickname(nickname);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { nickname },
      });
      expect(result).toBeNull();
    });
  });

  describe('findEmail', () => {
    it('이메일로 사용자를 찾아야 함', async () => {
      const email = 'test@example.com';
      mockRepository.findOne.mockResolvedValue(mockUserData);

      const result = await userRepository.findEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUserData);
    });

    it('존재하지 않는 이메일일 경우 null을 반환해야 함', async () => {
      const email = 'nonexistent@example.com';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });
  });

  describe('findId', () => {
    it('ID로 사용자를 찾아야 함', async () => {
      const id = 1;
      mockRepository.findOne.mockResolvedValue(mockUserData);

      const result = await userRepository.findId(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockUserData);
    });

    it('존재하지 않는 ID일 경우 null을 반환해야 함', async () => {
      const id = 999;
      mockRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findId(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBeNull();
    });
  });

  describe('signUp', () => {
    it('새로운 사용자를 생성하고 저장해야 함', async () => {
      const nickname = 'newuser';
      const email = 'new@example.com';
      const password = 'hashedPassword';
      const birthday = new Date('2000-01-01');

      const newUser = { nickname, email, password, birthday };
      mockRepository.save.mockResolvedValue({ id: 2, ...newUser });

      const result = await userRepository.signUp(nickname, email, password, birthday);

      expect(mockRepository.save).toHaveBeenCalledWith({
        nickname,
        email,
        password,
        ...(birthday && { birthday }),
      });
      expect(result).toEqual({ id: 2, ...newUser });
    });
  });

  describe('updateMyInfo', () => {
    it('사용자 정보를 업데이트해야 함', async () => {
      const email = 'test@example.com';
      const nickname = 'updatedNickname';
      const password = 'newHashedPassword';
      const profile_image = 'new_image.jpg';
      const birthday = new Date('2001-01-01');

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await userRepository.updateMyInfo(
        email,
        nickname,
        password,
        profile_image,
        birthday,
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        { email },
        {
          nickname,
          password,
          profile_image,
          birthday,
        },
      );
    });

    it('선택적 매개변수만 업데이트해야 함', async () => {
      const email = 'test@example.com';
      const nickname = 'updatedNickname';

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await userRepository.updateMyInfo(email, nickname);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { email },
        { nickname },
      );
    });
  });

  describe('deleteUser', () => {
    it('사용자의 deleted_at 필드를 업데이트해야 함', async () => {
      const email = 'test@example.com';
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await userRepository.deleteUser(email);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { email },
        { deleted_at: expect.any(Date) },
      );
    });
  });

  describe('updateVerificationCode', () => {
    it('사용자의 인증 코드를 업데이트해야 함', async () => {
      const email = 'test@example.com';
      const verificationCode = 'NEW123';
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await userRepository.updateVerificationCode(email, verificationCode);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { email },
        { verification_code: verificationCode },
      );
    });
  });

  describe('successVerification', () => {
    it('사용자의 이메일 인증 상태를 true로 업데이트해야 함', async () => {
      const email = 'test@example.com';
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await userRepository.successVerification(email);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { email },
        { email_verify: true },
      );
    });
  });
});