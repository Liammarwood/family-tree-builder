import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { ModeProvider, useMode, MODE_LABELS } from '@/contexts/ModeContext';

// Test component that uses the mode context
function TestModeConsumer() {
  const { mode, setMode } = useMode();
  
  return (
    <div>
      <div data-testid="current-mode">{mode}</div>
      <div data-testid="mode-label">{MODE_LABELS[mode]}</div>
      <button onClick={() => setMode('family')}>Family</button>
      <button onClick={() => setMode('org')}>Org</button>
      <button onClick={() => setMode('generic')}>Generic</button>
    </div>
  );
}

describe('ModeContext', () => {
  it('provides default family mode', () => {
    render(
      <ModeProvider>
        <TestModeConsumer />
      </ModeProvider>
    );
    
    expect(screen.getByTestId('current-mode')).toHaveTextContent('family');
    expect(screen.getByTestId('mode-label')).toHaveTextContent('Family Tree');
  });

  it('allows switching to org mode', async () => {
    const user = userEvent.setup();
    render(
      <ModeProvider>
        <TestModeConsumer />
      </ModeProvider>
    );
    
    await user.click(screen.getByText('Org'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('org');
      expect(screen.getByTestId('mode-label')).toHaveTextContent('Org Chart');
    });
  });

  it('allows switching to generic mode', async () => {
    const user = userEvent.setup();
    render(
      <ModeProvider>
        <TestModeConsumer />
      </ModeProvider>
    );
    
    await user.click(screen.getByText('Generic'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('generic');
      expect(screen.getByTestId('mode-label')).toHaveTextContent('Generic Tree');
    });
  });

  it('allows switching between modes multiple times', async () => {
    const user = userEvent.setup();
    render(
      <ModeProvider>
        <TestModeConsumer />
      </ModeProvider>
    );
    
    // Start in family mode
    expect(screen.getByTestId('current-mode')).toHaveTextContent('family');
    
    // Switch to org
    await user.click(screen.getByText('Org'));
    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('org');
    });
    
    // Switch to generic
    await user.click(screen.getByText('Generic'));
    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('generic');
    });
    
    // Switch back to family
    await user.click(screen.getByText('Family'));
    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('family');
    });
  });

  it('throws error when useMode is used outside ModeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestModeConsumer />);
    }).toThrow('useMode must be used within a ModeProvider');
    
    consoleSpy.mockRestore();
  });

  it('provides all mode labels correctly', () => {
    expect(MODE_LABELS.family).toBe('Family Tree');
    expect(MODE_LABELS.org).toBe('Org Chart');
    expect(MODE_LABELS.generic).toBe('Generic Tree');
  });
});
