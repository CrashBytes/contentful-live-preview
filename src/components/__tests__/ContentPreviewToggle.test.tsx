import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentPreviewToggle from '../ContentPreviewToggle';

jest.mock('../FieldRenderer', () => {
  return function MockFieldRenderer({ fieldName }: any) {
    return <div data-testid={`field-${fieldName}`}>{fieldName}</div>;
  };
});

describe('ContentPreviewToggle', () => {
  const richEntry = {
    fields: {
      title: 'My Title',
      excerpt: 'A summary excerpt',
      author: 'Jane Doe',
      publishDate: '2025-01-15T00:00:00Z',
      image: { sys: { type: 'Asset' }, fields: {} },
      body: { nodeType: 'document', content: [] },
      customField: 'extra',
    },
  };

  it('renders the preview view by default with detected fields', () => {
    render(
      <ContentPreviewToggle entry={richEntry} contentTypeName="Blog Post" />
    );

    expect(screen.getByText('Blog Post')).toBeInTheDocument();
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('A summary excerpt')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    // Date formatted (day may shift by timezone, so match month + year)
    expect(screen.getByText(/January \d{1,2}, 2025/)).toBeInTheDocument();
    // Hero image and body rendered through FieldRenderer
    expect(screen.getByTestId('field-image')).toBeInTheDocument();
    expect(screen.getByTestId('field-content')).toBeInTheDocument();
    // Additional non-standard field shown
    expect(screen.getByTestId('field-customField')).toBeInTheDocument();
  });

  it('switches to the debug view and back', () => {
    render(
      <ContentPreviewToggle entry={richEntry} contentTypeName="Blog Post" />
    );

    fireEvent.click(screen.getByText('Debug'));
    // Debug view shows each field with its type label and raw JSON details
    expect(screen.getAllByText('title').length).toBeGreaterThan(0);
    expect(screen.getAllByText('▶ Show raw JSON').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('handles entries with no fields object', () => {
    render(<ContentPreviewToggle entry={{}} contentTypeName="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    // No title rendered, but the badge and structure are present
    expect(
      screen.getByText('Additional Information')
    ).toBeInTheDocument();
  });

  it('handles the debug view for an entry with no fields object', () => {
    render(<ContentPreviewToggle entry={{}} contentTypeName="Empty" />);
    fireEvent.click(screen.getByText('Debug'));
    // Debug view renders without crashing; no field cards present
    expect(screen.queryByText('▶ Show raw JSON')).not.toBeInTheDocument();
  });

  it('renders title from entry references and numbers', () => {
    const entry = {
      fields: {
        // title resolves to an entry reference with a nested title
        title: { fields: { title: 'Nested Title' } },
        // author resolves to a number
        author: 42,
        // date is a non-string / non-Date value
        publishDate: 12345,
      },
    };
    render(<ContentPreviewToggle entry={entry} contentTypeName="Ref" />);
    expect(screen.getByText('Nested Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('renders title from a name field and array values', () => {
    const entry = {
      fields: {
        name: 'By Name',
        author: [
          { fields: { name: 'Author One' } },
          { fields: { title: 'Author Two' } },
        ],
      },
    };
    render(<ContentPreviewToggle entry={entry} contentTypeName="ArrayCase" />);
    expect(screen.getByText('By Name')).toBeInTheDocument();
    expect(screen.getByText('Author One, Author Two')).toBeInTheDocument();
  });

  it('stringifies an unrecognized field value as a fallback', () => {
    const entry = {
      fields: {
        // author is an object without fields.title/name and an empty array
        // forces renderFieldValue down to its String(field) fallback.
        title: { some: 'object' },
        author: [],
      },
    };
    render(<ContentPreviewToggle entry={entry} contentTypeName="Fallback" />);
    // [object Object] from the title fallback
    expect(screen.getByText('[object Object]')).toBeInTheDocument();
  });

  it('formats a Date instance in the date field', () => {
    const entry = {
      fields: { title: 'D', date: new Date('2025-03-20T12:00:00Z') },
    };
    render(<ContentPreviewToggle entry={entry} contentTypeName="DateObj" />);
    expect(screen.getByText(/March \d{1,2}, 2025/)).toBeInTheDocument();
  });

  it('does not show excerpt when it equals the title', () => {
    const entry = { fields: { title: 'Same', description: 'Same' } };
    render(<ContentPreviewToggle entry={entry} contentTypeName="Dup" />);
    // Title appears once; excerpt paragraph suppressed because excerpt===title
    expect(screen.getAllByText('Same')).toHaveLength(1);
  });
});
