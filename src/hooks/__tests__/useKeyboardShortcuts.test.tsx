import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockOnCopy: jest.Mock;
  let mockOnPaste: jest.Mock;
  let mockOnDelete: jest.Mock;

  beforeEach(() => {
    mockOnCopy = jest.fn();
    mockOnPaste = jest.fn();
    mockOnDelete = jest.fn();
  });

  it('calls onCopy when Ctrl+C is pressed', () => {
    renderHook(() => useKeyboardShortcuts({ onCopy: mockOnCopy }));
    
    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true });
    window.dispatchEvent(event);
    
    expect(mockOnCopy).toHaveBeenCalledTimes(1);
  });

  it('calls onPaste when Ctrl+V is pressed', () => {
    renderHook(() => useKeyboardShortcuts({ onPaste: mockOnPaste }));
    
    const event = new KeyboardEvent('keydown', { key: 'v', ctrlKey: true });
    window.dispatchEvent(event);
    
    expect(mockOnPaste).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when Delete key is pressed', () => {
    renderHook(() => useKeyboardShortcuts({ onDelete: mockOnDelete }));
    
    const event = new KeyboardEvent('keydown', { key: 'Delete' });
    window.dispatchEvent(event);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('does not trigger shortcuts when typing in input field', () => {
    renderHook(() => useKeyboardShortcuts({ onCopy: mockOnCopy }));
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    
    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });
    input.dispatchEvent(event);
    
    expect(mockOnCopy).not.toHaveBeenCalled();
    
    document.body.removeChild(input);
  });

  it('does not trigger shortcuts when disabled', () => {
    renderHook(() => useKeyboardShortcuts({ onCopy: mockOnCopy }, false));
    
    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true });
    window.dispatchEvent(event);
    
    expect(mockOnCopy).not.toHaveBeenCalled();
  });

  it('handles Mac keyboard shortcuts (Cmd+C)', () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });

    renderHook(() => useKeyboardShortcuts({ onCopy: mockOnCopy }));
    
    const event = new KeyboardEvent('keydown', { key: 'c', metaKey: true });
    window.dispatchEvent(event);
    
    expect(mockOnCopy).toHaveBeenCalledTimes(1);
  });

  it('handles Backspace as delete on Mac', () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });

    renderHook(() => useKeyboardShortcuts({ onDelete: mockOnDelete }));
    
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    window.dispatchEvent(event);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
