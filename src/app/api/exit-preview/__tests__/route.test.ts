const mockDisable = jest.fn();
const mockDraftMode = jest.fn(async () => ({ disable: mockDisable }));
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

describe('GET /api/exit-preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables draft mode and redirects to "/" by default', async () => {
    await GET(makeRequest('https://example.com/api/exit-preview'));

    expect(mockDisable).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('redirects to the provided redirect path', async () => {
    await GET(
      makeRequest('https://example.com/api/exit-preview?redirect=/blog')
    );

    expect(mockDisable).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/blog');
  });
});
