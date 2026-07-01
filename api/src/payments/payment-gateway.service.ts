import { v4 as uuidv4 } from 'uuid';
import { Injectable, Logger } from '@nestjs/common';
import { APIContracts, APIControllers, Constants } from 'authorizenet';
import { User } from '@app/database/entities';
import { promisify } from 'util';
import { loadApiConfiguration } from 'libs/config';
import { ListPaymentsInput } from './dto/list-payments.dto';
import {
  ChargeCustomerProfileInput,
  CreateCustomerPaymentProfileInput,
  SaveCustomerInfoInput,
  TransactionOutput,
  TransactionResult,
} from './dto/payment-gateway.dto';
import { PaymentType, AppPaymentType } from './dto/payment-gateway.dto';

@Injectable()
export class PaymentGateway {
  private merchantAuthenticationType: APIContracts.MerchantAuthenticationType;

  constructor() {
    this.merchantAuthenticationType =
      new APIContracts.MerchantAuthenticationType();
    this.merchantAuthenticationType.setName(
      loadApiConfiguration()['authorizeApiLoginId'],
    );
    this.merchantAuthenticationType.setTransactionKey(
      loadApiConfiguration()['authorizeTransactionId'],
    );
  }

  getCustomerAddress(user: User, omitFields: (keyof User)[] = []) {
    const customerAddress = new APIContracts.CustomerAddressType();
    if (!omitFields.includes('firstName')) customerAddress.setFirstName(user.firstName);
    if (!omitFields.includes('lastName')) customerAddress.setLastName(user.lastName ?? 'LL');
    if (!omitFields.includes('email')) customerAddress.setEmail(user.email);
    if (!omitFields.includes('addressLine1')) customerAddress.setAddress(user?.addressLine1 ?? 'LL');
    if (!omitFields.includes('city')) customerAddress.setCity(user?.city ?? 'LL');
    if (!omitFields.includes('state')) customerAddress.setState(user?.state ?? 'LL');
    if (!omitFields.includes('country')) customerAddress.setCountry(user?.country ?? 'US');
    if (!omitFields.includes('phoneNumber')) customerAddress.setPhoneNumber(user?.phoneNumber);
    if (!omitFields.includes('zipCode')) customerAddress.setZip(user?.zipCode ?? '90210');

    return customerAddress;
  }

  getCustomerPaymentProfileType(
    paymentType: APIContracts.PaymentType,
    customerAddress: APIContracts.CustomerAddressType,
  ) {
    const customerPaymentProfileType =
      new APIContracts.CustomerPaymentProfileType();
    customerPaymentProfileType.setCustomerType(
      APIContracts.CustomerTypeEnum.INDIVIDUAL,
    );
    customerPaymentProfileType.setPayment(paymentType);
    customerPaymentProfileType.setBillTo(customerAddress);

    return customerPaymentProfileType;
  }

  getCustomerProfileType(
    billId: string,
    email: string,
    paymentProfilesList: APIContracts.CustomerPaymentProfileType[],
  ) {
    const customerProfileType = new APIContracts.CustomerProfileType();
    customerProfileType.setMerchantCustomerId(billId);
    customerProfileType.setEmail(email);
    customerProfileType.setPaymentProfiles(paymentProfilesList);

    return customerProfileType;
  }

