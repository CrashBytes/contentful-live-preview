import React from 'react';
import { render, screen } from '@testing-library/react';
import FieldRenderer from '../FieldRenderer';

// Mock the child components
jest.mock('../RichText', () => {
  return function MockRichText() {
    return <div data-testid="rich-text">Rich Text Content</div>;
  };
});

jest.mock('../ContentfulImage', () => {
  return function MockContentfulImage({ alt }: { alt: string }) {
    return <div data-testid="contentful-image" role="img" aria-label={alt} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>;
  };
});

describe('FieldRenderer', () => {
  describe('null and undefined handling', () => {
    it('should render "No value" for null', () => {
      render(<FieldRenderer fieldName="testField" fieldValue={null} />);
      expect(screen.getByText('No value')).toBeInTheDocument();
    });

    it('should render "No value" for undefined', () => {
      render(<FieldRenderer fieldName="testField" fieldValue={undefined} />);
      expect(screen.getByText('No value')).toBeInTheDocument();
    });
  });

  describe('Rich Text handling', () => {
    it('should render Rich Text with nodeType document', () => {
      const richText = {
        nodeType: 'document',
        content: [],
      };
      render(<FieldRenderer fieldName="body" fieldValue={richText} />);
      expect(screen.getByTestId('rich-text')).toBeInTheDocument();
    });

    it('should render Rich Text with content property', () => {
      const richText = {
        content: [],
      };
      render(<FieldRenderer fieldName="body" fieldValue={richText} />);
      expect(screen.getByTestId('rich-text')).toBeInTheDocument();
    });
  });

  describe('Asset handling', () => {
    it('should render image asset', () => {
      const asset = {
        sys: { type: 'Asset', id: 'asset-1' },
        fields: {
          title: 'Test Image',
          description: 'Test description',
          file: {
            url: '//images.ctfassets.net/test.jpg',
            contentType: 'image/jpeg',
            details: { image: { width: 800, height: 600 }, size: 102400 },
          },
        },
      };
      render(<FieldRenderer fieldName="image" fieldValue={asset} />);
      expect(screen.getByTestId('contentful-image')).toBeInTheDocument();
      expect(screen.getByText('Test Image')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render file asset download link', () => {
      const asset = {
        sys: { type: 'Asset', id: 'asset-1' },
        fields: {
          title: 'Test Document',
          file: {
            url: '//assets.ctfassets.net/test.pdf',
            contentType: 'application/pdf',
            details: { size: 204800 },
          },
        },
      };
      render(<FieldRenderer fieldName="document" fieldValue={asset} />);
      expect(screen.getByText('Test Document')).toBeInTheDocument();
      expect(screen.getByText('(200.0 KB)')).toBeInTheDocument();
    });

    it('should handle asset with linkType', () => {
      const asset = {
        sys: { linkType: 'Asset', id: 'asset-1' },
        fields: {
          file: {
            url: '//images.ctfassets.net/test.png',
            contentType: 'image/png',
          },
        },
      };
      render(<FieldRenderer fieldName="image" fieldValue={asset} />);
      expect(screen.getByTestId('contentful-image')).toBeInTheDocument();
    });

    it('should handle asset without file', () => {
      const asset = {
        sys: { type: 'Asset', id: 'asset-1' },
        fields: {},
      };
      render(<FieldRenderer fieldName="image" fieldValue={asset} />);
      expect(screen.getByText('Asset (no file)')).toBeInTheDocument();
    });
  });

  describe('Entry Reference handling', () => {
    it('should render entry link with title', () => {
      const entry = {
        sys: { type: 'Entry', id: 'entry-123' },
        fields: { title: 'Referenced Entry' },
      };
      render(<FieldRenderer fieldName="relatedEntry" fieldValue={entry} />);
      expect(screen.getByText('Referenced Entry')).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/entry/entry-123');
    });

    it('should render entry link with name field', () => {
      const entry = {
        sys: { type: 'Entry', id: 'entry-123' },
        fields: { name: 'Entry Name' },
      };
      render(<FieldRenderer fieldName="relatedEntry" fieldValue={entry} />);
      expect(screen.getByText('Entry Name')).toBeInTheDocument();
    });

    it('should render entry link with ID fallback', () => {
      const entry = {
        sys: { type: 'Entry', id: 'entry-123456789' },
        fields: {},
      };
      render(<FieldRenderer fieldName="relatedEntry" fieldValue={entry} />);
      expect(screen.getByText(/Entry: entry-12/)).toBeInTheDocument();
    });

    it('should handle entry with linkType', () => {
      const entry = {
        sys: { linkType: 'Entry', id: 'entry-123' },
        fields: { title: 'Linked Entry' },
      };
      render(<FieldRenderer fieldName="relatedEntry" fieldValue={entry} />);
      expect(screen.getByText('Linked Entry')).toBeInTheDocument();
    });
  });

  describe('Array handling', () => {
    it('should render empty array message', () => {
      render(<FieldRenderer fieldName="tags" fieldValue={[]} />);
      expect(screen.getByText('Empty array')).toBeInTheDocument();
    });

    it('should render array of primitives as list', () => {
      render(<FieldRenderer fieldName="tags" fieldValue={['tag1', 'tag2', 'tag3']} />);
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });

    it('should recursively render array of entries', () => {
      const entries = [
        { sys: { type: 'Entry', id: '1' }, fields: { title: 'Entry 1' } },
        { sys: { type: 'Entry', id: '2' }, fields: { title: 'Entry 2' } },
      ];
      render(<FieldRenderer fieldName="relatedEntries" fieldValue={entries} />);
      expect(screen.getByText('relatedEntries (2 items)')).toBeInTheDocument();
      expect(screen.getByText('Entry 1')).toBeInTheDocument();
      expect(screen.getByText('Entry 2')).toBeInTheDocument();
    });

    it('should recursively render array of assets', () => {
      const assets = [
        {
          sys: { type: 'Asset', id: '1' },
          fields: { file: { url: '//test.jpg', contentType: 'image/jpeg' } },
        },
      ];
      render(<FieldRenderer fieldName="media" fieldValue={assets} />);
      expect(screen.getByText('media (1 items)')).toBeInTheDocument();
    });
  });

  describe('Location handling', () => {
    it('should render location with lat/lon', () => {
      const location = { lat: 40.7128, lon: -74.006 };
      render(<FieldRenderer fieldName="location" fieldValue={location} />);
      expect(screen.getByText(/Latitude: 40.7128/)).toBeInTheDocument();
      expect(screen.getByText(/Longitude: -74.006/)).toBeInTheDocument();
    });
  });

  describe('Date handling', () => {
    it('should render date string', () => {
      render(<FieldRenderer fieldName="publishDate" fieldValue="2025-01-15T12:00:00Z" />);
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });
  });

  describe('Boolean handling', () => {
    it('should render true as "Yes"', () => {
      render(<FieldRenderer fieldName="published" fieldValue={true} />);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('should render false as "No"', () => {
      render(<FieldRenderer fieldName="published" fieldValue={false} />);
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  describe('Number handling', () => {
    it('should render number with locale formatting', () => {
      render(<FieldRenderer fieldName="views" fieldValue={1234567} />);
      expect(screen.getByText(/1,234,567/)).toBeInTheDocument();
    });
  });

  describe('Object handling', () => {
    it('should render JSON for complex objects', () => {
      const obj = { key: 'value', nested: { data: 'test' } };
      render(<FieldRenderer fieldName="metadata" fieldValue={obj} />);
      const pre = screen.getByRole('textbox', { hidden: true });
      expect(pre.textContent).toContain('"key"');
      expect(pre.textContent).toContain('"value"');
    });
  });

  describe('String handling', () => {
    it('should render string value', () => {
      render(<FieldRenderer fieldName="title" fieldValue="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should preserve whitespace in strings', () => {
      render(<FieldRenderer fieldName="content" fieldValue="Line 1\nLine 2" />);
      const element = screen.getByText(/Line 1/);
      expect(element).toHaveClass('whitespace-pre-wrap');
    });
  });
});
