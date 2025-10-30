import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpModal from '../HelpModal';

describe('HelpModal', () => {
  it('renders the help modal when open', () => {
    const mockOnClose = jest.fn();
    render(<HelpModal open={true} onClose={mockOnClose} />);
    
    // Check for main title
    expect(screen.getByText('Family Tree Builder - User Guide')).toBeInTheDocument();
  });

  it('renders all feature sections', () => {
    const mockOnClose = jest.fn();
    render(<HelpModal open={true} onClose={mockOnClose} />);
    
    // Check for main sections - using getAllByText for sections that appear multiple times
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Adding People')).toBeInTheDocument();
    expect(screen.getByText('Editing and Deleting')).toBeInTheDocument();
    expect(screen.getByText('Creating Manual Connections')).toBeInTheDocument();
    expect(screen.getByText('Layout and View Controls')).toBeInTheDocument();
    expect(screen.getByText('Export and Save')).toBeInTheDocument();
    // Import Data appears multiple times (header and list item), so use getAllByText
    expect(screen.getAllByText('Import Data').length).toBeGreaterThan(0);
    expect(screen.getByText('Tree Management')).toBeInTheDocument();
    expect(screen.getByText('Appearance Settings')).toBeInTheDocument();
    expect(screen.getByText('Sharing Your Tree')).toBeInTheDocument();
    expect(screen.getByText('Tips and Shortcuts')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    const mockOnClose = jest.fn();
    render(<HelpModal open={false} onClose={mockOnClose} />);
    
    // When closed, the main title should not be visible
    expect(screen.queryByText('Family Tree Builder - User Guide')).not.toBeInTheDocument();
  });

  it('renders action button', () => {
    const mockOnClose = jest.fn();
    render(<HelpModal open={true} onClose={mockOnClose} />);
    
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
  });
});
