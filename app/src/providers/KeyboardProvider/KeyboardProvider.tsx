import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { Keyboard } from "react-native";

type KeyboardContext = {
  showKeyboard: boolean;
};

type KeyboardProviderProps = {
  children: JSX.Element;
};

export const keyboardContext = React.createContext({} as KeyboardContext);

const KeyboardProvider: FunctionComponent<KeyboardProviderProps> = ({
  children,
}) => {
  const [showKeyboard, setShowKeyboard] = useState(false);

  useEffect(() => {
    const keyboardDidShow = () => setShowKeyboard(true);
    const keyboardDidHide = () => setShowKeyboard(false);

    Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", keyboardDidHide);

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  return (
    <keyboardContext.Provider value={{ showKeyboard }}>
      {children}
    </keyboardContext.Provider>
  );
};

export const useKeyboardProvider = () => useContext(keyboardContext);

export default KeyboardProvider;
