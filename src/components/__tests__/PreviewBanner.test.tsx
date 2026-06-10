import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PreviewBanner from '../PreviewBanner';

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock('next/link', () => {
  return function MockLink({ href, children, onClick }: any) {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  };
});

describe('PreviewBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders nothing when preview is not active', () => {
    const { container } = render(<PreviewBanner isPreview={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the banner and exit link when preview is active', () => {
    render(<PreviewBanner isPreview={true} />);
    expect(
      screen.getByText(/Preview Mode Active/)
    ).toBeInTheDocument();
    const link = screen.getByText('Exit Preview');
    expect(link).toHaveAttribute('href', '/api/exit-preview');
  });

  it('refreshes the router after a delay when exiting preview', () => {
    render(<PreviewBanner isPreview={true} />);
    fireEvent.click(screen.getByText('Exit Preview'));

    expect(mockRefresh).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
