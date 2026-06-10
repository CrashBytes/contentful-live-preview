describe('env', () => {
  it('parses the provided environment variables via env-shield', () => {
    // jest.setup.js provides dummy CONTENTFUL_* values, so importing the module
    // should succeed and expose the validated values.
    const { env } = require('../env');

    expect(env.CONTENTFUL_SPACE_ID).toBe('test-space-id');
    expect(env.CONTENTFUL_DELIVERY_TOKEN).toBe('test-delivery-token');
    expect(env.CONTENTFUL_PREVIEW_TOKEN).toBe('test-preview-token');
    expect(env.CONTENTFUL_PREVIEW_SECRET).toBe('test-preview-secret');
    expect(env.CONTENTFUL_ENVIRONMENT).toBe('master');
  });
});
