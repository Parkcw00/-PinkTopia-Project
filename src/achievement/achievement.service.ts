import { Injectable, NotFoundException,
  BadRequestException,
  ParseIntPipe, } from '@nestjs/common';
import { AchievementCategory } from "./enums/achievement-category.enum"; // ENUM 경로 확인
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { format } from 'date-fns'; // npm install date-fns
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository, DeleteResult,MoreThan } from 'typeorm';

import { AchievementRepository } from './achievement.repository';

import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement } from './entities/achievement.entity';
import { fixresArr,fixres } from './utils/format'; 

@Injectable()
export class AchievementService {
  constructor(private readonly repository: AchievementRepository,) {}

  // 생성
  async create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
    console.log("생성 서비스")
    if (!createAchievementDto) {
      throw new BadRequestException('올바른 데이터를 입력하세요.');
    }
    // title로 검색 -> 겹치나 확인
    const alreadyExists = await this.repository.findByTitle(createAchievementDto.title);
    // 있으면 throw
    if (alreadyExists) {
      throw new NotFoundException(`이미 있는 업적 이름 입니다.`);
    }
    console.log("생성 서비스1")
    // 새로운 엔터티 생성
  const { title, category, reward, content, expiration_at } = createAchievementDto;

  // 📌 category 값 Enum 변환
  const validCategory = Object.values(AchievementCategory).includes(category as AchievementCategory) 
      ? category as AchievementCategory 
      : null;

  if (!validCategory) {
      throw new BadRequestException(`잘못된 category 값입니다. (가능한 값: ${Object.values(AchievementCategory).join(', ')})`);
  }

  // 📌 expiration_date를 Date 객체로 변환
  const expirationAt = format(expiration_at, 'yyyy-MM-dd HH:mm:ss');

  const achievement = await this.repository.create({
      title,
      category: validCategory,
      reward,
      content,
      expiration_at: expirationAt
  });

  console.log("생성 서비스2" + {achievement})

  if(!achievement){  
  throw new NotFoundException(`업적 생성 실패`);
}
console.log("생성 서비스3")

  // 데이터베이스에 저장
  const save = await this.repository.save(achievement);
  
  return fixres(save); // ✅ 함수 실행
}


  
  async findAll(): Promise<Achievement[]> {
    const data=await this.repository.findAll();
    if(!data){
      throw new NotFoundException(`등록된 업적이 없습니다.`);
        }
    return data
  }

  async findAllDone(): Promise<Achievement[]> {  
    // 현재 UTC 기준 시간 가져오기
    const now = new Date();  

    // 활성화된 업적 조회
    const data = await this.repository.findAllDone(now);
  
    // 결과가 없을 경우 예외 처리
    if (data.length === 0) {
      throw new NotFoundException('활성화된 업적이 없습니다.');
    }

    return data;
  }

  async findAllActive(): Promise<Achievement[]> {  
    // 현재 UTC 기준 시간 가져오기
    const now = new Date();  

    // 활성화된 업적 조회
    const data = await this.repository.findAllActive(now);
  
    // 결과가 없을 경우 예외 처리
    if (data.length === 0) {
      throw new NotFoundException('활성화된 업적이 없습니다.');
    }

    return data;
  }

  async findCategory(category: string): Promise<Achievement[]> {
// 📌 category 값 Enum 변환
  const validCategory = Object.values(AchievementCategory).includes(category as AchievementCategory) 
      ? category as AchievementCategory 
      : null;

  if (!validCategory) {
      throw new BadRequestException(`잘못된 category 값입니다. (가능한 값: ${Object.values(AchievementCategory).join(', ')})`);
  }


    const data=this.repository.findCategory(validCategory)//({ where: { category } });
    if (!data) {
      throw new NotFoundException(`"${validCategory}" 카테고리에 해당하는 업적이 없습니다.`);
    }
return data


  }

  async findOne(id: string): Promise<{ title: string; subAchievements: SubAchievement[] }>{
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException('achievementId 값이 없거나 형식이 맞지 않습니다');
    }
  // 업적 조회 - 타이틀 가져오기
  const achievement = await this.repository.findOne(idA);
  if (!achievement) {
  throw new NotFoundException(`ID ${id}에 해당하는 업적을 찾을 수 없습니다.`);
  }
  // 서브업적 조회

  const subAchievement = await this.repository.findByAId(idA);
  if (!subAchievement) {
    throw new NotFoundException(`ID ${id}에 해당하는 업적을 찾을 수 없습니다.`);
  }

  return {
          title: achievement.title,
          subAchievements: subAchievement ?? [], // null이면 빈 배열 반환
  };
    
  }

  async update(id: string, updateAchievementDto: UpdateAchievementDto): Promise<[{message:string},Achievement]> {
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException('achievementId 값이 없거나 형식이 맞지 않습니다');
    }
    // id에 따른 데이터가 있는지 확인
    const isExists = await this.repository.findOne(idA)
    if(!isExists){
      throw new NotFoundException(`ID ${id}에 해당하는 업적이 존재하지 않습니다.`);
      }
    if (!updateAchievementDto || Object.keys(updateAchievementDto).length === 0) {
      throw new BadRequestException('수정할 데이터를 입력하세요.');
    }

    await this.repository.update(idA, updateAchievementDto);
    const data = await this.repository.findOne(idA)
    if (!data) {
      throw new NotFoundException(`ID ${id}에 해당하는 업적을 확인인할 수 없습니다.`);
    }
    
    return [{message: '수정 성공'},data]
  }

  async remove(id:string): Promise<{message:string}> {
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException('achievementId 값이 없거나 형식이 맞지 않습니다');
    }

    await this.repository.softDelete(idA);

    const isExists = await this.repository.findOne(idA);
    if(isExists){
      throw new NotFoundException(`삭제 실패`);
    }
    return {message:'삭제 성공'}
  }
    
}
