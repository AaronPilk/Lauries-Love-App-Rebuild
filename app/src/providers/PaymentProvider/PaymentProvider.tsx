
import { captureException } from 'services/sentry.shim';
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  FunctionComponent,
} from 'react';

import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { ApiResponse } from 'providers/ApiProvider/ApiProvider.constants';
import {
  PaginationResponse,
  Payment,
  PaymentInput,
  PaymentProfile,
} from 'data/models';
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import {
  createStripeCheckoutSession,
  openCheckoutUrl,
  StripeCheckoutInput,
} from 'services/supabase/supabase.payments';

type PaymentContextType = {
  isLoading: boolean;
  listPayments: (page?: number) => Promise<PaginationResponse<Payment> | null>;
  createPayment: (body: PaymentInput) => Promise<Payment>;
  deletePaymentProfile: (id: string) => Promise<void>;
  getPayment: (id: string) => Promise<Payment>;
  getPaymentProfiles: () => Promise<PaymentProfile[]>;
  cancelPaymentSubscription: (id: string) => Promise<void>;
  /**
   * Additive: try hosted Stripe Checkout via the Supabase Edge Function.
   * Resolves `true` if a Checkout page was opened (caller should stop),
   * `false` if the function is not configured / errored (caller falls back to
   * the existing card flow). Never throws.
   */
  startStripeCheckout: (input: StripeCheckoutInput) => Promise<boolean>;
};

type PaymentProviderProps = {
  children: React.ReactNode;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const PaymentProvider: FunctionComponent<PaymentProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { api } = useApiProvider();

  const listPayments = async (
    page: number = 0,
  ): Promise<PaginationResponse<Payment> | null> => {
    setIsLoading(true);

    try {
      const response = await api<PaginationResponse<Payment>>('/payments', {
        config: {
          method: 'GET',
          params: {
            page,
          },
        },
      });
      if (!response) {
        throw new Error('Error fetching payments');
      }
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      captureException(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async (body: PaymentInput) => {
    setIsLoading(true);
    try {
      const response = await api<ApiResponse<Payment>>('/payments', {
        config: {
          method: 'POST',
          data: body,
        },
      });
      if (!response?.ok) {
        throw new Error(response?.msg ?? 'Error creating payment');
      }
      return response.result;
    } catch (error) {
      console.error('Error creating payment:', error);
      captureException(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentProfile = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await api(`/payment-profiles/${id}`, {
        config: {
          method: 'DELETE',
        },
      });
    } catch (error) {
      console.error('Error deleting payment profile:', error);
      captureException(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPayment = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api<Payment>(`/payments/${id}`);

      if (!response) {
        throw new Error('Error fetching payment');
      }
      return response;
    } catch (error) {
      console.error('Error fetching payment:', error);
      captureException(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await api<ApiResponse<PaymentProfile[]>>(
        '/payment-profiles',
      );
      if (!response?.ok) {
        throw new Error(response?.msg ?? 'Error fetching payment profiles');
      }
      return response.result;
    } catch (error) {
      console.error('Error fetching payment profiles:', error);
      captureException(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPaymentSubscription = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await api(`/payments/cancel-subscription/${id}`, {
        config: {
          method: 'POST',
        },
      });
    } catch (error) {
      console.error('Error canceling payment subscription:', error);
      captureException(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startStripeCheckout = async (
    input: StripeCheckoutInput,
  ): Promise<boolean> => {
    // Only attempt the edge function on the Supabase backend.
    if (!SUPABASE_ENABLED) return false;
    const res = await createStripeCheckoutSession(input);
    if (res.status === 'ok') {
      return openCheckoutUrl(res.url);
    }
    if (res.status === 'error' && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[stripe] checkout unavailable, falling back', res.error);
    }
    return false;
  };

  const value = useMemo(
    () => ({
      isLoading,
      listPayments,
      createPayment,
      deletePaymentProfile,
      getPayment,
      getPaymentProfiles,
      cancelPaymentSubscription,
      startStripeCheckout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, api],
  );

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentProvider = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentProvider must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentProvider;
