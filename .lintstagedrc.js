export default {
  // Type check TypeScript files
  '**/*.(ts|tsx)': () => [
    `npm run prettier`,
    'npm run check-ts',
    `npm run lint`,
  ]
};