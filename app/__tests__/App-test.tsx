/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../src/main/App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

jest.mock('@tanstack/react-query', () => {
  return {
    QueryClient: jest.fn(),
    useQuery: jest.fn().mockReturnValue({ data: [] }),
    QueryClientProvider: jest.fn(),
  };
});

it('renders correctly', () => {
  renderer.create(<App />);
});
