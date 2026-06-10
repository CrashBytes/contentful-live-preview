const mockGetContentTypes = jest.fn();
const mockCreateClient = jest.fn(() => ({
  getContentTypes: mockGetContentTypes,
}));

jest.mock('contentful', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

// NextResponse.json is provided by next/server; provide a lightweight mock so
// we can assert on the body/status without a full server runtime.
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

describe('GET /api/test-contentful', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('returns space, environment and content type names on success', async () => {
    mockGetContentTypes.mockResolvedValue({
      items: [{ name: 'Blog Post' }, { name: 'Author' }],
    });

    const { GET } = require('../route');
    const response: any = await GET();

    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.objectContaining({
        space: 'test-space-id',
        accessToken: 'test-delivery-token',
        environment: 'master',
      })
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      spaceId: 'test-space-id',
      environment: 'master',
      contentTypes: ['Blog Post', 'Author'],
    });
  });

  it('returns a 500 with the error message on failure', async () => {
    process.env.NODE_ENV = 'production';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockGetContentTypes.mockRejectedValue(new Error('Boom'));

    const { GET } = require('../route');
    const response: any = await GET();

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Boom');
    // stack should be undefined outside development
    expect(response.body.stack).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('includes the stack trace in development', async () => {
    process.env.NODE_ENV = 'development';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const err = new Error('Boom dev');
    err.stack = 'stack-trace-here';
    mockGetContentTypes.mockRejectedValue(err);

    const { GET } = require('../route');
    const response: any = await GET();

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Boom dev');
    expect(response.body.stack).toBe('stack-trace-here');

    consoleSpy.mockRestore();
  });

  it('falls back to a generic message when the error has none', async () => {
    process.env.NODE_ENV = 'production';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockGetContentTypes.mockRejectedValue({});

    const { GET } = require('../route');
    const response: any = await GET();

    expect(response.status).toBe(500);
    expect(response.body.error).toBe(
      'An error occurred while testing Contentful connection'
    );

    consoleSpy.mockRestore();
  });
});
