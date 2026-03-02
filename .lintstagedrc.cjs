module.exports = {
  // Use a single, project-wide glob to avoid overlapping/empty chunk issues
  // Let lint-staged append the staged filenames (cross-platform).
  '**/*.{ts,tsx,js,jsx}': [
    'npx eslint --fix --cache --cache-location .cache/eslint'
  ],
  '*.{json,md,css,scss}': [
    'prettier --write'
  ]
};
