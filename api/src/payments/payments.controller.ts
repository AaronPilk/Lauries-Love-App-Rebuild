import { AllowedGroups } from '@app/auth/groups.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentInput } from './dto/create-payment.dto';
import { CognitoPayload } from '@app/auth';
import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Payment } from '@app/database/entities';
import { AuthUser } from '@app/auth/auth-user.decorator';

@Crud({
  model: {
    type: Payment,
  },
  routes: {
    getManyBase: {
      decorators: [AllowedGroups(['user'])],
    },
  },
  query: {
    alwaysPaginate: true,
    limit: 100,
    join: {
      paymentType: {
        eager: true,
      },
      user: {
        alias: 'paymentUser',
        eager: true,
        exclude: ['id'],
      },
    },
    sort: [
      {
        field: 'createdAt',
        order: 'DESC',
      },
    ],
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: CognitoPayload) =>
    user?.['cognito:groups']?.includes('Admin')
      ? {}
      : {
          'paymentUser.cognitoId': user.sub,
        },
})
@Controller('payments')
export class PaymentsController implements CrudController<Payment> {
  constructor(public readonly service: PaymentsService) {}

  get base(): CrudController<Payment> {
    return this;
  }

  @Post()
  @AllowedGroups(['user'])
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async createPayment(@Body() createPaymentInput: CreatePaymentInput) {
    const result = await this.service.createTransaction(createPaymentInput);
    return result;
  }

  // @Get('/users')
  // @AllowedGroups(['public'])
  // async getUsers() {
  //   return this.service.getProfiles();
  // }
  @Post('cancel-subscription/:paymentId')
  @AllowedGroups(['user'])
  async cancelSubscription(
    @Param('paymentId') paymentId: string,
    @AuthUser() user: CognitoPayload,
  ) {
    return this.service.cancelSubscription(paymentId, user.sub);
  }

  @Get('paymentProfiles')
  @AllowedGroups(['user'])
  async getPaymentProfiles(@AuthUser() user: CognitoPayload) {
    return this.service.getPaymentProfiles(user);
  }
  @Delete('paymentProfiles/:paymentProfile')
  @AllowedGroups(['user'])
  async deletePaymentProfile(
    @Param('paymentProfile') paymentProfile: string,
    @AuthUser() user: CognitoPayload,
  ) {
    return this.service.deletePaymentProfile({ user, paymentProfile });
  }
}
