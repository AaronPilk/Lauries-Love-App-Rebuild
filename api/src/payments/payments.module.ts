import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { User, Payment, ValuesDefinition } from '@app/database/entities';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentGateway } from './payment-gateway.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Payment, ValuesDefinition]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}
