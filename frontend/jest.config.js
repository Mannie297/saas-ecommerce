export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true
    }]
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src'],
  globals: {
    'import.meta': {
      env: {
        VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key',
        VITE_API_URL: 'http://localhost:5000/api'
      }
    }
  }
}; 