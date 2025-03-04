import { Test, TestingModule } from '@nestjs/testing';
import { UserController, UsersController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogInDto } from './dto/log-in.dto';
import { VerifyDto } from './dto/verify-dto';
import { UserGuard } from './guards/user-guard';
import { UserRepository } from './user.repository';

describe('UserController', () => {
  let userController: UserController;
  let usersController: UsersController;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    uploadProfileImage: jest.fn(),
    deleteProfileImage: jest.fn(),
    getRanking: jest.fn(),
    getRankingAchievement: jest.fn(),
    signUp: jest.fn(),
    sendCode: jest.fn(),
    verifyCode: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
    getMyInfo: jest.fn(),
    updateMyInfo: jest.fn(),
    deleteMe: jest.fn(),
    getUserInfo: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  const mockUserRepository = {
    findEmail: jest.fn(),
  };

  const mockUserGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController, UsersController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: UserGuard, useValue: mockUserGuard },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue(mockUserGuard)
      .compile();

    userController = module.get<UserController>(UserController);
    usersController = module.get<UsersController>(UsersController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(usersController).toBeDefined();
  });

  describe('uploadProfileImage', () => {
    it('프로필 이미지를 성공적으로 업로드해야 함', async () => {
      const req = { user: { email: 'test@example.com' } };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const expectedResult = {
        message: '프로필 이미지가 업로드되었습니다.',
        imageUrl: 'https://example.com/image.jpg',
      };

      mockUserService.uploadProfileImage.mockResolvedValue(expectedResult);

      const result = await userController.uploadProfileImage(req, file);

      expect(mockUserService.uploadProfileImage).toHaveBeenCalledWith(
        req.user,
        file,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteProfileImage', () => {
    it('프로필 이미지를 성공적으로 삭제해야 함', async () => {
      const req = { user: { email: 'test@example.com' } };
      const expectedResult = { message: '프로필 이미지가 삭제되었습니다.' };

      mockUserService.deleteProfileImage.mockResolvedValue(expectedResult);

      const result = await userController.deleteProfileImage(req);

      expect(mockUserService.deleteProfileImage).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRanking', () => {
    it('포인트 랭킹을 성공적으로 조회해야 함', async () => {
      const rankingData = [{ nickname: 'user1', collection_point: 100 }];
      mockUserService.getRanking.mockResolvedValue(rankingData);

      const result = await userController.getRanking();

      expect(mockUserService.getRanking).toHaveBeenCalled();
      expect(result).toEqual(rankingData);
    });
  });

  describe('getRankingAchievement', () => {
    it('업적 랭킹을 성공적으로 조회해야 함', async () => {
      const rankingData = [{ nickname: 'user1', achievementCount: 5 }];
      mockUserService.getRankingAchievement.mockResolvedValue(rankingData);

      const result = await userController.getRankingAchievement();

      expect(mockUserService.getRankingAchievement).toHaveBeenCalled();
      expect(result).toEqual(rankingData);
    });
  });

  describe('signUp', () => {
    it('회원가입 및 인증코드 전송을 성공적으로 완료해야 함', async () => {
      const createUserDto: CreateUserDto = {
        nickname: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmedPassword: 'password123',
      };
      const expectedResult = {
        message: 'test@example.com로 인증코드를 발송하였습니다.',
      };

      mockUserService.signUp.mockResolvedValue(undefined);
      mockUserService.sendCode.mockResolvedValue(expectedResult);

      const result = await userController.signUp(createUserDto);

      expect(mockUserService.signUp).toHaveBeenCalledWith(createUserDto);
      expect(mockUserService.sendCode).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.password,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('sendCode', () => {
    it('인증코드를 성공적으로 재전송해야 함', async () => {
      const logInDto: LogInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        message: 'test@example.com로 인증코드를 발송하였습니다.',
      };

      mockUserService.sendCode.mockResolvedValue(expectedResult);

      const result = await userController.sendCode(logInDto);

      expect(mockUserService.sendCode).toHaveBeenCalledWith(
        logInDto.email,
        logInDto.password,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifyCode', () => {
    it('인증코드를 성공적으로 검증해야 함', async () => {
      const verifyDto: VerifyDto = {
        email: 'test@example.com',
        verificationCode: 'CODE123',
      };
      const expectedResult = {
        message: '이메일 인증 성공. 가입이 완료되었습니다.',
      };

      mockUserService.verifyCode.mockResolvedValue(expectedResult);

      const result = await userController.verifyCode(verifyDto);

      expect(mockUserService.verifyCode).toHaveBeenCalledWith(
        verifyDto.email,
        verifyDto.verificationCode,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logIn', () => {
    it('로그인을 성공적으로 완료해야 함', async () => {
      const logInDto: LogInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { message: '로그인이 되었습니다.' };

      mockUserService.logIn.mockResolvedValue(expectedResult);

      await userController.logIn(logInDto, mockResponse as any);

      expect(mockUserService.logIn).toHaveBeenCalledWith(
        logInDto.email,
        logInDto.password,
        mockResponse,
      );
    });
  });

  describe('logOut', () => {
    it('로그아웃을 성공적으로 완료해야 함', async () => {
      const req = { user: { email: 'test@example.com' } };
      const expectedResult = { message: '로그아웃이 되었습니다.' };

      mockUserService.logOut.mockResolvedValue(expectedResult);

      await userController.logOut(req, mockResponse as any);

      expect(mockUserService.logOut).toHaveBeenCalledWith(
        req.user,
        mockResponse,
      );
    });
  });

  describe('getMyInfo', () => {
    it('내 정보를 성공적으로 조회해야 함', async () => {
      const req = { user: { email: 'test@example.com' } };
      const expectedResult = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        profile_image: 'image.jpg',
        collection_point: 100,
        pink_gem: 50,
        pink_dia: 20,
      };

      mockUserService.getMyInfo.mockResolvedValue(expectedResult);

      const result = await userController.getMyInfo(req);

      expect(mockUserService.getMyInfo).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateMyInfo', () => {
    it('내 정보를 성공적으로 수정해야 함', async () => {
      const req = { user: { email: 'test@example.com' } };
      const updateUserDto: UpdateUserDto = {
        nickname: 'updatedNickname',
      };
      const expectedResult = { message: '회원 정보가 수정되었습니다.' };

      mockUserService.updateMyInfo.mockResolvedValue(expectedResult);

      const result = await userController.updateMyInfo(req, updateUserDto);

      expect(mockUserService.updateMyInfo).toHaveBeenCalledWith(
        req.user,
        updateUserDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteMe', () => {
    it('회원 탈퇴를 성공적으로 완료해야 함', async () => {
      const req = { user: { email: 'test@example.com' } };
      const expectedResult = { message: '회원 탈퇴되었습니다.' };

      mockUserService.deleteMe.mockResolvedValue(expectedResult);

      const result = await userController.deleteMe(req);

      expect(mockUserService.deleteMe).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserInfo', () => {
    it('유저 정보를 성공적으로 조회해야 함', async () => {
      const userId = 1;
      const expectedResult = {
        email: 'test@example.com',
        nickname: 'testuser',
        profile_image: 'image.jpg',
        collection_point: 100,
      };

      mockUserService.getUserInfo.mockResolvedValue(expectedResult);

      const result = await usersController.getUserInfo(userId);

      expect(mockUserService.getUserInfo).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });
});
