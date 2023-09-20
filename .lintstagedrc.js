export default {
  '**/*.(ts|tsx)': () => [
    `npm run prettier`,
    'npm run check-ts',
    `npm run lint`,
  ],
  '**/*.(js|json)': () => [
    `npm run prettier`,
    `npm run lint`,
  ]
};