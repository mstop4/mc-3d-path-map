export default {
  '*.ts': [
    'prettier --write',
    'tsc-files --noEmit --pretty',
    'eslint --fix'
  ],
  '*.js': [
    'prettier --write',
    'eslint --fix'
  ],
  '*.{json,css}': [
    'prettier --write'
  ]
};