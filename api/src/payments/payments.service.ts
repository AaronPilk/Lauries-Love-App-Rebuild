import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreatePaymentInput } from './dto/create-payment.dto';
import { PaymentGateway } from './payment-gateway.service';
import { ListPaymentsInput } from './dto/list-payments.dto';
import { CognitoPayload } from '@app/auth';
import { Payment, UserConfig, ValuesDefinition } from '@app/database/entities';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentType, TransactionOutput } from './dto/payment-gateway.dto';
import { Repository } from 'typeorm';
import { addMonths } from 'libs/utils/date';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';
@Injectable()
export class PaymentsService extends TypeOrmCrudService<Payment> {
  constructor(
    private readonly userService: UsersService,
    private readonly paymentGateway: PaymentGateway,
    @InjectRepository(Payment) readonly paymentRepository: Repository<Payment>,
    @InjectRepository(ValuesDefinition)
    private readonly valueRepository: Repository<ValuesDefinition>,
  ) {
    super(paymentRepository);
  }

  async createTransaction({
    cognitoId,
    creditCard,
    items,
    address,
    paymentType,
    description,
    inHonorName,
    token,
    isInApp,
    inAppType,
  }: CreatePaymentInput) {
    try {
      let payment: Payment;

      const user = await this.userService.findOne({
        where: [{ cognitoId }, { id: cognitoId }],
      });

      console.log('USER', user);

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      const entityType = await this.valueRepository.findOne({
        where: {
          description: paymentType,
        },
      });

      if (!entityType) {
        throw Error('ValuesDefinition does not exist');
      }

      const paymentInfo = {
        ...(paymentType === PaymentType.RECURRING && {
          nextPayment: addMonths(new Date(), 1),
        }),
        ...(inHonorName && { inHonorName }),
        paymentType: entityType,
      };

      const userConfig = user?.config as UserConfig;
      const profileId = userConfig?.billing?.profileId;

      // NOT IN APP PAYMENT
      if (isInApp && token !== null && inAppType) {
        let payment: Payment;

        const totalAmount = items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );

        console.log('do i have a payment profile', profileId);
        if (!profileId) {
          const { testPayment, result } =
            await this.paymentGateway.saveCustomerInfo({
              user,
              items,
              appType: inAppType,
              operationType: paymentType,
              token,
              inHonorName
            });

          if (testPayment) {
            return {
              ok: true,
              result: {
                inAppTest: true,
              },
            };
          }

          user.config = {
            ...user.config,
            billing: {
              paymentProfileId: [result?.paymentProfileId],
              profileId: result.profileId,
              billId: result.billId,
            },
          };
          await this.userService.updateUser(user);

          payment = await this.repo.save(
            this.repo.create({
              accountType: inAppType,
              description,
              items,
              paymentId: result.paymentId,
              amount: totalAmount,
              user,
              paymentStatus: 'COMPLETED',
              ...paymentInfo,
            }),
          );

          return {
            ok: true,
            result: {
              ...payment,
              paymentType: entityType,
            },
          };
        }

        const info = await this.paymentGateway.inAppTransaction({
          items,
          appType: inAppType,
          token,
        });
        console.log('InAppTransaction INFO', info);

        payment = await this.repo.save(
          this.repo.create({
            accountType: inAppType,
            description,
            items,
            user,
            paymentStatus: 'COMPLETED',
            amount: totalAmount,
            ...paymentInfo,
          }),
        );
        Logger.log('payment', { payment });
        return {
          ok: true,
          result: {
            ...payment,
            paymentType: entityType,
          },
        };
      }

      // DOES NOT HAVE PAYMENT PROFILE
      if (profileId === undefined) {
        Logger.log('User does not have a payment profile. Creating one');
        const { result } = await this.paymentGateway.saveCustomerInfo({
          user,
          address,
          card: creditCard,
          items,
          operationType: paymentType,
          inHonorName
        });
        user.config = {
          ...user.config,
          billing: {
            paymentProfileId: [result?.paymentProfileId],
            profileId: result.profileId,
            billId: result.billId,
          },
        };
        await this.userService.updateUser(user);

        const { accountNumber, accountType } =
          await this.paymentGateway.getCustomerPaymentProfile(
            result?.paymentProfileId,
            result.profileId,
          );

        payment = await this.repo.save(
          this.repo.create({
            accountNumber,
            accountType,
            description,
            items,
            paymentId: result.paymentId,
            amount: result.amount,
            user,
            paymentStatus: 'COMPLETED',
            ...paymentInfo,
          }),
        );
        Logger.log('Payment 2', { payment });
      } else {
        console.log('Have payment profile');
        const { result } =
          await this.paymentGateway.createCustomerPaymentProfile({
            card: creditCard,
            user,
          });
        const { accountNumber, accountType } =
          await this.paymentGateway.getCustomerPaymentProfile(
            result?.paymentProfileId,
            profileId,
          );

        let cardInfo: TransactionOutput;

        if (paymentType === PaymentType.ONE_TIME) {
          cardInfo = await this.paymentGateway.chargeCustomerProfile({
            customerPaymentProfileId: result?.paymentProfileId,
            customerProfileId: profileId,
            items,
            user,
            description,
            inHonorName
          });
        } else if (paymentType === PaymentType.RECURRING) {
          Logger.log('Creating subscription Object', {
            customerPaymentProfileId: result?.paymentProfileId,
            customerProfileId: profileId,
            items,
            user,
            description,
          });
          cardInfo = await this.paymentGateway.createSubscription({
            customerPaymentProfileId: result?.paymentProfileId,
            customerProfileId: profileId,
            items,
            user,
            description,
            inHonorName
          });
        }
        Logger.log('CardInfo', { cardInfo });
        payment = await this.repo.save(
          this.repo.create({
            accountNumber,
            accountType,
            description,
            items,
            ...cardInfo,
            user,
            paymentStatus: 'COMPLETED',
            ...paymentInfo,
          }),
        );

        Logger.log('Payment 1', { payment });

        const paymentProfiles =
          typeof user.config.billing?.paymentProfileId === 'string'
            ? [user.config.billing?.paymentProfileId]
            : user.config.billing?.paymentProfileId;

        user.config = {
          ...user.config,
          billing: {
            ...user.config.billing,
            paymentProfileId: [
              ...new Set([...paymentProfiles, result?.paymentProfileId]),
            ],
          },
        };

        // await this.userService.updateUser(user);
      }

      return {
        ok: true,
        result: {
          ...payment,
          paymentType: entityType,
        },
      };
    } catch (error) {
      console.log('PAYMENT_ERROR', error);
      return {
        ok: false,
        msg: error.message,
      };
    }
  }

  async getTransaction(args: {
    input: ListPaymentsInput;
    user: CognitoPayload;
  }) {
    try {
      const user = await this.userService.findOne({
        where: {
          cognitoId: args.user.sub,
        },
      });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      if (!user?.config?.billing?.profileId) {
        return {
          transactions: [],
        };
      }

      return this.paymentGateway.getTransactionListForCustomer(
        user,
        args.input,
      );
    } catch (error) {
      return {
        ok: false,
        msg: error.message,
      };
    }
  }
  async getProfiles() {
    return this.paymentGateway.getProfiles();
  }

  async cancelSubscription(paymentId: string, cognitoId: string) {
    try {
      const subscription = await this.repo.findOne({
        where: {
          id: paymentId,
        },
        relations: ['user'],
      });

      if (subscription.user.cognitoId !== cognitoId) {
        throw Error('You are not authorized to access this info');
      }

      if (process.env.PARAMS_ENV === 'production') {
        await this.paymentGateway.cancelSubscription(subscription.paymentId);
      }

      await this.repo.update(
        {
          id: paymentId,
        },
        {
          active: false,
        },
      );
      return {
        ok: true,
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPaymentProfiles(currentUser: CognitoPayload) {
    try {
      const user = await this.userService.findOne({
        where: {
          cognitoId: currentUser.sub,
        },
      });

      const paymentProfiles = user?.config?.billing?.paymentProfileId;
      const profileId = user?.config.billing?.profileId;
      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      if (!paymentProfiles || !profileId) {
        return {
          ok: true,
          cards: [],
        };
      }

      const creditCardsIds =
        typeof paymentProfiles === 'string'
          ? [paymentProfiles]
          : paymentProfiles;

      const creditCards = creditCardsIds.map((card) =>
        this.paymentGateway.getCustomerPaymentProfile(card, profileId),
      );
      const cards = await Promise.all(creditCards);
      return {
        ok: true,
        cards,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deletePaymentProfile(input: {
    user: CognitoPayload;
    paymentProfile: string;
  }) {
    try {
      const user = await this.userService.findOne({
        where: {
          cognitoId: input.user.sub,
        },
      });

      const paymentProfiles = user?.config?.billing?.paymentProfileId;
      const profileId = user?.config.billing?.profileId;
      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      if (!paymentProfiles || !profileId) {
        throw Error('User does not have payment profiles');
      }

      if (!paymentProfiles.includes(input.paymentProfile)) {
        throw Error('PaymentProfile not found');
      }

      await this.paymentGateway.deleteCustomerPaymentProfile(
        user.config.billing.profileId,
        input.paymentProfile,
      );

      user.config = {
        ...user.config,
        billing: {
          ...user.config.billing,
          paymentProfileId: [
            ...new Set([
              ...paymentProfiles.filter((id) => id !== input.paymentProfile),
            ]),
          ],
        },
      };

      await this.userService.updateUser(user);

      return {
        ok: true,
        msg: 'Removed payment profile',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Cron('0 0 0 * * *')
  async updateSubscription() {
    const subscriptions = await this.repo.find({
      where: {
        active: true,
        paymentType: {
          description: PaymentType.RECURRING,
        },
      },
    });
    for (const subscription of subscriptions) {
      try {
        const result = await this.paymentGateway.getSubscription(
          subscription.paymentId,
        );

        if (result.getSubscription().status !== 'active') {
          subscription.active = false;
        } else {
          const date = moment(subscription?.nextPayment);
          const diff = moment().diff(date, 'months');
          subscription.nextPayment =
            diff >= 1
              ? date.add(1, 'month').toDate()
              : subscription?.nextPayment || subscription.createdAt;
        }
      } catch (error) {
        console.error(error);
        continue;
      }
    }
    await this.repo.save(subscriptions);
  }
}
