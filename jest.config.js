module.exports = {
  browser: true,
  roots: ['src'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
}
