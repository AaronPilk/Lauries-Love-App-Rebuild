import { ItemLine } from '@app/database/entities';
import { 
  IsArray, 
  IsBoolean, 
  IsCreditCard, 
  IsEnum, 
  IsOptional, 
  IsString, 
  IsUUID, 
  ValidateNested, 
  IsNumber, 
  IsNotEmpty
} from 'class-validator';
import { PaymentType, AppPaymentType } from './payment-gateway.dto';

export class CreditCardInput {
  @IsCreditCard()
  @IsNotEmpty()
  cardNumber: string;
  @IsString()
  @IsNotEmpty()
  expirationDate: string;
  @IsString()
  @IsNotEmpty()
  cvv: string;
}

export class CreatePaymentInput {
  @IsOptional()
  @ValidateNested()
  creditCard?: CreditCardInput;

  @IsUUID(4)
  cognitoId: string;

  @IsArray()
  @ValidateNested({ each: true })
  items: ItemLine[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsEnum(PaymentType, {
    message: `Payment Type must be one of the following values: ${Object.values(PaymentType).join(', ')}`,
  })
  paymentType: PaymentType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  inHonorName?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsBoolean()
  isInApp?: boolean;

  @IsOptional()
  @IsEnum(AppPaymentType, {
    message: `inAppType must be one of the following values: ${Object.values(AppPaymentType).join(', ')}`,
  })
  inAppType?: AppPaymentType;
}

export class CreateInAppPaymentInput {
  @IsEnum(AppPaymentType, {
    message: `appType must be one of the following values: ${Object.values(AppPaymentType).join(', ')}`,
  })
  appType: AppPaymentType;

  @IsOptional()
  @IsString()
  inHonorName?: string;

  @IsNumber({}, { message: 'amount must be a number' })
  amount: number;
}
