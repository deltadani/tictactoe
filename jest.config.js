module.exports = {
  preset: 'ts-jest', // Use ts-jest to handle TypeScript files
  testEnvironment: 'jsdom', // Simulates a browser environment for React components
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mocks CSS imports
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'], // Adds custom matchers for DOM testing
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files using ts-jest
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!three/examples/jsm/)', // Allow transforming three/examples/jsm
  ],
};