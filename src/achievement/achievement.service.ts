import { Injectable, NotFoundException,
  BadRequestException,
  ParseIntPipe, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { AchievementRepository } from './achievement.repository';

import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement } from './entities/achievement.entity';

@Injectable()
export class AchievementService {
  constructor(private readonly repository: AchievementRepository,) {}

  // 생성
  async create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
    if (!createAchievementDto) {
      throw new BadRequestException('올바른 데이터를 입력하세요.');
    }
    // title로 검색 -> 겹치나 확인
    const alreadyExists = await this.repository.findByTitle(createAchievementDto.title);

        // 없으면 생성
        if (!alreadyExists) {
          const achievement = this.repository.create(createAchievementDto);
          return this.repository.save(achievement);
      }
  
      throw new NotFoundException(`이미 있는 업적 이름 입니다.`);
  }

  async findAll(): Promise<Achievement[]> {
    const data=await this.repository.findAll();
    if(!data){
      throw new NotFoundException(`등록된 업적이 없습니다.`);
        }
    return data
  }
/*
  async findAllActive(): Promise<Achievement[]> {    
    return this.repository.find();
  }

  async findCategory(category: string): Promise<Achievement[]> {
    return this.repository.find()//({ where: { category } });
  }

  async findOne(id: number): Promise<Achievement> {
    const achievement = await this.repository.findOne({ where: { id } });
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
    return achievement;
  }

  async update(id: number, updateAchievementDto: UpdateAchievementDto): Promise<Achievement> {
    await this.repository.update(id, updateAchievementDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{message:string}> {
    const result = await this.repository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
    return {message:'삭제 성공'}
  }
    */
}
