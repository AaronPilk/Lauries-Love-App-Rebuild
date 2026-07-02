import React from 'react';

import moment from 'moment';

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { RequestQueryBuilder } from '@rewiko/crud-request';

import { appConfig } from 'main/config/app.config';
import { makeAxiosHttpClient } from 'main/factories/http';
import { PaginationResponse, Notification } from 'data/models';

export enum NotificationKeys {
  LIST = 'NOTIFICATION_LIST',
}

interface filterCriteria {
  sender?: string | null;
  date?: Date | null;
  type?: string | null;
}

export type Result = PaginationResponse<Notification>;
export function useListNotifications() {
  const initialValues = {
    sender: '',
    date: undefined,
    type: '',
  };

  const [filterCriteria, setFilterCriteria] =
    React.useState<filterCriteria>(initialValues);

  const resetFilters = () => {
    setFilterCriteria(initialValues);
  };

  const {
    data,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [
      NotificationKeys.LIST,
      filterCriteria.date,
      filterCriteria.sender,
      filterCriteria.type,
    ],
    queryFn: async ({ pageParam = 0 }): Promise<Result> => {
      const qb = RequestQueryBuilder.create();

      qb.setPage(pageParam);

      if (filterCriteria.sender) {
        qb.setFilter({
          field:
            'notificationObject.notificationChange.notificationNotificationChangeActor.displayName',
          operator: '$cont',
          value: filterCriteria.sender,
        })
          .setOr({
            field:
              'notificationObject.notificationChange.notificationNotificationChangeActor.firstName',
            operator: '$cont',
            value: filterCriteria.sender,
          })
          .setOr({
            field:
              'notificationObject.notificationChange.notificationNotificationChangeActor.lastName',
            operator: '$cont',
            value: filterCriteria.sender,
          });
      }
      if (filterCriteria.type) {
        qb.setFilter({
          field:
            'notificationObject.notificationChange.notificationObjectEntityType.id',
          operator: '$eq',
          value: filterCriteria.type,
        });
      }
      if (filterCriteria.date) {
        const startOfDay = moment(filterCriteria.date)
          .startOf('day')
          .format('YYYY-MM-DD');
        qb.setFilter({
          field: 'createdAt',
          operator: '$between',
          value: [`${startOfDay} 00:00:00`, `${startOfDay} 23:59:59`],
        });
      }

      const req = await makeAxiosHttpClient().request({
        method: 'get',
        url: `${appConfig.apiUrl}/notifications?${qb.query()}`,
      });
      return req.body;
    },
    getNextPageParam: lastPage => {
      if (lastPage.page === lastPage.pageCount) {
        return undefined;
      }
      return lastPage.page + 1;
    },
  });

  return {
    data,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
    resetFilters,
    setFilterCriteria,
    initialValues: filterCriteria,
  };
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: Partial<Notification>): Promise<Notification> => {
      const req = await makeAxiosHttpClient().request({
        method: 'put',
        url: `${appConfig.apiUrl}/notifications/${id}`,
        body,
      });
      return req.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NotificationKeys.LIST] });
    },
    onError: console.error,
  });
}

export function useUpdateManyNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Partial<Notification>[],
    ): Promise<Notification[]> => {
      const req = await makeAxiosHttpClient().request({
        method: 'post',
        url: `${appConfig.apiUrl}/notifications/bulk`,
        body: {
          bulk: data,
        },
      });
      return req.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NotificationKeys.LIST] });
    },
    onError: console.error,
  });
}
