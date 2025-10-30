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

function ExportConfigTestComponent() {
  const { 
    exportTitle, setExportTitle,
    showDates, setShowDates,
    nameFontSize, setNameFontSize,
    dateFontSize, setDateFontSize,
    nodeComponentType, setNodeComponentType
  } = useConfiguration();
  
  return (
    <div>
      <span data-testid="exportTitle">{exportTitle}</span>
      <span data-testid="showDates">{String(showDates)}</span>
      <span data-testid="nameFontSize">{nameFontSize}</span>
      <span data-testid="dateFontSize">{dateFontSize}</span>
      <span data-testid="nodeComponentType">{nodeComponentType}</span>
      <button onClick={() => setExportTitle('Test Family Tree')}>Set Title</button>
      <button onClick={() => setShowDates(false)}>Hide Dates</button>
      <button onClick={() => setNameFontSize(20)}>Set Name Font Size</button>
      <button onClick={() => setDateFontSize(14)}>Set Date Font Size</button>
      <button onClick={() => setNodeComponentType('FamilyTreeNode')}>Set Node Type</button>
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

  it('provides export configuration with default values', () => {
    render(
      <ConfigurationProvider>
        <ExportConfigTestComponent />
      </ConfigurationProvider>
    );

    expect(screen.getByTestId('exportTitle').textContent).toBe('');
    expect(screen.getByTestId('showDates').textContent).toBe('true');
    expect(screen.getByTestId('nameFontSize').textContent).toBe('16');
    expect(screen.getByTestId('dateFontSize').textContent).toBe('12');
    expect(screen.getByTestId('nodeComponentType').textContent).toBe('AltFamilyTreeNode');
  });

  it('allows setting export title', () => {
    render(
      <ConfigurationProvider>
        <ExportConfigTestComponent />
      </ConfigurationProvider>
    );

    fireEvent.click(screen.getByText('Set Title'));
    expect(screen.getByTestId('exportTitle').textContent).toBe('Test Family Tree');
  });

  it('allows toggling date visibility', () => {
    render(
      <ConfigurationProvider>
        <ExportConfigTestComponent />
      </ConfigurationProvider>
    );

    expect(screen.getByTestId('showDates').textContent).toBe('true');
    fireEvent.click(screen.getByText('Hide Dates'));
    expect(screen.getByTestId('showDates').textContent).toBe('false');
  });

  it('allows setting font sizes', () => {
    render(
      <ConfigurationProvider>
        <ExportConfigTestComponent />
      </ConfigurationProvider>
    );

    fireEvent.click(screen.getByText('Set Name Font Size'));
    expect(screen.getByTestId('nameFontSize').textContent).toBe('20');

    fireEvent.click(screen.getByText('Set Date Font Size'));
    expect(screen.getByTestId('dateFontSize').textContent).toBe('14');
  });

  it('allows setting node component type', () => {
    render(
      <ConfigurationProvider>
        <ExportConfigTestComponent />
      </ConfigurationProvider>
    );

    expect(screen.getByTestId('nodeComponentType').textContent).toBe('AltFamilyTreeNode');
    fireEvent.click(screen.getByText('Set Node Type'));
    expect(screen.getByTestId('nodeComponentType').textContent).toBe('FamilyTreeNode');
  });
});