  async saveCustomerInfo({
    user,
    address,
    card,
    appType,
    token = '',
    items,
    operationType,
    inHonorName
  }: SaveCustomerInfoInput): Promise<TransactionResult> {
    const paymentType = new APIContracts.PaymentType();

    if (token.length === 0) {
      token = uuidv4();
      console.log('Token', token);
    }

    if (card) {
      const creditCard = new APIContracts.CreditCardType();
      creditCard.setCardNumber(card.cardNumber);
      creditCard.setExpirationDate(card.expirationDate);

      paymentType.setCreditCard(creditCard);
      console.log('Credit Card', creditCard);
    } else if (appType && token) {
      const payType =
        appType === AppPaymentType.APPLE_PAY
          ? 'COMMON.APPLE.INAPP.PAYMENT'
          : 'COMMON.GOOGLE.INAPP.PAYMENT';

      paymentType.setOpaqueData({
        dataDescriptor: payType,
        dataValue: Buffer.from(token).toString('base64'),
      });

      Logger.log('Payment_Object', { payType, token });
      //   if(process.env.PARAMS_ENV === 'prod') {
      // }

      Logger.log('AQQQQQQQQ', { paymentType });
      if (payType === 'COMMON.APPLE.INAPP.PAYMENT') {
        Logger.log('Apple Pay Transaction');
        await this.createApplePayTransaction(paymentType);
      }
    }

    const _address = address ?? user.addressLine1;

    if (!_address) {
      throw new Error('Address is required');
    }

    const customerAddress = this.getCustomerAddress({
      ...user,
      addressLine1: _address,
    });

    console.log('customerAddress for payment profile', customerAddress);

    const customerPaymentProfileType = this.getCustomerPaymentProfileType(
      paymentType,
      customerAddress,
    );

    console.log('customerPaymentProfileType', customerPaymentProfileType);
    const paymentProfilesList = [customerPaymentProfileType];

    const billId = 'M_' + this.getRandomString('cust');

    const customerProfileType = this.getCustomerProfileType(
      billId,
      user.email,
      paymentProfilesList,
    );

    console.log('customerProfileType', {...customerProfileType});

    const createRequest = new APIContracts.CreateCustomerProfileRequest();
    createRequest.setProfile(customerProfileType);
    createRequest.setMerchantAuthentication(this.merchantAuthenticationType);

    const isProduction = loadApiConfiguration()['paramsEnv'] === 'production';

    if (!isProduction) {
      createRequest.setValidationMode(APIContracts.ValidationModeEnum.TESTMODE);
    } else {
      createRequest.setValidationMode(APIContracts.ValidationModeEnum.LIVEMODE);
    }

    const ctrl = new APIControllers.CreateCustomerPaymentProfileController(
      createRequest?.getJSON(),
    );

    const endpoint = isProduction
      ? Constants.endpoint.production
      : Constants.endpoint.sandbox;

    ctrl.setEnvironment(endpoint);

    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();
    const apiResponse = ctrl.getResponse();

    console.log('apiResponse', apiResponse);

    const messageCode = apiResponse?.messages?.message?.[0]?.code;
    if (messageCode && messageCode === 'E00003') {
      return { testPayment: true };
    }

    const response = new APIContracts.CreateCustomerProfileResponse(
      apiResponse,
    );

    const responseMessages = response.getMessages();

    if (responseMessages.getResultCode() !== APIContracts.MessageTypeEnum.OK) {
      console.log(responseMessages?.getMessage());
      throw new Error(responseMessages?.getMessage()[0].getText());
    }
    const result = {
      profileId: response.getCustomerProfileId() as string,
      paymentProfileId: String(
        JSON.parse(
          response.getCustomerPaymentProfileIdList().getNumericString()[0],
        ),
      ),
      billId,
      message: 'success',
    };

    const createShipRequest =
      new APIContracts.CreateCustomerShippingAddressRequest();
    createShipRequest.setMerchantAuthentication(
      this.merchantAuthenticationType,
    );
    createShipRequest.setCustomerProfileId(response.getCustomerProfileId());
    createShipRequest.setAddress(customerAddress);

    const ctrlShip = new APIControllers.CreateCustomerShippingAddressController(
      createShipRequest.getJSON(),
    );
    const execShip = promisify(ctrlShip.execute.bind(ctrlShip));
    await execShip();
    let transactionOutput: TransactionOutput;

    if (appType) {
      await this.inAppTransaction({ items, appType, token });
    } else if (operationType === PaymentType.RECURRING) {
      console.log('Recurring====>');
      transactionOutput = await this.createSubscription({
        user,
        address: _address,
        customerPaymentProfileId: result.paymentProfileId,
        customerProfileId: result.profileId,
        items,
        description: '',
        inHonorName,
      });
    } else if (operationType === PaymentType.ONE_TIME) {
      console.log('One Time====>');
      transactionOutput = await this.chargeCustomerProfile({
        user,
        customerPaymentProfileId: result.paymentProfileId,
        customerProfileId: result.profileId,
        items,
        description: '',
        inHonorName,
      });
    }
    return {
      result: { ...result, ...transactionOutput },
    };
  }

