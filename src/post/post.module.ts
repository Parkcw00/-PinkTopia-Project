import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './post.repository';
import { S3Service } from 'src/s3/s3.service';
import { CustomRedisModule } from '../redis/redis.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), CustomRedisModule],
  controllers: [PostController],
  providers: [PostService, PostRepository, S3Service, RedisService],
  exports: [PostRepository],
})
export class PostModule {}
