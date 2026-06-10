import '@testing-library/jest-dom'

// Provide dummy Contentful credentials so that env-shield validation in
// src/lib/env.ts passes at import time. The Contentful client is fully mocked
// in the test suite, so these values are never used to make real requests.
// They must exist before any module that imports `env` is evaluated, which is
// guaranteed because setupFilesAfterEach runs before the test files import.
process.env.CONTENTFUL_SPACE_ID ||= 'test-space-id'
process.env.CONTENTFUL_DELIVERY_TOKEN ||= 'test-delivery-token'
process.env.CONTENTFUL_PREVIEW_TOKEN ||= 'test-preview-token'
process.env.CONTENTFUL_PREVIEW_SECRET ||= 'test-preview-secret'
process.env.CONTENTFUL_ENVIRONMENT ||= 'master'
