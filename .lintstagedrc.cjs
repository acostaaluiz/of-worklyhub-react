module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix --cache --cache-location .cache/eslint/'
  ],
  'src/**/*.{ts,tsx,js,jsx}': () => 'npm run depcruise',
  '*.{json,md,css,scss}': [
    'prettier --write'
  ]
}
