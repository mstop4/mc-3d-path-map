export default {
  '**/*.ts': () => [
    `npm run prettier`,
    'npm run check-ts',
    `npm run lint`,
  ],
  '**/*.(js|json)': () => [
    `npm run prettier`,
    `npm run lint`,
  ],
  '**/*.css': () => [
    `npm run prettier`,
  ]
};