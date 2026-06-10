import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentfulTest from '../ContentfulTest';

describe('ContentfulTest', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).fetch;
  });

  it('renders the initial error when provided', () => {
    render(<ContentfulTest initialError="boom" />);
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('shows a success result after a successful test', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        spaceId: 'space-1',
        environment: 'master',
        contentTypes: ['A', 'B'],
      }),
    });

    render(<ContentfulTest initialError={null} />);
    fireEvent.click(screen.getByText('Test Contentful Connection'));

    expect(screen.getByText('Testing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
    expect(screen.getByText('space-1')).toBeInTheDocument();
    expect(screen.getByText('A, B')).toBeInTheDocument();
  });

  it('shows an error returned in the response body', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ error: 'server failure' }),
    });

    render(<ContentfulTest initialError={null} />);
    fireEvent.click(screen.getByText('Test Contentful Connection'));

    await waitFor(() => {
      expect(screen.getByText('server failure')).toBeInTheDocument();
    });
  });

  it('shows a thrown error message', async () => {
    (global as any).fetch = jest
      .fn()
      .mockRejectedValue(new Error('network down'));

    render(<ContentfulTest initialError={null} />);
    fireEvent.click(screen.getByText('Test Contentful Connection'));

    await waitFor(() => {
      expect(screen.getByText('network down')).toBeInTheDocument();
    });
  });

  it('shows a generic message when the thrown error has none', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue({});

    render(<ContentfulTest initialError={null} />);
    fireEvent.click(screen.getByText('Test Contentful Connection'));

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred during the test')
      ).toBeInTheDocument();
    });
  });
});
