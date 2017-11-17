module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    'spaced-comment': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': ['error', { 
      'props': false 
    }],
    'no-plusplus': ['error', { 
      'allowForLoopAfterthoughts': true 
    }],
    'max-len': ['warn', 100, 2, {
      ignoreUrls: true,
      ignoreComments: true,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreTrailingComments: true,
    }],
  },
  env: {
    node: true,
    mocha: true,
  }
}
