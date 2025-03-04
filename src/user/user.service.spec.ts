import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InventoryService } from '../inventory/inventory.service';
import { ValkeyService } from '../valkey/valkey.service';
import { S3Service } from '../s3/s3.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateResult } from 'typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

// bcrypt.hash 모킹
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compareSync: jest.fn().mockReturnValue(true),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let inventoryService: jest.Mocked<InventoryService>;
  let valkeyService: jest.Mocked<ValkeyService>;
  let s3Service: jest.Mocked<S3Service>;

  const mockUserRepository = {
    findUsersByCollectionPoint: jest.fn(),
    findUsersByAchievement: jest.fn(),
    updateMyInfo: jest.fn(),
    findEmail: jest.fn(),
    findNickname: jest.fn(),
    findId: jest.fn(),
    signUp: jest.fn(),
    updateVerificationCode: jest.fn(),
    successVerification: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      const config = {
        BCRYPT_SALT_ROUNDS: 10,
        ACCESS_TOKEN_SECRET_KEY: 'access_secret',
        REFRESH_TOKEN_SECRET_KEY: 'refresh_secret',
        ACCESS_TOKEN_EXPIRES_IN: '15m',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        EMAIL_SERVICE: 'gmail',
        NODEMAILER_USER: 'test@gmail.com',
        NODEMAILER_PASS: 'password',
      };
      return config[key];
    }),
  };

  const mockInventoryService = {
    createInventory: jest.fn(),
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: ValkeyService, useValue: mockValkeyService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository) as jest.Mocked<UserRepository>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    inventoryService = module.get(
      InventoryService,
    ) as jest.Mocked<InventoryService>;
    valkeyService = module.get(ValkeyService) as jest.Mocked<ValkeyService>;
    s3Service = module.get(S3Service) as jest.Mocked<S3Service>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRanking', () => {
    it('캐시에서 랭킹 데이터를 가져와야 함', async () => {
      const cachedData = [{ nickname: 'user1', collection_point: 100 }];
      valkeyService.get.mockResolvedValue(cachedData);

      const result = await service.getRanking();

      expect(valkeyService.get).toHaveBeenCalledWith(
        'ranking:collection_point',
      );
      expect(userRepository.findUsersByCollectionPoint).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('캐시에 데이터가 없으면 DB에서 랭킹 데이터를 가져와야 함', async () => {
      const rankingData = [{ nickname: 'user1', collection_point: 100 }];
      valkeyService.get.mockResolvedValue(null);
      userRepository.findUsersByCollectionPoint.mockResolvedValue(rankingData);

      const result = await service.getRanking();

      expect(valkeyService.get).toHaveBeenCalledWith(
        'ranking:collection_point',
      );
      expect(userRepository.findUsersByCollectionPoint).toHaveBeenCalled();
      expect(valkeyService.set).toHaveBeenCalledWith(
        'ranking:collection_point',
        rankingData,
        90,
      );
      expect(result).toEqual(rankingData);
    });
  });

  describe('getRankingAchievement', () => {
    it('캐시에서 업적 랭킹 데이터를 가져와야 함', async () => {
      const cachedData = [{ nickname: 'user1', achievementCount: 5 }];
      valkeyService.get.mockResolvedValue(cachedData);

      const result = await service.getRankingAchievement();

      expect(valkeyService.get).toHaveBeenCalledWith('ranking:achievement');
      expect(userRepository.findUsersByAchievement).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('캐시에 데이터가 없으면 DB에서 업적 랭킹 데이터를 가져와야 함', async () => {
      const rankingData = [{ nickname: 'user1', achievementCount: 5 }];
      valkeyService.get.mockResolvedValue(null);
      userRepository.findUsersByAchievement.mockResolvedValue(rankingData);

      const result = await service.getRankingAchievement();

      expect(valkeyService.get).toHaveBeenCalledWith('ranking:achievement');
      expect(userRepository.findUsersByAchievement).toHaveBeenCalled();
      expect(valkeyService.set).toHaveBeenCalledWith(
        'ranking:achievement',
        rankingData,
        90,
      );
      expect(result).toEqual(rankingData);
    });
  });

  describe('uploadProfileImage', () => {
    it('프로필 이미지를 성공적으로 업로드해야 함', async () => {
      const user = { email: 'test@example.com' };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const imageUrl = 'https://example.com/image.jpg';

      s3Service.uploadFile.mockResolvedValue(imageUrl);
      userRepository.updateMyInfo.mockResolvedValue({} as UpdateResult);

      const result = await service.uploadProfileImage(user, file);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(file);
      expect(userRepository.updateMyInfo).toHaveBeenCalledWith(
        user.email,
        undefined,
        undefined,
        imageUrl,
      );
      expect(result).toEqual({
        message: '프로필 이미지가 업로드되었습니다.',
        imageUrl,
      });
    });

    it('파일이 없으면 BadRequestException을 던져야 함', async () => {
      const user = { email: 'test@example.com' };
      const file = null as unknown as Express.Multer.File;

      await expect(service.uploadProfileImage(user, file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteProfileImage', () => {
    it('프로필 이미지를 성공적으로 삭제해야 함', async () => {
      const user = { email: 'test@example.com' };
      const existingUser = {
        email: 'test@example.com',
        profile_image: 'https://example.com/image.jpg',
      } as User;

      userRepository.findEmail.mockResolvedValue(existingUser);
      s3Service.deleteFile.mockResolvedValue(undefined);
      userRepository.updateMyInfo.mockResolvedValue({} as UpdateResult);

      const result = await service.deleteProfileImage(user);

      expect(userRepository.findEmail).toHaveBeenCalledWith(user.email);
      expect(s3Service.deleteFile).toHaveBeenCalledWith('image.jpg');
      expect(userRepository.updateMyInfo).toHaveBeenCalledWith(
        user.email,
        undefined,
        undefined,
        '',
      );
      expect(result).toEqual({ message: '프로필 이미지가 삭제되었습니다.' });
    });
  });

  describe('signUp', () => {
    it('회원가입을 성공적으로 완료해야 함', async () => {
      const createUserDto: CreateUserDto = {
        nickname: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmedPassword: 'password123',
      };

      userRepository.findNickname.mockResolvedValue(null);
      userRepository.findEmail.mockResolvedValue(null);
      userRepository.signUp.mockResolvedValue({ id: 1 } as User);
      inventoryService.createInventory.mockResolvedValue({} as Inventory);

      await service.signUp(createUserDto);

      expect(userRepository.findNickname).toHaveBeenCalledWith(
        createUserDto.nickname,
      );
      expect(userRepository.findEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.signUp).toHaveBeenCalledWith(
        createUserDto.nickname,
        createUserDto.email,
        'hashedPassword',
        createUserDto.birthday,
      );
      expect(inventoryService.createInventory).toHaveBeenCalledWith({
        user_id: 1,
      });
    });
  });

  describe('sendCode', () => {
    it('인증 코드를 성공적으로 전송해야 함', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const existingUser = {
        email,
        password: 'hashedPassword',
        email_verify: false,
      } as unknown as User;

      userRepository.findEmail.mockResolvedValue(existingUser);
      jest
        .spyOn(service as any, 'sendVerificationCode')
        .mockResolvedValue('CODE123');
      userRepository.updateVerificationCode.mockResolvedValue(
        {} as UpdateResult,
      );

      const result = await service.sendCode(email, password);

      expect(userRepository.findEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        password,
        existingUser.password,
      );
      expect(service['sendVerificationCode']).toHaveBeenCalledWith(email);
      expect(userRepository.updateVerificationCode).toHaveBeenCalledWith(
        email,
        'CODE123',
      );
      expect(result).toEqual({
        message: `${email}로 인증코드를 발송하였습니다.`,
      });
    });
  });

  describe('verifyCode', () => {
    it('인증 코드를 성공적으로 검증해야 함', async () => {
      const email = 'test@example.com';
      const verificationCode = 'CODE123';
      const existingUser = {
        email,
        email_verify: false,
        verification_code: 'CODE123',
      } as unknown as User;

      userRepository.findEmail.mockResolvedValue(existingUser);
      userRepository.successVerification.mockResolvedValue({} as UpdateResult);

      const result = await service.verifyCode(email, verificationCode);

      expect(userRepository.findEmail).toHaveBeenCalledWith(email);
      expect(userRepository.successVerification).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        message: '이메일 인증 성공. 가입이 완료되었습니다.',
      });
    });
  });

  describe('logIn', () => {
    it('로그인을 성공적으로 완료해야 함', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const existingUser = {
        id: 1,
        email,
        password: 'hashedPassword',
        email_verify: true,
        role: false, // boolean 타입으로 수정
        nickname: 'testuser',
        profile_image: 'image.jpg',
        collection_point: 100,
        pink_gem: 50,
        pink_dia: 20,
        verification_code: '',
        appearance: 0, // number 타입으로 수정
        birthday: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        chatting: [],
        achievement_c: [],
        achievement_p: [],
        collection: [],
        catch_pinkmong: [],
        inventory: null,
        post: [],
        comment: [],
        chatmember: [],
      } as unknown as User;

      userRepository.findEmail.mockResolvedValue(existingUser);
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      await service.logIn(email, password, mockResponse as any);

      expect(userRepository.findEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        password,
        existingUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Authorization',
        'Bearer accessToken',
      );
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(valkeyService.set).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '로그인이 되었습니다.',
      });
    });
  });

  describe('logOut', () => {
    it('로그아웃을 성공적으로 완료해야 함', async () => {
      const user = { id: 1, email: 'test@example.com', role: false }; // boolean 타입으로 수정

      await service.logOut(user, mockResponse as any);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(valkeyService.del).toHaveBeenCalledWith(`user:${user.email}`);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '로그아웃이 되었습니다.',
      });
    });
  });

  describe('getUserInfo', () => {
    it('유저 정보를 성공적으로 조회해야 함', async () => {
      const userId = 1;
      const userInfo = {
        id: userId,
        email: 'test@example.com',
        nickname: 'testuser',
        profile_image: 'image.jpg',
        collection_point: 100,
        pink_gem: 50,
        pink_dia: 20,
      } as unknown as User;

      userRepository.findId.mockResolvedValue(userInfo);

      const result = await service.getUserInfo(userId);

      expect(userRepository.findId).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        email: userInfo.email,
        nickname: userInfo.nickname,
        profile_image: userInfo.profile_image,
        collection_point: userInfo.collection_point,
      });
    });
  });

  describe('getMyInfo', () => {
    it('내 정보를 성공적으로 조회해야 함', async () => {
      const user = { email: 'test@example.com' };
      const userInfo = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        profile_image: 'image.jpg',
        collection_point: 100,
        pink_gem: 50,
        pink_dia: 20,
        appearance: 0, // number 타입으로 수정
        birthday: new Date('2000-01-01'), // Date 객체로 수정
      } as unknown as User;

      userRepository.findEmail.mockResolvedValue(userInfo);

      const result = await service.getMyInfo(user);

      expect(userRepository.findEmail).toHaveBeenCalledWith(user.email);
      expect(result).toEqual({
        id: userInfo.id,
        email: userInfo.email,
        nickname: userInfo.nickname,
        profile_image: userInfo.profile_image,
        collection_point: userInfo.collection_point,
        pink_gem: userInfo.pink_gem,
        pink_dia: userInfo.pink_dia,
        appearance: userInfo.appearance,
        birthday: userInfo.birthday,
      });
    });
  });

  describe('updateMyInfo', () => {
    it('내 정보를 성공적으로 수정해야 함', async () => {
      const user = { email: 'test@example.com' };
      const updateUserDto: UpdateUserDto = {
        nickname: 'updatedNickname',
      };

      userRepository.findNickname.mockResolvedValue(null);
      userRepository.updateMyInfo.mockResolvedValue({} as UpdateResult);

      const result = await service.updateMyInfo(user, updateUserDto);

      expect(userRepository.findNickname).toHaveBeenCalledWith(
        updateUserDto.nickname,
      );
      expect(userRepository.updateMyInfo).toHaveBeenCalledWith(
        user.email,
        updateUserDto.nickname,
        '',
        undefined,
        undefined,
      );
      expect(result).toEqual({ message: '회원 정보가 수정되었습니다.' });
    });

    it('비밀번호를 성공적으로 수정해야 함', async () => {
      const user = { email: 'test@example.com' };
      const updateUserDto: UpdateUserDto = {
        password: 'newPassword123',
      };

      userRepository.updateMyInfo.mockResolvedValue({} as UpdateResult);

      const result = await service.updateMyInfo(user, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
      expect(userRepository.updateMyInfo).toHaveBeenCalledWith(
        user.email,
        undefined,
        'hashedPassword',
        undefined,
        undefined,
      );
      expect(result).toEqual({ message: '회원 정보가 수정되었습니다.' });
    });
  });

  describe('deleteMe', () => {
    it('회원 탈퇴를 성공적으로 완료해야 함', async () => {
      const user = { email: 'test@example.com' };

      userRepository.deleteUser.mockResolvedValue({} as UpdateResult);

      const result = await service.deleteMe(user);

      expect(userRepository.deleteUser).toHaveBeenCalledWith(user.email);
      expect(result).toEqual({ message: '회원 탈퇴되었습니다.' });
    });
  });

  describe('findByEmail', () => {
    it('이메일로 사용자를 성공적으로 찾아야 함', async () => {
      const email = 'test@example.com';
      const user = {
        id: 1,
        email,
        nickname: 'testuser',
      } as unknown as User;

      userRepository.findEmail.mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(userRepository.findEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('ID로 사용자를 성공적으로 찾아야 함', async () => {
      const userId = 1;
      const user = {
        id: userId,
        email: 'test@example.com',
        nickname: 'testuser',
      } as unknown as User;

      userRepository.findId.mockResolvedValue(user);

      const result = await service.findById(userId);

      expect(userRepository.findId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });
  });
});
