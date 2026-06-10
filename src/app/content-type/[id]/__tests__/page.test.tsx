import React from 'react';
import { render, screen } from '@testing-library/react';

const mockDraftMode = jest.fn();
const mockFetchContentTypes = jest.fn();
const mockFetchEntries = jest.fn();

jest.mock('next/headers', () => ({
  draftMode: () => mockDraftMode(),
}));

jest.mock('@/lib/contentful', () => ({
  fetchContentTypes: () => mockFetchContentTypes(),
  fetchEntries: (...args: any[]) => mockFetchEntries(...args),
}));

jest.mock('../../../template', () => {
  return function MockTemplate({ children }: any) {
    return <div data-testid="template">{children}</div>;
  };
});

jest.mock('@/components/PreviewBanner', () => {
  return function MockBanner() {
    return null;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children }: any) {
    return <a href={href}>{children}</a>;
  };
});

import ContentTypePage from '../page';

async function renderPage(id: string) {
  const ui = await ContentTypePage({ params: Promise.resolve({ id }) });
  return render(ui);
}

describe('ContentTypePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraftMode.mockResolvedValue({ isEnabled: false });
  });

  it('lists entries for a known content type', async () => {
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'blogPost' }, name: 'Blog Post', description: 'desc' },
    ]);
    mockFetchEntries.mockResolvedValue([
      {
        sys: { id: 'e1', updatedAt: '2025-01-01T00:00:00Z' },
        fields: { title: 'First', description: 'summary' },
      },
    ]);

    await renderPage('blogPost');
    expect(mockFetchEntries).toHaveBeenCalledWith('blogPost', false);
    expect(screen.getAllByText('Blog Post').length).toBeGreaterThan(0);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.getByText('Entries (1)')).toBeInTheDocument();
  });

  it('shows the empty state when there are no entries', async () => {
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'blogPost' }, name: 'Blog Post' },
    ]);
    mockFetchEntries.mockResolvedValue([]);

    await renderPage('blogPost');
    expect(screen.getByText(/No entries found/)).toBeInTheDocument();
  });

  it('renders an error when the content type is not found', async () => {
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'other' }, name: 'Other' },
    ]);

    await renderPage('missing');
    expect(
      screen.getByText('Content type "missing" not found')
    ).toBeInTheDocument();
    expect(mockFetchEntries).not.toHaveBeenCalled();
  });

  it('renders an error when fetching throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchContentTypes.mockRejectedValue(new Error('boom'));

    await renderPage('blogPost');
    expect(screen.getByText('boom')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('falls back to a generic error message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchContentTypes.mockRejectedValue({});

    await renderPage('blogPost');
    expect(
      screen.getByText('An error occurred fetching entries')
    ).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('uses the entry id as the title when no title fields exist', async () => {
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'blogPost' }, name: 'Blog Post' },
    ]);
    mockFetchEntries.mockResolvedValue([
      {
        sys: { id: 'abcdefgh2345', updatedAt: '2025-01-01T00:00:00Z' },
        fields: {},
      },
    ]);

    await renderPage('blogPost');
    expect(screen.getByText('Entry abcdefgh')).toBeInTheDocument();
  });

  it('handles an entry with no fields object and shows id-only content type', async () => {
    // content type has no name -> header falls back to the id
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'blogPost' } },
    ]);
    mockFetchEntries.mockResolvedValue([
      { sys: { id: 'xyz45678', updatedAt: '2025-01-01T00:00:00Z' } },
    ]);

    await renderPage('blogPost');
    // entry without fields -> falls back to id-based title
    expect(screen.getByText('Entry xyz45678')).toBeInTheDocument();
    // content type name falls back to the id in the header/breadcrumb
    expect(screen.getAllByText('blogPost').length).toBeGreaterThan(0);
  });
});
