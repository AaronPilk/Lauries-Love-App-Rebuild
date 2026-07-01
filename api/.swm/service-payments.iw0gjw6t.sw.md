---
title: '[Service] Payments'
---
Create One-Time Payment: \[POST\] /payments

<SwmSnippet path="/src/payments/payments.service.ts" line="33">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

This is the method in order to create a new ONE TIME  payment / transaction.

Sample Payload

```postman_json
{
    "creditCard": {
        "cardNumber": "4242424242424242",
        "expirationDate": "09/29",
        "ccv": "123"
    },
    // "cognitoId": "9b214b77-5b10-488f-ad33-f59139a33163",
    "cognitoId": "72e90d8b-c4dd-47e3-b123-e26dd0cc998f",
    "items": [
        {
            "name": "Donation-ONE_TIME",
            "type": "PRODUCT",
            "price": 20,
            "quantity": 1
        }
    ],
    "address": "123 Main St.",
    "paymentType": "ONE_TIME",
    "description": "",
    "inHonorName": "Manu",
    "token": "abcd",
    "isInApp": false
    // "inAppType": "APPLE_PAY"
}{
    "creditCard": {
        "cardNumber": "4242424242424242",
        "expirationDate": "09/29",
        "ccv": "123"
    },
    // "cognitoId": "9b214b77-5b10-488f-ad33-f59139a33163",
    "cognitoId": "72e90d8b-c4dd-47e3-b123-e26dd0cc998f",
    "items": [
        {
            "name": "Donation-ONE_TIME",
            "type": "PRODUCT",
            "price": 20,
            "quantity": 1
        }
    ],
    "address": "123 Main St.",
    "paymentType": "ONE_TIME",
    "description": "",
    "inHonorName": "Manu",
    "token": "abcd",
    "isInApp": false
    // "inAppType": "APPLE_PAY"
}
```

GET Payment Profiles: \[GET\] payments/paymentProfiles

<SwmSnippet path="/src/payments/payments.service.ts" line="369">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

&nbsp;

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBbGF1cmllc2xvdmUtYXBpJTNBJTNBTGF1cmllLXMtTG92ZQ==" repo-name="laurieslove-api"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
