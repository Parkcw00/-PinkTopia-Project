import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { InventoryService } from 'src/inventory/inventory.service';
import { ValkeyService } from 'src/valkey/valkey.service';

@Injectable()
export class UserService {
  logOutUsers: { [key: number]: boolean } = {};

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly inventoryService: InventoryService,
    private readonly valkeyService: ValkeyService, // ✅ Valkey 서비스 추가
  ) {}

  // 🔹 컬렉션 포인트 랭킹 조회 (Valkey 적용)
  async getRanking() {
    const cacheKey = 'ranking:collection_point';

    // Valkey에서 먼저 조회
    const cachedData = await this.valkeyService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Valkey에 데이터가 없으면 DB에서 조회 후 캐싱
    const rankingData = await this.userRepository.findUsersByCollectionPoint();
    await this.valkeyService.set(cacheKey, rankingData, 300); // 5분 캐싱

    return rankingData;
  }

  // 🔹 업적 랭킹 조회 (Valkey 적용)
  async getRankingAchievement() {
    const cacheKey = 'ranking:achievement';

    // Valkey에서 먼저 조회
    const cachedData = await this.valkeyService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Valkey에 데이터가 없으면 DB에서 조회 후 캐싱
    const rankingData = await this.userRepository.findUsersByAchievement();
    await this.valkeyService.set(cacheKey, rankingData, 300); // 5분 캐싱

    return rankingData;
  }

  // 회원가입
  async signUp(createUserDto: CreateUserDto) {
    const { nickname, email, password, confirmedPassword, birthday } =
      createUserDto;

    if (password !== confirmedPassword) {
      throw new BadRequestException('입력한 비밀번호가 일치하지 않습니다.');
    }

    const existNickname = await this.userRepository.findNickname(nickname);
    if (existNickname) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    const existEmail = await this.userRepository.findEmail(email);
    if (existEmail) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(password, Number(saltRounds));

    try {
      const user = await this.userRepository.signUp(
        nickname,
        email,
        hashedPassword,
        birthday,
      );

      await this.inventoryService.createInventory({
        user_id: user.id,
      });
    } catch (err) {
      throw new InternalServerErrorException(
        '유저 정보 저장 중 오류가 발생하였습니다.',
      );
    }
  }

  // 이메일 인증 코드 전송
  async sendCode(email: string, password: string) {
    if (!email) {
      throw new BadRequestException('이메일을 입력해 주세요');
    }
    if (!password) {
      throw new BadRequestException('비밀번호를 입력해 주세요');
    }

    const existEmail = await this.userRepository.findEmail(email);
    if (!existEmail) {
      throw new BadRequestException('존재하는지 않는 이메일입니다.');
    }

    const isPasswordMatched = bcrypt.compareSync(password, existEmail.password);
    if (!isPasswordMatched) {
      throw new BadRequestException('일치하지 않는 사용자입니다.');
    }

    if (existEmail.email_verify === true) {
      throw new BadRequestException('이미 인증을 완료한 사용자입니다.');
    }

    try {
      const verificationCode = await this.sendVerificationCode(email);
      await this.userRepository.updateVerificationCode(email, verificationCode);
      return { message: `${email}로 인증코드를 발송하였습니다.` };
    } catch (err) {
      throw new InternalServerErrorException(
        '이메일 전송 중 오류가 발생하였습니다.',
      );
    }
  }

  // 이메일 인증
  async verifyCode(email: string, verificationCode: string) {
    if (!email) {
      throw new BadRequestException('이메일을 입력해 주세요');
    }
    if (!verificationCode) {
      throw new BadRequestException('인증코드를 입력해 주세요');
    }
    const existEmail = await this.userRepository.findEmail(email);
    if (!existEmail) {
      throw new BadRequestException('존재하는지 않는 이메일입니다.');
    }
    if (existEmail.email_verify === true) {
      throw new BadRequestException('이미 인증을 완료한 사용자입니다.');
    }
    if (existEmail.verification_code !== verificationCode) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }

    try {
      await this.userRepository.successVerification(email);
      return { message: `이메일 인증 성공. 가입이 완료되었습니다.` };
    } catch (err) {
      throw new InternalServerErrorException(
        '이메일 인증 중 오류가 발생하였습니다.',
      );
    }
  }

  // 로그인 // 너무길어져서 추후에 토큰부여 다른 메서드에서 사용하면 분리예정
  async logIn(email: string, password: string, @Res() res: Response) {
    if (!email) {
      throw new BadRequestException('이메일을 입력해 주세요');
    }
    if (!password) {
      throw new BadRequestException('비밀번호를 입력해 주세요');
    }

    // 1️⃣ 🔹 DB에서 유저 정보 조회
    const existEmail = await this.userRepository.findEmail(email);
    if (!existEmail) {
      throw new BadRequestException('존재하는지 않는 이메일입니다.');
    }

    if (existEmail.email_verify === false) {
      throw new BadRequestException('이메일 인증을 진행해 주세요');
    }

    const isPasswordMatched = bcrypt.compareSync(password, existEmail.password);
    if (!isPasswordMatched) {
      throw new BadRequestException('비밀번호가 틀렸습니다.');
    }

    // 2️⃣ 🔹 JWT Payload 생성
    const payload = {
      id: existEmail.id,
      email: existEmail.email,
      role: existEmail.role,
    };
    let accessTokenExpiresIn = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRES_IN',
    );
    let refreshTokenExpiresIn = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
    );
    if (!accessTokenExpiresIn || !refreshTokenExpiresIn) {
      console.log('token 환경 변수가 설정되지 않았습니다.');
      throw new InternalServerErrorException('관리자에게 문의해 주세요');
    }

    // 3️⃣ 🔹 Access Token & Refresh Token 생성
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: accessTokenExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: refreshTokenExpiresIn,
    });
    refreshTokenExpiresIn = refreshTokenExpiresIn.slice(
      0,
      refreshTokenExpiresIn.length - 1,
    );

    // 4️⃣ 🔹 HTTP 응답 헤더 및 쿠키 설정
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * +refreshTokenExpiresIn,
      httpOnly: true,
    });
    if (this.logOutUsers[existEmail.id]) {
      delete this.logOutUsers[existEmail.id];
    }

    // 5️⃣ 🔹 Valkey(발키)에 유저 정보 저장 (12시간 후 자동 삭제)
    const cacheKey = `user:${existEmail.email}`;
    const userData = {
      id: existEmail.id,
      email: existEmail.email,
      nickname: existEmail.nickname,
      profile_image: existEmail.profile_image,
      collection_point: existEmail.collection_point,
      pink_gem: existEmail.pink_gem,
      pink_dia: existEmail.pink_dia,
      role: existEmail.role,
    };

    await this.valkeyService.set(cacheKey, userData, 60 * 60 * 12); // 12시간 (초 단위)

    return res.status(200).json({ message: '로그인이 되었습니다.' });
  }

  // 로그아웃
  async logOut(user: any, @Res() res: Response) {
    const accessToken = this.jwtService.sign(user, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: '0m',
    });
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.clearCookie('refreshToken');

    // 🔹 Valkey에서 해당 유저 정보 삭제 (DB는 건드리지 않음)
    const cacheKey = `user:${user.email}`;
    await this.valkeyService.del(cacheKey);

    this.logOutUsers[user.id] = true;
    return res.status(200).json({ message: '로그아웃이 되었습니다.' });
  }

  // 유저 조회
  async getUserInfo(id: number) {
    if (isNaN(id) == true) {
      throw new BadRequestException('userId값에는 숫자를 넣어주세요');
    }
    const userInfo = await this.userRepository.findId(id);
    if (!userInfo) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    try {
      const filteredInfo = {
        email: userInfo.email,
        nickname: userInfo.nickname,
        profile_image: userInfo.profile_image,
        collection_point: userInfo.collection_point,
      };
      return filteredInfo;
    } catch (err) {
      throw new BadRequestException('유저 조회중 오류가 발생하였습니다.');
    }
  }

  // 내 정보 조회
  async getMyInfo(user: any) {
    let myInfo = await this.userRepository.findEmail(user.email);

    if (!myInfo) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }
    try {
      const filteredInfo = {
        email: myInfo.email,
        nickname: myInfo.nickname,
        profile_image: myInfo.profile_image,
        collection_point: myInfo.collection_point,
        pink_gem: myInfo.pink_gem,
        pink_dia: myInfo.pink_dia,
        appearance: myInfo.appearance,
        birthday: myInfo.birthday,
      };
      return filteredInfo;
    } catch (err) {
      throw new BadRequestException('내 정보 조회중 오류가 발생하였습니다.');
    }
  }

  // 내 정보 수정
  async updateMyInfo(user: any, updateUserDto: UpdateUserDto) {
    const { nickname, password, profile_image, birthday } = updateUserDto;
    if (!nickname && !password && !profile_image && !birthday) {
      throw new BadRequestException('수정을 원하는 값을 한개 이상 넣어주세요.');
    }

    if (nickname) {
      const existNickname = await this.userRepository.findNickname(nickname);
      if (existNickname) {
        throw new BadRequestException('이미 존재하는 닉네임입니다.');
      }
    }

    let hashedPassword: string = '';
    if (password) {
      const saltRounds =
        this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
      hashedPassword = await bcrypt.hash(password, Number(saltRounds));
    }

    try {
      await this.userRepository.updateMyInfo(
        user.email,
        nickname,
        hashedPassword,
        profile_image,
        birthday,
      );
      return { message: '회원 정보가 수정되었습니다.' };
    } catch (err) {
      throw new BadRequestException('정보 수정 중 오류가 발생하였습니다.');
    }
  }

  // 회원 탈퇴
  async deleteMe(user: any) {
    try {
      await this.userRepository.deleteUser(user.email);
      return { message: '회원 탈퇴되었습니다.' };
    } catch (err) {
      throw new BadRequestException('회원 탈퇴 중 오류가 발생하였습니다.');
    }
  }

  // 인증 코드 메일 보내는 메서드
  private async sendVerificationCode(email: string) {
    const EMAIL_SERVICE = this.configService.get<string>('EMAIL_SERVICE');
    const NODEMAILER_USER = this.configService.get<string>('NODEMAILER_USER');
    const NODEMAILER_PASS = this.configService.get<string>('NODEMAILER_PASS');
    const transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS,
      },
    });

    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    characters = characters + characters.slice(26).repeat(2);
    let verificationCode = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      verificationCode += characters[randomIndex];
    }

    const mailOptions = {
      from: NODEMAILER_USER,
      to: email,
      subject: '이메일 인증을 완료해주세요',
      html: `<h1>인증 코드는 <strong>${verificationCode}</strong> 입니다.</h1>`,
    };
    await transporter.sendMail(mailOptions);

    return verificationCode;
  }
}
