import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ValkeyModule } from '../valkey/valkey.module';
import { PaymentRepository } from './payment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    UserModule,
    ConfigModule,
    ValkeyModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {} 