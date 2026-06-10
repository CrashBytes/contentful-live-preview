import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnvDebug from '../EnvDebug';

describe('EnvDebug', () => {
  it('toggles the environment variable display', () => {
    render(<EnvDebug spaceId="space-1" environment="master" />);

    // Hidden by default
    expect(screen.queryByText(/CONTENTFUL_SPACE_ID:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Show Environment Variables'));
    expect(screen.getByText(/CONTENTFUL_SPACE_ID:/)).toBeInTheDocument();
    expect(screen.getByText(/space-1/)).toBeInTheDocument();
    expect(screen.getByText(/master/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide Environment Variables'));
    expect(screen.queryByText(/CONTENTFUL_SPACE_ID:/)).not.toBeInTheDocument();
  });

  it('shows "Not set" for empty values', () => {
    render(<EnvDebug spaceId="" environment="" />);
    fireEvent.click(screen.getByText('Show Environment Variables'));
    expect(screen.getAllByText('Not set')).toHaveLength(2);
  });
});
