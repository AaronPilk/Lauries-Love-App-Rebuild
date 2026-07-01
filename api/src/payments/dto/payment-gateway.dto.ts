import { ItemLine, User } from '@app/database/entities';
import { CreditCardInput } from './create-payment.dto';

export enum PaymentType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
}
export enum AppPaymentType {
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
}

export class ChargeCustomerProfileInput {
  user: User;
  customerProfileId: string;
  customerPaymentProfileId: string;
  items: ItemLine[];
  description: string;
  address?: string;
  inHonorName: string;
}

export class SaveCustomerInfoInput {
  user: User;
  address?: string;
  card?: CreditCardInput;
  appType?: AppPaymentType;
  token?: string;
  items: ItemLine[];
  operationType: PaymentType;
  inHonorName: string;
}
export class CreateCustomerPaymentProfileInput {
  user: User;
  card: CreditCardInput;
  address?: string;
}
export class TransactionOutput {
  paymentId: string;
  amount: number;
}

export class Transaction {
  transId: string;
  submitTimeUTC: Date;
  submitTimeLocal: Date;
  transactionStatus: string;
  invoiceNumber: string;
  firstName: string;
  lastName: string;
  accountType: string;
  accountNumber: string;
  settleAmount: number;
  marketType: string;
  product: string;
  profile: Profile;
}

export class Profile {
  customerProfileId: string;
  customerPaymentProfileId: string;
}

export interface TransactionResult {
  testPayment?: boolean;
  result?: {
    paymentId: string;
    amount: number;
    profileId: string;
    paymentProfileId: string;
    billId: string;
    message: string;
  };
}
