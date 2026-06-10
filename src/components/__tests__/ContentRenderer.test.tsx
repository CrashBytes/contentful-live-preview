import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentRenderer from '../ContentRenderer';

jest.mock('../RichText', () => {
  return function MockRichText({ content }: any) {
    return <div data-testid="rich-text">{content?.nodeType}</div>;
  };
});

describe('ContentRenderer', () => {
  it('renders the RichText component with the provided content', () => {
    const content = { nodeType: 'document', content: [] } as any;
    render(<ContentRenderer content={content} entryId="abc" />);
    const richText = screen.getByTestId('rich-text');
    expect(richText).toBeInTheDocument();
    expect(richText).toHaveTextContent('document');
  });
});
