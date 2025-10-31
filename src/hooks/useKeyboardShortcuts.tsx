import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
}

/**
 * Hook to handle keyboard shortcuts for copy, paste, and delete operations
 * @param handlers Object containing callback functions for each shortcut
 * @param enabled Whether the shortcuts should be active
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
      
      // Don't trigger shortcuts when typing in input fields
      if (isInputField) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Copy: Ctrl+C (Windows/Linux) or Cmd+C (Mac)
      if (modifier && event.key === 'c' && handlers.onCopy) {
        event.preventDefault();
        handlers.onCopy();
      }
      
      // Paste: Ctrl+V (Windows/Linux) or Cmd+V (Mac)
      else if (modifier && event.key === 'v' && handlers.onPaste) {
        event.preventDefault();
        handlers.onPaste();
      }
      
      // Delete: Delete key or Backspace (Mac)
      else if ((event.key === 'Delete' || (isMac && event.key === 'Backspace')) && handlers.onDelete) {
        event.preventDefault();
        handlers.onDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, enabled]);
}
