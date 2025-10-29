import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigurationProvider, useConfiguration } from '@/hooks/useConfiguration';

function TestComponent() {
  const { showHandles, toggleHandles } = useConfiguration();
  return (
    <div>
      <span data-testid="value">{String(showHandles)}</span>
      <button onClick={toggleHandles}>Toggle</button>
    </div>
  );
}

describe('useConfiguration', () => {
  it('provides default and toggles', () => {
    render(
      <ConfigurationProvider>
        <TestComponent />
      </ConfigurationProvider>
    );

    expect(screen.getByTestId('value').textContent).toBe('true');
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('value').textContent).toBe('false');
  });
});
