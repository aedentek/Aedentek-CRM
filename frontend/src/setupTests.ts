import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.VITE_API_URL = 'http://localhost:4000/api';
process.env.VITE_BASE_URL = 'http://localhost:4000';

// Mock fetch for tests
global.fetch = jest.fn();

// Setup cleanup
afterEach(() => {
  jest.clearAllMocks();
});

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
    }
  }
}
