/** @type {import('jest').Config} */
export default {
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  testEnvironment: '<rootDir>/jest.environment.cjs',
  testEnvironmentOptions: { customExportConditions: [''] },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs|@bundled-es-modules|until-async|outvariant|strict-event-emitter|headers-polyfill|is-node-process|graphql|tough-cookie|universalify)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/src/testing/styleStub.cjs',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/testing/**',
    '!src/fixtures/**',
    '!src/{index,bootstrap}.tsx',
    '!src/remote/**',
    '!src/dev/**',
    '!src/components/QueryDevtools.tsx',
    '!src/i18n/localeCompleteness.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
  clearMocks: true,
  restoreMocks: true,
};
