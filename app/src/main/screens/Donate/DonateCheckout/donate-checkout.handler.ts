import { useNavigation } from '@react-navigation/native';
import { CreatePaymentModel } from './donate-checkout.model';
import { useStorage } from 'presentation/hooks';
// Payment native modules are EXCLUDED from the iOS build (react-native.config.js;
// they don't compile under Xcode 26 and aren't needed for UI testing). Load them
// lazily so importing this handler never touches a missing native module.
type DetailsData = any;
type MethodData = any;
type RequestDataType = any;
type AllowedCardAuthMethodsType = any;
type AllowedCardNetworkType = any;

let ApplePay: any = null;
let GooglePay: any = null;
try {
  ApplePay = require('react-native-apple-payment').default;
} catch (e) {
  if (__DEV__) console.log('ApplePay module unavailable (excluded from build)');
}
try {
  GooglePay = require('react-native-gpay-api').GooglePay;
} catch (e) {
  if (__DEV__) console.log('GooglePay module unavailable (excluded from build)');
}
import { appConfig } from 'main/config/app.config';
import { Alert } from 'react-native';
import { useMemo, useState } from 'react';
import { usePaymentProvider } from 'providers/PaymentProvider/PaymentProvider';
import { PATHS_DONATE_TAB } from 'main/navigators/paths';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { getCurrency } from 'utils/getCurrency';

// prettier-ignore
const MERCHANT_NAME = 'Love Laurie\'s, Inc';

export function useDefaultValues() {
  const navigation = useNavigation();
  const { removeValue, setValue } = useStorage({
    key: '@billing-info',
    initialValue: {},
  });

  const { userDB } = useUserDBProvider();

  const { createPayment } = usePaymentProvider();

  const [creatingPayment, setCreatingPayment] = useState(false);

  const { currencyName, country, symbol } = useMemo(() => {
    return getCurrency(userDB?.country ?? '');
  }, [userDB]);

  const submit = async (data: CreatePaymentModel) => {
    try {
      const result = await createPayment({
        cognitoId: String(userDB?.cognitoId),
        description: data.paymentType,
        paymentType: data.paymentType,
        inHonorName: data.inHonorName,
        address: data.address,
        currencyName: currencyName,
        creditCard: {
          cvv: data.creditCard.cvv.unmasked,
          cardNumber: data.creditCard.cardNumber.unmasked,
          expirationDate: data.creditCard.expirationDate.unmasked,
        },
        items: [
          {
            name: `Donation-${data.paymentType}`,
            type: 'PRODUCT',
            price: data.amount,
            quantity: 1,
          },
        ],
      });
      if (data.remember) {
        setValue(data);
      } else {
        removeValue();
      }
      navigation.navigate('Donate', {
        screen: PATHS_DONATE_TAB.donateTabInvoice,
        params: {
          isNew: true,
          itemId: result.id,
        },
      });
    } catch (error) {
      Alert.alert(
        'Payment unsuccessful',
        `There was a problem processing your card: ${error}`,
      );
    }
  };

  const makeGooglePay = async (data: any, amount: number) => {
    if (!GooglePay) {
      Alert.alert(
        'Payments disabled',
        'Google Pay is not available in this test build.',
      );
      return;
    }
    const allowedCardNetworks: AllowedCardNetworkType[] = [
      'VISA',
      'MASTERCARD',
      'AMEX',
    ];
    const allowedCardAuthMethods: AllowedCardAuthMethodsType[] = [
      'PAN_ONLY',
      'CRYPTOGRAM_3DS',
    ];

    const requestData: RequestDataType = {
      cardPaymentMethod: {
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          gateway: 'authorizenet',
          gatewayMerchantId: appConfig.authorizeNetGatewayId,
        },
        allowedCardNetworks,
        allowedCardAuthMethods,
      },
      transaction: {
        totalPrice: String(amount),
        totalPriceStatus: 'FINAL',
        currencyCode: currencyName,
      },
      merchantName: MERCHANT_NAME,
    };

    try {
      // Set the environment before the payment request
      GooglePay.setEnvironment(
        appConfig.authorizeNetEnv === 'prod'
          ? GooglePay.ENVIRONMENT_PRODUCTION
          : GooglePay.ENVIRONMENT_TEST,
      );

      // Check if Google Pay is available
      const ready = await GooglePay.isReadyToPay(
        allowedCardNetworks,
        allowedCardAuthMethods,
      );
      if (!ready) {
        throw new Error('Google Pay is not available');
      }
      // Request payment token
      const token = await GooglePay.requestPayment(requestData);
      if (token) {
        await callCreatePaymentInAuthorizeNet(data, token);
      } else {
        throw new Error('Error getting Google Pay token');
      }
    } catch (error) {
      Alert.alert(
        'Payment unsuccessful',
        `There was a problem processing your card: ${error}`,
      );
    }
  };

  const makeApplePay = async (data: any, amount: number) => {
    if (!ApplePay) {
      Alert.alert(
        'Payments disabled',
        'Apple Pay is not available in this test build.',
      );
      return;
    }
    const Method: MethodData = {
      countryCode: country,
      currencyCode: currencyName,
      merchantIdentifier: appConfig.applePayMerchantId,
      supportedNetworks: ['Visa', 'MasterCard', 'AmEx'],
    };

    const Options: DetailsData = {
      total: {
        label: MERCHANT_NAME,
        amount,
      },
    };

    try {
      const payment = new ApplePay(Method, Options);
      const can = await payment.canMakePayments();

      if (!can) {
        throw new Error('Apple Pay is not available');
      }

      const resultApplePay = await payment.initApplePay();

      if (!resultApplePay) {
        throw new Error('Error getting Apple Pay token');
      }

      if (resultApplePay === 'PAYMENT_CANCELLED') {
        throw new Error('Payment cancelled');
      }

      await callCreatePaymentInAuthorizeNet(data, resultApplePay);
    } catch (error) {
      Alert.alert(
        'Payment unsuccessful',
        `There was a problem processing your card: ${error}`,
      );
    }
  };

  const callCreatePaymentInAuthorizeNet = async (data: any, token: string) => {
    try {
      setCreatingPayment(true);
      const payload = {
        cognitoId: String(userDB?.cognitoId),
        description: data?.paymentType,
        paymentType: data?.paymentType,
        inHonorName: data?.inHonorName,
        address: data?.address,
        items: [
          {
            name: `Donation-${data.paymentType}`,
            type: 'PRODUCT',
            price: data.amount,
            quantity: 1,
          },
        ],
        isInApp: true,
        inAppType: 'APPLE_PAY',
        token,
        currencyName,
      };
      const result = await createPayment(payload);
      if (data.remember) {
        setValue(data);
      } else {
        removeValue();
      }
      navigation.navigate('Donate', {
        screen: PATHS_DONATE_TAB.donateTabInvoice,
        params: {
          isNew: true,
          itemId: result.id,
        },
      });
    } catch (error) {
      Alert.alert(
        'Payment unsuccessful',
        `There was a problem processing your card: ${error}`,
      );
    } finally {
      setCreatingPayment(false);
    }
  };

  return {
    creatingPayment,
    makeApplePay,
    submit,
    isLoading: creatingPayment,
    makeGooglePay,
  };
}
