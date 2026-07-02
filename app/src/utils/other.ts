import { AxiosError } from 'axios';
import { ToastType } from 'providers/ToastProvider/ToastProvider.types';

/**
 * @description Custom console log
 * @param {string} message
 * @returns {void}
 * @example consoleCustom('Hello World')
 */
export const consoleCustom = (message: string): void => {
  // Debug logger — console calls are expensive on-device in release builds.
  if (!__DEV__) return;
  console.log(
    `%c${JSON.stringify(message)}`,
    'color: white; background-color: red; font-weight: bold;',
  );
};

/**
 * @description Custom show error
 * @param {object} dataError
 * @param {any} dataError.error
 * @param {function} dataError.showToast
 * @returns {void}
 * @example customShowError({ error: new Error('Error message'), showToast: (message) => console.log(message) })
 * @example customShowError({ error: new Error('Error message') })
 */
export const customShowError = (dataError: {
  error: any;
  showToast?: (message: Omit<ToastType, 'id'>) => void;
}): void => {
  const { error, showToast } = dataError;
  if (error instanceof AxiosError && showToast) {
    const code = error.response?.status;

    if (code === 404) {
      return;
    }

    const message = code === 401 ? 'Unauthorized' : error.message;
    showToast({
      title: 'Error',
      message,
      type: 'error',
    });
  } else if (error instanceof Error && showToast) {
    showToast({
      title: 'Error',
      message: error.message,
      type: 'error',
    });
  }
};
