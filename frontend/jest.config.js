// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '@/lib/prisma': ['./prisma'],
  },
  testTimeout: 600000,
  setupFilesAfterEnv: ['./prisma.mock.ts'],
};