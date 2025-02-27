import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './post.repository';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyModule } from '../valkey/valkey.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), ValkeyModule],
  controllers: [PostController],
  providers: [PostService, PostRepository, S3Service],
  exports: [PostRepository],
})
export class PostModule {}
