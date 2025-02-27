import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Res,
  NotFoundException,
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  // logOutUsers: { [key: number]: boolean } = {};

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly inventoryService: InventoryService,
    private readonly valkeyService: ValkeyService,
  ) {}

  async getRanking() {
    return await this.userRepository.findUsersByCollectionPoint();
  }

  async getRankingAchievement() {
    return await this.userRepository.findUsersByAchievement();
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
      throw new InternalServerErrorException('관리자에게 문의해 주세요');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: accessTokenExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: refreshTokenExpiresIn,
    });

    const refreshTokenDays = parseInt(refreshTokenExpiresIn.replace('d', ''));

    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.setHeader('Authorization', `Bearer ${accessToken}`);

    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * refreshTokenDays,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: 'localhost',
    });
    // if (this.logOutUsers[existEmail.id]) {
    //   delete this.logOutUsers[existEmail.id];
    // }
    await this.valkeyService.del(`logoutUser:${existEmail.id}`);
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
    // this.logOutUsers[user.id] = true;
    await this.valkeyService.set(`logoutUser:${user.id}`, 'true');
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
        id: myInfo.id,
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

  // 로그인용 이메일로 사용자 찾기 메서드 추가
  async findByEmail(email: string) {
    try {
      const user = await this.userRepository.findEmail(email);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      return user;
    } catch (error) {
      console.error('사용자 조회 중 에러:', error);
      throw error;
    }
  }

  // ID로 사용자 찾기 메서드 추가
  async findById(id: number) {
    try {
      const user = await this.userRepository.findId(id);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      return user;
    } catch (error) {
      console.error('사용자 조회 중 에러:', error);
      throw error;
    }
  }
}
