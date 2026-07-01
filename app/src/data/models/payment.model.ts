import { BaseModel } from 'domain/models/base.model';
import { ValueDefinition } from './value-definition.model';
import { User } from './user.model';

export type Payment = BaseModel & {
  id: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  paymentId: string;
  description?: string;
  accountType: string;
  accountNumber: string;
  paymentStatus: string;
  items: PaymentItem[];
  amount: number;
  paymentType: ValueDefinition;
  user: User;
  nextPayment: Date;
  currencyName?: 'USD' | 'CAD';
};

export type PaymentInput = {
  cognitoId: string;
  paymentType: string;
  currencyName: 'USD' | 'CAD';
  address?: string;
  description?: string;
  inHonorName?: string;
  creditCard?: CreditCard;
  items: PaymentItem[];
  isInApp?: boolean;
  inAppType?: string;
  token?: string;
};

export type CreditCard = {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
};

export type PaymentProfile = {
  accountNumber: string;
  accountType: string;
  expirationDate: string;
  paymentProfileId: string;
};

export type PaymentItem = {
  name: string;
  type: string;
  price: number;
  quantity: number;
};
