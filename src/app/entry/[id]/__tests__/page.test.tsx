import React from 'react';
import { render, screen } from '@testing-library/react';

const mockDraftMode = jest.fn();
const mockFetchEntry = jest.fn();
const mockFetchContentTypes = jest.fn();

jest.mock('next/headers', () => ({
  draftMode: () => mockDraftMode(),
}));

jest.mock('@/lib/contentful', () => ({
  fetchEntry: (...args: any[]) => mockFetchEntry(...args),
  fetchContentTypes: () => mockFetchContentTypes(),
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

jest.mock('@/components/ContentPreviewToggle', () => {
  return function MockToggle({ contentTypeName }: any) {
    return <div data-testid="toggle">{contentTypeName}</div>;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children }: any) {
    return <a href={href}>{children}</a>;
  };
});

import EntryPage from '../page';

const baseEntry = {
  sys: {
    id: 'entry-1',
    revision: 3,
    locale: 'en-US',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
    contentType: { sys: { id: 'blogPost' } },
  },
  fields: { title: 'Hello' },
};

async function renderPage(id: string) {
  const ui = await EntryPage({ params: Promise.resolve({ id }) });
  return render(ui);
}

describe('EntryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraftMode.mockResolvedValue({ isEnabled: false });
  });

  it('renders the entry with its content type and metadata', async () => {
    mockFetchEntry.mockResolvedValue(baseEntry);
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'blogPost' }, name: 'Blog Post' },
    ]);

    await renderPage('entry-1');
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByTestId('toggle')).toHaveTextContent('Blog Post');
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    // revision and locale shown
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('en-US')).toBeInTheDocument();
  });

  it('renders a not-found error when the entry is missing', async () => {
    mockFetchEntry.mockResolvedValue(null);

    await renderPage('missing');
    expect(screen.getByText('Entry "missing" not found')).toBeInTheDocument();
    expect(mockFetchContentTypes).not.toHaveBeenCalled();
  });

  it('renders an error when fetching throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchEntry.mockRejectedValue(new Error('kaboom'));

    await renderPage('entry-1');
    expect(screen.getByText('kaboom')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('falls back to a generic error message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchEntry.mockRejectedValue({});

    await renderPage('entry-1');
    expect(
      screen.getByText('An error occurred fetching entry')
    ).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('uses the id-based title and unknown content type when missing', async () => {
    mockFetchEntry.mockResolvedValue({
      ...baseEntry,
      fields: {},
    });
    // content type list does not include blogPost -> contentType undefined
    mockFetchContentTypes.mockResolvedValue([]);

    await renderPage('entry-1longidvalue');
    expect(screen.getByText(/Entry entry-1longi/)).toBeInTheDocument();
    // toggle falls back to the content type id
    expect(screen.getByTestId('toggle')).toHaveTextContent('blogPost');
  });

  it('shows "Unknown" content type when neither name nor id is present', async () => {
    mockFetchEntry.mockResolvedValue({
      ...baseEntry,
      sys: {
        ...baseEntry.sys,
        contentType: { sys: { id: undefined } },
      },
    });
    mockFetchContentTypes.mockResolvedValue([]);

    await renderPage('entry-1');
    expect(screen.getByTestId('toggle')).toHaveTextContent('Unknown');
  });

  it('shows default locale label when locale is absent', async () => {
    mockFetchEntry.mockResolvedValue({
      ...baseEntry,
      sys: { ...baseEntry.sys, locale: undefined },
    });
    mockFetchContentTypes.mockResolvedValue([
      { sys: { id: 'blogPost' }, name: 'Blog Post' },
    ]);

    await renderPage('entry-1');
    expect(screen.getByText('Default')).toBeInTheDocument();
  });
});
