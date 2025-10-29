import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorProvider, useError } from '@/hooks/useError';

function TestComponent() {
  const { showError } = useError();
  return (
    <button onClick={() => showError('Test message')}>Show</button>
  );
}

describe('useError / ErrorProvider', () => {
  it('shows an alert when showError is called', async () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    fireEvent.click(screen.getByText('Show'));

    const alert = await screen.findByText('Test message');
    expect(alert).toBeInTheDocument();
  });
});
