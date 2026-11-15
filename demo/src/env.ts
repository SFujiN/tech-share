import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  BLOB_READ_WRITE_TOKEN: {
    schema: (value) => value,
    description: 'Vercel Blob read-write token for local development'
  }
});
