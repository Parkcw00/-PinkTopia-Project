import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';
import { Inquiry } from './entities/inquiry.entity';
import { UserModule } from '../user/user.module';
import { S3Module } from '../s3/s3.module';
import { ValkeyModule } from '../valkey/valkey.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inquiry]),
    UserModule,
    S3Module,
    ValkeyModule,
  ],
  controllers: [InquiryController],
  providers: [InquiryService],
  exports: [InquiryService],
})
export class InquiryModule {} 