import React from 'react';
import { render, screen } from '@testing-library/react';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import RichText from '../RichText';

const mockUseLiveUpdates = jest.fn();

jest.mock('@contentful/live-preview/react', () => ({
  useContentfulLiveUpdates: (content: any) => mockUseLiveUpdates(content),
}));

jest.mock('next/link', () => {
  return function MockLink({ href, children }: any) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('../ContentfulImage', () => {
  return function MockContentfulImage() {
    return <img data-testid="embedded-image" alt="" />;
  };
});

// Helpers to build rich text nodes.
const text = (value: string, marks: { type: string }[] = []) => ({
  nodeType: 'text',
  value,
  marks,
  data: {},
});

const para = (children: any[]) => ({
  nodeType: BLOCKS.PARAGRAPH,
  data: {},
  content: children,
});

function doc(content: any[]) {
  return { nodeType: BLOCKS.DOCUMENT, data: {}, content } as any;
}

describe('RichText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // By default echo the content back through the live-updates hook.
    mockUseLiveUpdates.mockImplementation((c) => c);
  });

  it('returns null when there is no live content', () => {
    mockUseLiveUpdates.mockReturnValue(null);
    const { container } = render(<RichText content={doc([])} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all text marks', () => {
    render(
      <RichText
        content={doc([
          para([
            text('bold', [{ type: MARKS.BOLD }]),
            text('italic', [{ type: MARKS.ITALIC }]),
            text('underline', [{ type: MARKS.UNDERLINE }]),
            text('code', [{ type: MARKS.CODE }]),
          ]),
        ])}
      />
    );
    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByText('italic').tagName).toBe('EM');
    expect(screen.getByText('underline').tagName).toBe('U');
    expect(screen.getByText('code').tagName).toBe('CODE');
  });

  it('renders all heading levels, lists, quote and hr', () => {
    render(
      <RichText
        content={doc([
          { nodeType: BLOCKS.HEADING_1, data: {}, content: [text('h1')] },
          { nodeType: BLOCKS.HEADING_2, data: {}, content: [text('h2')] },
          { nodeType: BLOCKS.HEADING_3, data: {}, content: [text('h3')] },
          { nodeType: BLOCKS.HEADING_4, data: {}, content: [text('h4')] },
          { nodeType: BLOCKS.HEADING_5, data: {}, content: [text('h5')] },
          { nodeType: BLOCKS.HEADING_6, data: {}, content: [text('h6')] },
          {
            nodeType: BLOCKS.UL_LIST,
            data: {},
            content: [
              {
                nodeType: BLOCKS.LIST_ITEM,
                data: {},
                content: [para([text('ulitem')])],
              },
            ],
          },
          {
            nodeType: BLOCKS.OL_LIST,
            data: {},
            content: [
              {
                nodeType: BLOCKS.LIST_ITEM,
                data: {},
                content: [para([text('olitem')])],
              },
            ],
          },
          {
            nodeType: BLOCKS.QUOTE,
            data: {},
            content: [para([text('quoted')])],
          },
          { nodeType: BLOCKS.HR, data: {}, content: [] },
        ])}
      />
    );
    expect(screen.getByText('h1').tagName).toBe('H1');
    expect(screen.getByText('h2').tagName).toBe('H2');
    expect(screen.getByText('h3').tagName).toBe('H3');
    expect(screen.getByText('h4').tagName).toBe('H4');
    expect(screen.getByText('h5').tagName).toBe('H5');
    expect(screen.getByText('h6').tagName).toBe('H6');
    expect(screen.getByText('ulitem')).toBeInTheDocument();
    expect(screen.getByText('olitem')).toBeInTheDocument();
    expect(screen.getByText('quoted').closest('blockquote')).toBeInTheDocument();
  });

  it('renders an embedded asset when the target is complete', () => {
    render(
      <RichText
        content={doc([
          {
            nodeType: BLOCKS.EMBEDDED_ASSET,
            data: {
              target: {
                sys: { id: 'asset-1' },
                fields: { file: { url: '//x.jpg' } },
              },
            },
            content: [],
          },
        ])}
      />
    );
    expect(screen.getByTestId('embedded-image')).toBeInTheDocument();
  });

  it('renders nothing for an incomplete embedded asset', () => {
    const { container } = render(
      <RichText
        content={doc([
          {
            nodeType: BLOCKS.EMBEDDED_ASSET,
            data: { target: { sys: { id: 'asset-1' } } },
            content: [],
          },
        ])}
      />
    );
    expect(container.querySelector('[data-testid="embedded-image"]')).toBeNull();
  });

  it('renders internal hyperlinks via next/link', () => {
    render(
      <RichText
        content={doc([
          para([
            {
              nodeType: INLINES.HYPERLINK,
              data: { uri: '/internal' },
              content: [text('internal link')],
            },
          ]),
        ])}
      />
    );
    const link = screen.getByText('internal link');
    expect(link.closest('a')).toHaveAttribute('href', '/internal');
  });

  it('renders external hyperlinks in a new tab', () => {
    render(
      <RichText
        content={doc([
          para([
            {
              nodeType: INLINES.HYPERLINK,
              data: { uri: 'https://example.com' },
              content: [text('external link')],
            },
          ]),
        ])}
      />
    );
    const anchor = screen.getByText('external link').closest('a')!;
    expect(anchor).toHaveAttribute('href', 'https://example.com');
    expect(anchor).toHaveAttribute('target', '_blank');
  });

  it('renders entry hyperlinks to pages with a slug', () => {
    render(
      <RichText
        content={doc([
          para([
            {
              nodeType: INLINES.ENTRY_HYPERLINK,
              data: {
                target: {
                  sys: { contentType: { sys: { id: 'page' } } },
                  fields: { slug: 'my-page' },
                },
              },
              content: [text('page link')],
            },
          ]),
        ])}
      />
    );
    const link = screen.getByText('page link');
    expect(link.closest('a')).toHaveAttribute('href', '/my-page');
  });

  it('renders entry hyperlinks without a page target as plain text', () => {
    render(
      <RichText
        content={doc([
          para([
            {
              nodeType: INLINES.ENTRY_HYPERLINK,
              data: {
                target: {
                  sys: { contentType: { sys: { id: 'other' } } },
                  fields: {},
                },
              },
              content: [text('plain entry')],
            },
          ]),
        ])}
      />
    );
    const span = screen.getByText('plain entry');
    expect(span.tagName).toBe('SPAN');
    expect(span.closest('a')).toBeNull();
  });
});
