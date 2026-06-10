import React from 'react';
import { render, screen } from '@testing-library/react';
import Template from '../template';

jest.mock('@/components/ContentfulPreviewProvider', () => {
  return function MockProvider({ children, isPreviewActive }: any) {
    return (
      <div data-testid="provider" data-active={String(isPreviewActive)}>
        {children}
      </div>
    );
  };
});

describe('Template', () => {
  it('wraps children with the preview provider and forwards the flag', () => {
    render(
      <Template isPreviewActive>
        <span>page</span>
      </Template>
    );
    const provider = screen.getByTestId('provider');
    expect(provider).toHaveAttribute('data-active', 'true');
    expect(screen.getByText('page')).toBeInTheDocument();
  });
});
