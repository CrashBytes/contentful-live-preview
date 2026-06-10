import React from 'react';
import { render, screen } from '@testing-library/react';

const mockDraftMode = jest.fn();
const mockFetchContentTypes = jest.fn();

jest.mock('next/headers', () => ({
  draftMode: () => mockDraftMode(),
}));

jest.mock('@/lib/contentful', () => ({
  fetchContentTypes: () => mockFetchContentTypes(),
}));

jest.mock('../template', () => {
  return function MockTemplate({ children }: any) {
    return <div data-testid="template">{children}</div>;
  };
});

jest.mock('@/components/PreviewBanner', () => {
  return function MockBanner({ isPreview }: any) {
    return isPreview ? <div data-testid="banner" /> : null;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children }: any) {
    return <a href={href}>{children}</a>;
  };
});

import Home from '../page';

async function renderHome() {
  const ui = await Home();
  return render(ui);
}

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraftMode.mockResolvedValue({ isEnabled: false });
  });

  it('renders content type cards when content types exist', async () => {
    mockFetchContentTypes.mockResolvedValue([
      {
        sys: { id: 'blogPost' },
        name: 'Blog Post',
        description: 'Posts',
        fields: [{}, {}],
      },
    ]);

    await renderHome();
    expect(screen.getByText('Blog Post')).toBeInTheDocument();
    expect(screen.getByText('blogPost')).toBeInTheDocument();
    expect(screen.getByText('2 fields')).toBeInTheDocument();
    expect(screen.getByText('Content Types (1)')).toBeInTheDocument();
  });

  it('renders the empty state and getting started when no content types', async () => {
    mockFetchContentTypes.mockResolvedValue([]);

    await renderHome();
    expect(
      screen.getByText(/No content types found/)
    ).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders an error state when fetching throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchContentTypes.mockRejectedValue(new Error('fetch failed'));

    await renderHome();
    expect(
      screen.getByText('Error loading content types')
    ).toBeInTheDocument();
    expect(screen.getByText('fetch failed')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('renders the preview banner when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true });
    mockFetchContentTypes.mockResolvedValue([]);

    await renderHome();
    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });

  it('handles a fetch error without a message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchContentTypes.mockRejectedValue({});

    await renderHome();
    expect(
      screen.getByText('An error occurred fetching content types')
    ).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('omits description and shows zero fields when absent', async () => {
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'noDesc' }, name: 'No Desc' },
    ]);

    await renderHome();
    expect(screen.getByText('0 fields')).toBeInTheDocument();
  });
});
