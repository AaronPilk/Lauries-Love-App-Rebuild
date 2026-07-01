import React from 'react';

import { makeLocalStorageAdapter } from 'main/factories/cache';

type Serializer<T> = (object: T | undefined) => string;
type Parser<T> = (val: string) => T | undefined;

type Options<T> = Partial<{
  serializer: Serializer<T>;
  parser: Parser<T>;
  logger: (error: any) => void;
  syncData: boolean;
}>;
export interface Props<T> {
  key: string;
  initialValue: T;
  options?: Options<T>;
}

export default function useStorage<T>({
  key,
  initialValue,
  options,
}: Props<T>) {
  const opts = React.useMemo(() => {
    return {
      serializer: JSON.stringify,
      parser: JSON.parse,
      logger: console.error,
      syncData: true,
      ...options,
    };
  }, [options]);
  const { serializer, parser, logger } = opts;
  const rawValueRef = React.useRef<string | null>(null);

  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      rawValueRef.current = makeLocalStorageAdapter().get(key);
      const res: T = rawValueRef.current
        ? parser(rawValueRef.current)
        : initialValue;
      return res;
    } catch (e) {
      logger(e);
      return initialValue;
    }
  });
  const [loading, setLoading] = React.useState<Boolean>(true);

  React.useEffect(() => {
    const updateLocalStorage = () => {
      // Browser ONLY dispatch storage events to other tabs, NOT current tab.
      // We need to manually dispatch storage event for current tab
      if (storedValue !== undefined) {
        const newValue = serializer(storedValue);
        rawValueRef.current = newValue;
        makeLocalStorageAdapter().set(key, newValue);
      }
    };

    try {
      updateLocalStorage();
    } catch (e) {
      logger(e);
    }
  }, [storedValue]);

  const setValue = async (value: any) => {
    try {
      setLoading(true);
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      makeLocalStorageAdapter().set(key, serializer(valueToStore));
    } catch (error) {
      logger(error);
    } finally {
      setLoading(false);
    }
  };
  const removeValue = async () => {
    try {
      setLoading(true);
      makeLocalStorageAdapter().set(key, null);
    } catch (error) {
      logger(error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, storedValue, setValue, removeValue };
}
