import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import {  NotFoundException} from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { AchievementCategory } from './enums/achievement-category.enum';
@Injectable()
export class AchievementRepository {  
  softDelete(id: number) {
    throw new Error('Method not implemented.');
  }
  update(id: number, updateAchievementDto: UpdateAchievementDto) {
    throw new Error('Method not implemented.');
  }
  find(): Achievement[] | PromiseLike<Achievement[]> {
    throw new Error('Method not implemented.');
  }
  save(achievement: Promise<Achievement | null>): Achievement | PromiseLike<Achievement> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Achievement)
    private readonly entity: Repository<Achievement>,
  ) {}


  ////////////////////////////////////////////////////////////////////////////////
  // 확인용
  async findByTitle(title:string): Promise<Achievement | null>{
    return await this.entity.findOne({ where: { title } });
  }
  async findOne(id: number): Promise<Achievement | null>{
    return await this.entity.findOne({ where: { id } });
  }

  
  // 생성
  async create(createAchievementDto:CreateAchievementDto): Promise<Achievement | null>{
    return this.entity.create(createAchievementDto)
   }


  // 전체 조회
  async findAll(): Promise<Achievement[]> {
    return await this.entity.find({ order: { created_at: 'DESC' } });
  }
  
  /*
  async findOne(id: number): Promise<Achievement | null>{
    return await this.entity.findOne({ where: { id } });
  }
*/

/*
  async deleteById(id: number): Promise<{message:id + '삭제되되었습니다.'}> {
    await this.entity.delete(id);
    return {message:id + '삭제되되었습니다.'}
  }*/

  async deleteById(id: number): Promise<{ message: string }> {
    const result = await this.entity.delete(id); // 삭제 실행
  
    if (result.affected === 0) {
      throw new NotFoundException(`ID ${id}에 해당하는 업적을 찾을 수 없습니다.`);
    }
  
    return { message: `${id} 삭제되었습니다.` };
  }
  
}
