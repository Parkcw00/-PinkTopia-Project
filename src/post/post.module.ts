import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './post.repository';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyModule } from 'src/valkey/valkey.module';
import { ValkeyService } from 'src/valkey/valkey.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), ValkeyModule],
  controllers: [PostController],
  providers: [PostService, PostRepository, S3Service, ValkeyService],
  exports: [PostRepository],
})
export class PostModule {}
