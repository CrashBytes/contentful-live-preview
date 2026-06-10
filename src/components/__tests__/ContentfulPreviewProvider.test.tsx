import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentfulPreviewProvider from '../ContentfulPreviewProvider';

const mockProvider = jest.fn();

jest.mock('@contentful/live-preview/react', () => ({
  ContentfulLivePreviewProvider: (props: any) => {
    mockProvider(props);
    return <div data-testid="live-provider">{props.children}</div>;
  },
}));

describe('ContentfulPreviewProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children inside the live preview provider', () => {
    render(
      <ContentfulPreviewProvider>
        <span>child</span>
      </ContentfulPreviewProvider>
    );
    expect(screen.getByTestId('live-provider')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('defaults preview features to disabled', () => {
    render(
      <ContentfulPreviewProvider>
        <span>child</span>
      </ContentfulPreviewProvider>
    );
    expect(mockProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en-US',
        enableInspectorMode: false,
        enableLiveUpdates: false,
      })
    );
  });

  it('enables preview features when isPreviewActive is true', () => {
    render(
      <ContentfulPreviewProvider isPreviewActive>
        <span>child</span>
      </ContentfulPreviewProvider>
    );
    expect(mockProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        enableInspectorMode: true,
        enableLiveUpdates: true,
      })
    );
  });
});
