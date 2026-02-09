import { createEnv, s } from '@crashbytes/env-shield'

export const env = createEnv({
  schema: {
    // Contentful (server-side)
    CONTENTFUL_SPACE_ID: s.string().min(1),
    CONTENTFUL_DELIVERY_TOKEN: s.string().min(1),
    CONTENTFUL_PREVIEW_TOKEN: s.string().min(1),
    CONTENTFUL_ENVIRONMENT: s.string().default('master'),
    CONTENTFUL_PREVIEW_SECRET: s.string().min(1),

    // Contentful (client-side)
    NEXT_PUBLIC_CONTENTFUL_SPACE_ID: s.string().optional(),
    NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT: s.string().optional(),

    // Node
    NODE_ENV: s.enum('development', 'production', 'test').default('development'),
  },
})
