import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    experimentalSessionAndOrigin: true,
    video: true,
  },
});
