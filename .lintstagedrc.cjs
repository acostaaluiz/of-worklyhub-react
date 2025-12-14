module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix --cache --cache-location .cache/eslint/'
  ],
  '*.{json,md,css,scss}': [
    'prettier --write'
  ]
}
