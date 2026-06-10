import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentfulImage from '../ContentfulImage';

const mockUseLiveUpdates = jest.fn();

jest.mock('@contentful/live-preview/react', () => ({
  useContentfulLiveUpdates: (asset: any) => mockUseLiveUpdates(asset),
}));

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img data-testid="next-image" {...props} />;
  };
});

describe('ContentfulImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when the live asset has no file', () => {
    mockUseLiveUpdates.mockReturnValue({ fields: {} });
    const { container } = render(<ContentfulImage asset={{} as any} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when the live asset is undefined', () => {
    mockUseLiveUpdates.mockReturnValue(undefined);
    const { container } = render(<ContentfulImage asset={{} as any} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an image using dimensions from the asset details', () => {
    mockUseLiveUpdates.mockReturnValue({
      fields: {
        title: 'A title',
        file: {
          url: '//images.ctfassets.net/pic.jpg',
          details: { image: { width: 1200, height: 900 } },
        },
      },
    });

    render(<ContentfulImage asset={{} as any} />);
    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('src', 'https://images.ctfassets.net/pic.jpg');
    expect(img).toHaveAttribute('width', '1200');
    expect(img).toHaveAttribute('height', '900');
    expect(img).toHaveAttribute('alt', 'A title');
  });

  it('falls back to default dimensions and empty alt when missing', () => {
    mockUseLiveUpdates.mockReturnValue({
      fields: {
        file: { url: '//images.ctfassets.net/pic.jpg' },
      },
    });

    render(<ContentfulImage asset={{} as any} />);
    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
    expect(img).toHaveAttribute('alt', '');
  });

  it('prefers explicit width/height and alt props', () => {
    mockUseLiveUpdates.mockReturnValue({
      fields: {
        title: 'ignored',
        file: {
          url: '//images.ctfassets.net/pic.jpg',
          details: { image: { width: 1200, height: 900 } },
        },
      },
    });

    render(
      <ContentfulImage
        asset={{} as any}
        width={300}
        height={200}
        alt="explicit"
      />
    );
    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('width', '300');
    expect(img).toHaveAttribute('height', '200');
    expect(img).toHaveAttribute('alt', 'explicit');
  });
});
