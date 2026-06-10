import React from 'react';
import { render } from '@testing-library/react';

jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

import RootLayout, { metadata } from '../layout';

describe('RootLayout', () => {
  it('exports metadata', () => {
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
  });

  it('renders children inside the body', () => {
    // RootLayout returns <html><body>; render its body subtree to assert.
    const tree = RootLayout({ children: <span>child content</span> }) as any;
    const html = tree;
    expect(html.type).toBe('html');
    const body = html.props.children;
    expect(body.type).toBe('body');
    // The child is rendered within the body
    expect(body.props.children).toBeDefined();
  });
});