  async createCustomerPaymentProfile({
    card,
    user,
    address,
  }: CreateCustomerPaymentProfileInput) {
    const customerProfileId = user.config.billing.profileId;
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(card.cardNumber);
    creditCard.setExpirationDate(card.expirationDate);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const customerAddress = this.getCustomerAddress({
      ...user,
      lastName: user.lastName ?? 'TT',
      addressLine1: address ?? user.addressLine1,
    });

    const profile = new APIContracts.CustomerPaymentProfileType();
    profile.setBillTo(customerAddress);
    profile.setPayment(paymentType);

    Logger.log('CreateCustomerPaymentProfile', { profile });

    const createRequest =
      new APIContracts.CreateCustomerPaymentProfileRequest();

    createRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    createRequest.setCustomerProfileId(customerProfileId);
    createRequest.setPaymentProfile(profile);

    const ctrl = new APIControllers.CreateCustomerPaymentProfileController(
      createRequest.getJSON(),
    );
    if (loadApiConfiguration()['paramsEnv'] === 'production') {
      ctrl.setEnvironment(Constants.endpoint.production);
    } else {
      ctrl.setEnvironment(Constants.endpoint.sandbox);
    }
    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();

    const apiResponse = ctrl.getResponse();

    const response = new APIContracts.CreateCustomerPaymentProfileResponse(
      apiResponse,
    );

    if (
      response.getMessages().getResultCode() !==
        APIContracts.MessageTypeEnum.OK &&
      response.getMessages().getMessage()[0].code !== 'E00039'
    ) {
      console.log(response.getMessages().getMessage()[0]);
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    const result = {
      message: 'success',
      paymentProfileId: String(
        JSON.parse(response.getCustomerPaymentProfileId()),
      ),
    };

    Logger.log('CreateCustomerPaymentProfile', { result });
    return {
      result,
    };
  }

  async getTransactionListForCustomer(user: User, input: ListPaymentsInput) {
    const paging = new APIContracts.Paging();
    paging.setLimit(input.limit || 100);
    paging.setOffset(input.offset);

    const sorting = new APIContracts.TransactionListSorting();
    sorting.setOrderBy(APIContracts.TransactionListOrderFieldEnum.ID);
    sorting.setOrderDescending(true);

    const getRequest = new APIContracts.GetTransactionListForCustomerRequest();
    getRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    getRequest.setCustomerProfileId(user.config.billing.profileId);
    getRequest.setPaging(paging);
    getRequest.setSorting(sorting);

    const ctrl = new APIControllers.GetTransactionListForCustomerController(
      getRequest?.getJSON(),
    );
    if (process.env.PARAMS_ENV === 'production') {
      ctrl.setEnvironment('');
    }
    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();
    const apiResponse = ctrl.getResponse();
    const response = new APIContracts.GetTransactionListResponse(apiResponse);
    if (
      response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK
    ) {
      console.log(response.getMessages().getMessage());
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    const total = response.getTotalNumInResultSet();
    return {
      transactions: response.transactions || [],
      total,
      hasNext: total - input.offset * input.limit > 0,
      message: 'success',
    };
  }
  async getProfiles() {
    try {
      const getRequest = new APIContracts.GetCustomerProfileIdsRequest();
      getRequest.setMerchantAuthentication(this.merchantAuthenticationType);

      const ctrl = new APIControllers.GetCustomerProfileIdsController(
        getRequest.getJSON(),
      );

      const exec = promisify(ctrl.execute.bind(ctrl));
      await exec();
      const apiResponse = ctrl.getResponse();
      const response = new APIContracts.GetCustomerProfileIdsResponse(
        apiResponse,
      );
      if (
        response.getMessages().getResultCode() !==
        APIContracts.MessageTypeEnum.OK
      ) {
        console.log(response.getMessages().getMessage());
        throw new Error(response.getMessages().getMessage()[0].getText());
      }
      return {
        results: {
          profileIds: response.getIds().getNumericString(),
        },
      };
    } catch (error) {
      console.log('CARDS ERROR', error.message);
      return {
        result: { result: error?.message as string, message: 'error' },
      };
    }
  }

  async chargeCustomerProfile({
    customerProfileId,
    customerPaymentProfileId,
    items,
    user,
    address,
    description,
    inHonorName,
  }: ChargeCustomerProfileInput): Promise<TransactionOutput> {
    const profileToCharge = new APIContracts.CustomerProfilePaymentType();
    profileToCharge.setCustomerProfileId(customerProfileId);

    const paymentProfile = new APIContracts.PaymentProfile();
    paymentProfile.setPaymentProfileId(customerPaymentProfileId);
    profileToCharge.setPaymentProfile(paymentProfile);

    const orderDetails = new APIContracts.OrderType();
    orderDetails.setInvoiceNumber(this.getRandomString(`LL`));
    const orderDescription = [
      description ? `${description}. Description: ${description}.` : '',
      inHonorName ? `In Honor Name: ${inHonorName}` : '',
    ].filter(Boolean).join('\n');
    orderDetails.setDescription(orderDescription);

    console.log('orderDescription', { orderDescription });
    console.log('orderDetails', { orderDetails });

    // const inHonorNameField = new APIContracts.UserField();
    // inHonorNameField.setName('In Honor Name');
    // inHonorNameField.setValue('N/A');

    let totalAmount = 0;
    const lineItemList = items.map((item, idx) => {
      const lineItem = new APIContracts.LineItemType();
      lineItem.setItemId(`${idx + 1}`);
      lineItem.setName(item.name);
      lineItem.setDescription(item.name);
      lineItem.setQuantity(item.quantity.toFixed(2));
      lineItem.setUnitPrice(item.price.toFixed(2));
      totalAmount += item.price;

      return lineItem;
    });

    const lineItems = new APIContracts.ArrayOfLineItem();
    lineItems.setLineItem(lineItemList);

    const customerAddress = this.getCustomerAddress({
      ...user,
      addressLine1: address ?? user.addressLine1,
    });

    const shippingAddress = this.getCustomerAddress({
      ...user, 
      addressLine1: address ?? user.addressLine1,
    }, ['email', 'phoneNumber', 'zipCode'])

    console.log('shippingAddress', { shippingAddress });
    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
    );
    transactionRequestType.setProfile(profileToCharge);
    transactionRequestType.setAmount(totalAmount.toFixed(2));
    transactionRequestType.setLineItems(lineItems);
    transactionRequestType.setOrder(orderDetails);
    transactionRequestType.setShipTo(shippingAddress);
    // transactionRequestType.setUserFields(inHonorNameField);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new APIControllers.CreateTransactionController(
      createRequest.getJSON(),
    );
    if (loadApiConfiguration()['paramsEnv'] === 'production') {
      ctrl.setEnvironment(Constants.endpoint.production);
    } else {
      ctrl.setEnvironment(Constants.endpoint.sandbox);
    }

    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();
    const apiResponse = ctrl.getResponse();

    const response = new APIContracts.CreateTransactionResponse(apiResponse);

    if (
      response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK
    ) {
      console.log(response.getMessages().getMessage());
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    console.log(
      'Successfully created transaction with Transaction ID: ' +
        response.getTransactionResponse().getTransId(),
    );
    console.log(
      'Response Code: ' + response.getTransactionResponse().getResponseCode(),
    );
    console.log(
      'Message Code: ' +
        response
          .getTransactionResponse()
          .getMessages()
          .getMessage()[0]
          .getCode(),
    );
    console.log(
      'Description: ' +
        response
          .getTransactionResponse()
          .getMessages()
          .getMessage()[0]
          .getDescription(),
    );

    return {
      paymentId: response.getTransactionResponse().getTransId() as string,
      amount: totalAmount,
    };
  }

  async createSubscription({
    customerProfileId,
    customerPaymentProfileId,
    items,
    user,
    address,
  }: ChargeCustomerProfileInput): Promise<TransactionOutput> {
    const interval = new APIContracts.PaymentScheduleType.Interval();
    interval.setLength(1);
    interval.setUnit(APIContracts.ARBSubscriptionUnitEnum.MONTHS);

    const paymentScheduleType = new APIContracts.PaymentScheduleType();
    paymentScheduleType.setInterval(interval);
    paymentScheduleType.setStartDate(new Date().toISOString().substring(0, 10));
    paymentScheduleType.setTotalOccurrences(5);
    paymentScheduleType.setTrialOccurrences(0);

    const customerAddress = this.getCustomerAddress({
      ...user,
      addressLine1: address ?? user.addressLine1,
    });

    const shippingAddress = this.getCustomerAddress({
      ...user, 
      addressLine1: address ?? user.addressLine1,
    }, ['email', 'phoneNumber', 'zipCode'])

    const createShipRequest =
      new APIContracts.CreateCustomerShippingAddressRequest();
    createShipRequest.setMerchantAuthentication(
      this.merchantAuthenticationType,
    );
    createShipRequest.setCustomerProfileId(customerProfileId);
    createShipRequest.setAddress(shippingAddress);

    Logger.log('createShipRequest', { createShipRequest });
    const ctrlShip = new APIControllers.CreateCustomerShippingAddressController(
      createShipRequest.getJSON(),
    );

    Logger.log('ctrlShip', { ctrlShip });
    const execShip = promisify(ctrlShip.execute.bind(ctrlShip));
    await execShip();

    const execShipResponse = ctrlShip.getResponse();

    Logger.log('execShipResponse', { execShipResponse });
    const responseShip = new APIContracts.CreateCustomerShippingAddressResponse(
      execShipResponse,
    );

    const customerProfileIdType = new APIContracts.CustomerProfileIdType();
    customerProfileIdType.setCustomerProfileId(customerProfileId);
    customerProfileIdType.setCustomerPaymentProfileId(customerPaymentProfileId);
    customerProfileIdType.setCustomerAddressId(
      responseShip.getCustomerAddressId(),
    );

    const totalAmount = items.reduce((acc, item) => item.price + acc, 0);
    const arbSubscription = new APIContracts.ARBSubscriptionType();
    arbSubscription.setName(this.getRandomString('Name'));
    arbSubscription.setPaymentSchedule(paymentScheduleType);
    arbSubscription.setAmount(totalAmount.toFixed(2));
    arbSubscription.setTrialAmount('0.00');
    arbSubscription.setProfile(customerProfileIdType);

    const createRequest = new APIContracts.ARBCreateSubscriptionRequest();
    createRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    createRequest.setSubscription(arbSubscription);

    const ctrl = new APIControllers.ARBCreateSubscriptionController(
      createRequest.getJSON(),
    );
    if (loadApiConfiguration()['paramsEnv'] === 'production') {
      ctrl.setEnvironment(Constants.endpoint.production);
    } else {
      ctrl.setEnvironment(Constants.endpoint.sandbox);
    }

    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();
    const apiResponse = ctrl.getResponse();

    console.log('apiResponse', { ...apiResponse });
    const response = new APIContracts.ARBCreateSubscriptionResponse(
      apiResponse,
    );

    if (
      response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK
    ) {
      console.log(response.getMessages().getMessage());
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    return {
      paymentId: response.getSubscriptionId() as string,
      amount: totalAmount,
    };
  }

  getRandomString(text: string) {
    return text + Math.floor(Math.random() * 100000 + 1);
  }

  async getCustomerPaymentProfile(
    customerPaymentProfileId: string,
    customerProfileId: string,
  ) {
    const getRequest = new APIContracts.GetCustomerPaymentProfileRequest();
    getRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    getRequest.setCustomerProfileId(customerProfileId);
    getRequest.setCustomerPaymentProfileId(customerPaymentProfileId);
    getRequest.setUnmaskExpirationDate('true');

    const ctrl = new APIControllers.GetCustomerProfileController(
      getRequest.getJSON(),
    );

    Logger.log('paramsEnv', { paramsEnv: loadApiConfiguration()['paramsEnv'] });

    if (loadApiConfiguration()['paramsEnv'] === 'production') {
      ctrl.setEnvironment(Constants.endpoint.production);
    } else {
      ctrl.setEnvironment(Constants.endpoint.sandbox);
    }

    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();

    const apiResponse = ctrl.getResponse();

    Logger.log('apiResponse', { apiResponse });

    const response = new APIContracts.GetCustomerPaymentProfileResponse(
      apiResponse,
    );

    return {
      accountNumber: response.getPaymentProfile().payment.creditCard
        .cardNumber as string,
      accountType: response.getPaymentProfile().payment.creditCard
        .cardType as string,
      expirationDate: response.getPaymentProfile().payment.creditCard
        .expirationDate as string,
      paymentProfileId: customerPaymentProfileId,
    };
  }

  async getSubscription(subscriptionId: string) {
    const getRequest = new APIContracts.ARBGetSubscriptionRequest();
    getRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    getRequest.setSubscriptionId(subscriptionId);

    console.log(JSON.stringify(getRequest.getJSON(), null, 2));

    const ctrl = new APIControllers.ARBGetSubscriptionController(
      getRequest.getJSON(),
    );

    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();
    const apiResponse = ctrl.getResponse();

    const response = new APIContracts.ARBGetSubscriptionResponse(apiResponse);
    if (
      response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK
    ) {
      console.log(response.getMessages().getMessage());
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    return response;
  }

  async inAppTransaction({ items, appType, token }) {
    if (token.length === 0) {
      token = uuidv4();
    }

    const opaqueData = new APIContracts.OpaqueDataType();
    const payType =
      appType === AppPaymentType.APPLE_PAY
        ? 'COMMON.APPLE.INAPP.PAYMENT'
        : 'COMMON.GOOGLE.INAPP.PAYMENT';
    opaqueData.setDataDescriptor(payType);
    opaqueData.setDataValue(Buffer.from(token).toString('base64'));

    const payment = new APIContracts.PaymentType();
    payment.setOpaqueData(opaqueData);

    let totalAmount = 0;
    const lineItemList = items.map((item, idx) => {
      const lineItem = new APIContracts.LineItemType();
      lineItem.setItemId(`${idx + 1}`);
      lineItem.setName(item.name);
      lineItem.setDescription(item.name);
      lineItem.setQuantity(item.quantity.toFixed(2));
      lineItem.setUnitPrice(item.price.toFixed(2));
      totalAmount += item.price * item.quantity;

      return lineItem;
    });

    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(
      APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
    );
    transactionRequest.setAmount(totalAmount);
    transactionRequest.setPayment(payment);

    const lineItems = new APIContracts.ArrayOfLineItem();
    lineItems.setLineItem(lineItemList);
    transactionRequest.setLineItems(lineItems);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setTransactionRequest(transactionRequest);
    createRequest.setMerchantAuthentication(this.merchantAuthenticationType);

    const ctrl = new APIControllers.CreateTransactionController(
      createRequest.getJSON(),
    );
    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();
    const apiResponse = ctrl.getResponse();

    const response = new APIContracts.CreateTransactionResponse(apiResponse);
    if (
      response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK
    ) {
      console.log(response.getMessages().getMessage());
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    return response;
  }

  async cancelSubscription(subscriptionId: string) {
    const cancelRequest = new APIContracts.ARBCancelSubscriptionRequest();
    cancelRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    cancelRequest.setSubscriptionId(subscriptionId);

    const ctrl = new APIControllers.ARBCancelSubscriptionController(
      cancelRequest.getJSON(),
    );
    if (loadApiConfiguration()['paramsEnv'] === 'production') {
      ctrl.setEnvironment(Constants.endpoint.production);
    } else {
      ctrl.setEnvironment(Constants.endpoint.sandbox);
    }

    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();

    const apiResponse = ctrl.getResponse();

    const response = new APIContracts.ARBCancelSubscriptionResponse(
      apiResponse,
    );

    if (
      response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK
    ) {
      console.log(response.getMessages().getMessage());
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    console.log(response.getMessages());
  }

  async deleteCustomerPaymentProfile(
    profileId: string,
    paymentProfile: string,
  ) {
    const deleteRequest =
      new APIContracts.DeleteCustomerPaymentProfileRequest();
    deleteRequest.setMerchantAuthentication(this.merchantAuthenticationType);
    deleteRequest.setCustomerProfileId(profileId);
    deleteRequest.setCustomerPaymentProfileId(paymentProfile);

    const ctrl = new APIControllers.DeleteCustomerPaymentProfileController(
      deleteRequest.getJSON(),
    );

    const exec = promisify(ctrl.execute.bind(ctrl));
    await exec();
    const apiResponse = ctrl.getResponse();

    const response = new APIContracts.DeleteCustomerPaymentProfileResponse(
      apiResponse,
    );

    if (
      response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK
    ) {
      console.log(response.getMessages().getMessage());
      throw new Error(response.getMessages().getMessage()[0].getText());
    }
    return response;
  }

  private async createApplePayTransaction(
    paymentType: APIContracts.PaymentType,
  ): Promise<void> {
    try {
      // Create transaction request
      const transactionRequest = new APIContracts.TransactionRequestType();
      transactionRequest.setAmount(0);
      transactionRequest.setTransactionType(
        APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
      );
      transactionRequest.setPayment(paymentType);

      // Create transaction request object
      const createRequest = new APIContracts.CreateTransactionRequest();
      createRequest.setTransactionRequest(transactionRequest);
      createRequest.setMerchantAuthentication(this.merchantAuthenticationType);

      console.log(
        'Transaction Request:',
        JSON.stringify(createRequest.getJSON(), null, 2),
      );

      // Create transaction controller
      const ctrl = new APIControllers.CreateTransactionController(
        createRequest.getJSON(),
      );

      // Execute the transaction
      const response =
        await new Promise<APIContracts.CreateTransactionResponse>(
          (resolve, reject) => {
            ctrl.execute(() => {
              const apiResponse = ctrl.getResponse();
              if (!apiResponse) {
                reject(new Error('Null Response from API'));
                return;
              }
              resolve(new APIContracts.CreateTransactionResponse(apiResponse));
            });
          },
        );

      // Handle response
      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        const transactionResponse = response.getTransactionResponse();
        if (transactionResponse && transactionResponse.getMessages()) {
          console.log('Transaction successful!');
          console.log('Transaction ID:', transactionResponse.getTransId());
          console.log('Response Code:', transactionResponse.getResponseCode());
          console.log(
            'Message:',
            transactionResponse.getMessages().getMessage()[0].getDescription(),
          );
        } else if (transactionResponse && transactionResponse.getErrors()) {
          console.error('Transaction failed with errors:');
          const error = transactionResponse.getErrors().getError()[0];
          console.error('Error Code:', error.getErrorCode());
          console.error('Error Message:', error.getErrorText());
        }
      } else {
        console.error('Transaction failed with response message errors:');
        const errorMessage = response.getMessages().getMessage()[0];
        console.error('Error Code:', errorMessage.getCode());
        console.error('Error Message:', errorMessage.getText());
      }
    } catch (error) {
      console.error('Error during transaction:', error);
    }
  }
}
