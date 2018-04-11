module.exports = {
  browser: true,
  roots: ['src'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
}
