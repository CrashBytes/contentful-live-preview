// jsdom does not provide the Web `Response` global used by the route handler.
if (typeof (globalThis as any).Response === 'undefined') {
  (globalThis as any).Response = class {
    body: string;
    status: number;
    constructor(body: string, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }
    text() {
      return Promise.resolve(this.body);
    }
  };
}

const mockEnable = jest.fn();
const mockDraftMode = jest.fn(async () => ({ enable: mockEnable }));
const mockRedirect = jest.fn();

jest.mock('next/headers', () => ({
  draftMode: () => mockDraftMode(),
}));

jest.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));

import { GET } from '../route';

function makeRequest(url: string) {
  return { nextUrl: new URL(url) } as any;
}

describe('GET /api/preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when the secret is invalid', async () => {
    const response = await GET(
      makeRequest('https://example.com/api/preview?secret=wrong&slug=foo')
    );

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Invalid token');
    expect(mockEnable).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('returns 400 when the slug is missing', async () => {
    const response = await GET(
      makeRequest(
        'https://example.com/api/preview?secret=test-preview-secret'
      )
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Missing slug parameter');
    expect(mockEnable).not.toHaveBeenCalled();
  });

  it('enables draft mode and redirects to the slug path', async () => {
    await GET(
      makeRequest(
        'https://example.com/api/preview?secret=test-preview-secret&slug=about'
      )
    );

    expect(mockEnable).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/about');
  });

  it('redirects to "/" when the slug is "homepage"', async () => {
    await GET(
      makeRequest(
        'https://example.com/api/preview?secret=test-preview-secret&slug=homepage'
      )
    );

    expect(mockEnable).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
