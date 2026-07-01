import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from '@tanstack/react-query';
import { RequestQueryBuilder } from '@rewiko/crud-request';

import { appConfig } from 'main/config/app.config';
import { makeAxiosHttpClient } from 'main/factories/http';
import {
  PaginationResponse,
  Payment,
  PaymentInput,
  PaymentProfile,
} from 'data/models';

enum PaymentKeys {
  LIST = 'PAYMENT_LIST',
  PROFILE = 'PAYMENT_PROFILE_LIST',
}

export type Result = PaginationResponse<Payment>;
export function useListPayments() {
  const {
    data,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery(
    [PaymentKeys.LIST],
    async ({ pageParam = 0 }): Promise<Result> => {
      const qb = RequestQueryBuilder.create();

      qb.setPage(pageParam);

      const req = await makeAxiosHttpClient().request({
        method: 'get',
        url: `${appConfig.apiUrl}/payments?${qb.query()}`,
      });

      return req.body;
    },
    {
      getNextPageParam: lastPage => {
        if (lastPage.page === lastPage.pageCount) {
          return undefined;
        }

        return lastPage.page + 1;
      },
    },
  );

  return {
    data,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
  };
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation(
    async (body: PaymentInput): Promise<Payment> => {
      const req = await makeAxiosHttpClient().request({
        method: 'post',
        url: `${appConfig.apiUrl}/payments`,
        body,
      });
      if (!req.body.ok) {
        throw Error(req.body.msg);
      }
      return req.body.result;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PaymentKeys.LIST, PaymentKeys.PROFILE]);
      },
      onError: console.error,
    },
  );
}

export function useDeletePaymentProfile() {
  const queryClient = useQueryClient();
  return useMutation(
    async (paymentProfileId: string) => {
      const req = await makeAxiosHttpClient().request({
        method: 'delete',
        url: `${appConfig.apiUrl}/payments/paymentProfiles/${paymentProfileId}`,
      });
      if (!req.body.ok) {
        throw Error(req.body.msg);
      }
      return req.body.result;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PaymentKeys.PROFILE]);
      },
      onError: console.error,
    },
  );
}

export function useGetPayment(id: string) {
  return useQuery(
    [PaymentKeys.LIST, id],
    async (): Promise<Payment> => {
      const req = await makeAxiosHttpClient().request({
        method: 'get',
        url: `${appConfig.apiUrl}/payments/${id}`,
      });
      return req.body;
    },
    {
      onError: console.error,
    },
  );
}

export function useGetPaymentProfiles() {
  return useQuery(
    [PaymentKeys.PROFILE],
    async (): Promise<{ ok: boolean; cards: PaymentProfile[] }> => {
      const req = await makeAxiosHttpClient().request({
        method: 'get',
        url: `${appConfig.apiUrl}/payments/paymentProfiles`,
      });
      return req.body;
    },
    {
      onError: console.error,
    },
  );
}

export function useCancelPaymentSubscription() {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string): Promise<void> => {
      const req = await makeAxiosHttpClient().request({
        method: 'post',
        url: `${appConfig.apiUrl}/payments/cancel-subscription/${id}`,
      });
      if (!req.body.ok) {
        throw Error(req.body.msg);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PaymentKeys.LIST]);
      },
      onError: console.error,
    },
  );
}
