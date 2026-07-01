import React, { PropsWithChildren, useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
// import { NativeBaseProvider, NativeBaseProviderProps } from 'native-base';

// helpers
// import { colorModeManager } from 'main/adapters';
// import customTheme from './theme';
// export * from './utils';

interface AppThemeProvider {
  // themeProps?: NativeBaseProviderProps;
  setCurrentRouteName: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function AppThemeProvider({
  children,
  // themeProps,
  setCurrentRouteName,
}: PropsWithChildren<AppThemeProvider>) {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  const onStateChange = () => {
    const nameRoute = navigationRef.current?.getCurrentRoute()?.name;
    if (nameRoute) setCurrentRouteName(nameRoute);
  };

  return (
    <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
      {/* <NativeBaseProvider
        colorModeManager={colorModeManager}
        theme={customTheme}
        {...themeProps}
      > */}
        {children}
      {/* </NativeBaseProvider> */}
    </NavigationContainer>
  );
}
