import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react';
import uuid from 'react-native-uuid';

// components
import MessageToast from './components/MessageToast/MessageToast';

// types
import { ToastType } from './ToastProvider.types';

type ToastContext = {
  showToast: (
    message: Omit<ToastType, 'id'>,
    position?: 'top' | 'bottom',
  ) => void;
};

type ToastProviderProps = {
  children: React.ReactNode;
};

export const toastContext = createContext({} as ToastContext);

const ToastProvider: FunctionComponent<ToastProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ToastType[]>([]);
  const [showMessage, setShowMessage] = useState<ToastType | null>(null);

  const showToast = (message: Omit<ToastType, 'id'>) => {
    const id = uuid.v4();
    setMessages(prevMessages => [
      ...prevMessages,
      { ...message, id, interval: message.interval || 5000 },
    ]);
  };

  const onFinish = () => {
    setShowMessage(null);
  };

  useEffect(() => {
    if (messages.length > 0 && !showMessage) {
      setShowMessage(messages[0]);
      setMessages(prevMessages => prevMessages.slice(1));
    }
  }, [messages, showMessage]);

  return (
    <toastContext.Provider value={{ showToast }}>
      {children}
      {showMessage && (
        <MessageToast message={showMessage} onFinish={onFinish} />
      )}
    </toastContext.Provider>
  );
};

export const useToastProvider = () => useContext(toastContext);

export default ToastProvider;
