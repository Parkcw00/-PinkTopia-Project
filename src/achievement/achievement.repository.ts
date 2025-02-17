import { Injectable } from '@nestjs/common';
import { IsNull,Repository,MoreThan, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { AchievementCategory } from './enums/achievement-category.enum';

@Injectable()
export class AchievementRepository {  
  constructor(
    @InjectRepository(Achievement)
    private readonly entity: Repository<Achievement>,
    @InjectRepository(SubAchievement)
    private readonly subEntity: Repository<SubAchievement>,
  ) {}

  // 하나만 조회
  async findOne(id: number): Promise<Achievement | null>{
    return await this.entity.findOne({ where: { id } });
  }
  
    // 생성
    // 타이틀로로 조회
    async findByTitle(title:string): Promise<Achievement | null>{
      return await this.entity.findOne({ where: { title } });
    }
    // create()는 데이터베이스에 저장하지 않고 단순히 엔터티 인스턴스만 생성
    async create({
      title,
      category: validCategory,
      reward,
      content,
      expiration_at: expiration_at
  }): Promise<Achievement | null>{
      return this.entity.create({
        title,
        category: validCategory,
        reward,
        content,
        expiration_at: expiration_at
    })
    }
    // 반드시 save()를 호출해야 데이터베이스에 저장됨.
  async save(achievement: Achievement): Promise<Achievement> {
    return await this.entity.save(achievement);
  }

  // 연결된 서브업적 가져오기
    async findByAId(id: number): Promise<SubAchievement[] | null> {
    return await this.subEntity.find({ 
      where: { achievement_id: id }, 
      order: { updated_at: 'DESC', created_at: 'DESC' } // 업데이트순 -> 생성순 정렬
    });
  }

  // 전체 조회
  async findAll(): Promise<Achievement[]> {
    return await this.entity.find({ order: { created_at: 'DESC' } });
  }


  // 만료기한 지난 업적
  async findAllDone(date: Date): Promise<Achievement[]> {
    console.log('값이 어디에?')
    return await this.entity.find({ 
      where: { expiration_at: LessThan(date) }, 
      order: { expiration_at: 'ASC' } // 만료일이 가까운 순으로 정렬
    });
  }
  
  // 만료기한 이전의 업적
async findAllActive(date: Date): Promise<Achievement[]> {
  return await this.entity.find({ 
    where: { expiration_at: MoreThan(date) }, 
    order: { expiration_at: 'ASC' } // 만료일이 가까운 순으로 정렬
  });
}

// 카테고리별 조회
async findCategory(category: AchievementCategory): Promise<Achievement[]> {
  return await this.entity.find({ 
    where: { 
      category: category, 
      deleted_at: IsNull() // 삭제된 항목 제외
    },
    order: { expiration_at: 'ASC' } // 만료일 가까운 순으로 정렬
  })
}

async update(idA: number, updateAchievementDto: UpdateAchievementDto): Promise<void> {
  // 업데이트 실행
  await this.entity.update(idA, updateAchievementDto);
};

// 가벼운 삭제
  async softDelete(id: number): Promise<void> {
    await this.entity.softDelete(id); // 삭제 실행  
  }
  
}
