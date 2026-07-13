import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      // index.ts skips DB connect + app.listen under NODE_ENV=test
      NODE_ENV: 'test',
    },
  },
});
