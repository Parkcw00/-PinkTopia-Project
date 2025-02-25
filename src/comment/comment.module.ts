import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentRepository } from './comment.repository';
import { PostModule } from '../post/post.module';
import { ValkeyModule } from 'src/valkey/valkey.module';
import { ValkeyService } from 'src/valkey/valkey.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostModule, ValkeyModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, ValkeyService],
})
export class CommentModule {}
