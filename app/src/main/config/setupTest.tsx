// import React, { PropsWithChildren } from 'react';
// import { render } from '@testing-library/react-native';
// // import ReduxProvider from 'presentation/store/provider';

// // import AppThemeProvider from 'presentation/theme';

// // const inset = {
// //   frame: {
// //     width: 320,
// //     height: 640,
// //     x: 0,
// //     y: 0,
// //   },
// //   insets: {
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     top: 0,
// //   },
// // };

// export const AllTheProviders = ({ children }: PropsWithChildren) => {
//   return (
//     // <AppThemeProvider
//     //   themeProps={{
//     //     initialWindowMetrics: inset,
//     //   }}
//     // >
//     // <ReduxProvider>
//     { children }
//     // </ReduxProvider>
//     // </AppThemeProvider>
//   );
// };

// jest.mock('react-hook-form', () => ({
//   ...jest.requireActual('react-hook-form'),
//   Controller: () => <></>,
//   useForm: () => ({
//     handleSubmit: () => jest.fn(),
//     formState: () => ({ isInvalid: {} }),
//     control: {
//       register: jest.fn(),
//       unregister: jest.fn(),
//       getFieldState: jest.fn(),
//       _names: {
//         array: new Set('test'),
//         mount: new Set('test'),
//         unMount: new Set('test'),
//         watch: new Set('test'),
//         focus: 'test',
//         watchAll: false,
//       },
//       _subjects: {
//         watch: jest.fn(),
//         array: jest.fn(),
//         state: jest.fn(),
//       },
//       _getWatch: jest.fn(),
//       _formValues: ['test'],
//       _defaultValues: ['test'],
//     },
//     getValues: () => {
//       return [];
//     },
//     reset: () => jest.fn(),
//     setValue: () => jest.fn(),
//     watch: () => jest.fn(),
//   }),
//   useFormContext: () => ({
//     control: () => ({}),
//     handleSubmit: () => jest.fn(),
//     formState: { isInvalid: {}, errors: {} },
//   }),
// }));

// const customRender = (ui: React.ReactElement, options?: any) =>
//   render(ui, { wrapper: AllTheProviders, ...options });

// // re-export everything
// export * from '@testing-library/react-native';

// // override render method
// export { customRender };
