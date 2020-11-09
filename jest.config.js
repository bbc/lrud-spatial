module.exports = {
  roots: [
    '<rootDir>/test'
  ],
  testEnvironment: 'node',
  clearMocks: true,
  verbose: false,
  testMatch: [
    '<rootDir>/test/**/*?(*.)+(spec|test).js?(x)',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node']
}
