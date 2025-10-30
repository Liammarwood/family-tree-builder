import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShareModal } from '../ShareModal';
import * as firestoreSignaling from '@/hooks/useFirestoreSignaling';
import * as familyTreeContext from '@/hooks/useFamilyTree';
import * as errorHook from '@/hooks/useError';
import { logger } from '@/libs/logger';

// Mock the hooks and dependencies
jest.mock('@/hooks/useFirestoreSignaling');
jest.mock('@/hooks/useFamilyTree');
jest.mock('@/hooks/useError');
jest.mock('@/libs/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock QRCodeSVG component
jest.mock('qrcode.react', () => ({
  QRCodeSVG: () => <div data-testid="qr-code">QR Code</div>,
}));

// Mock RequireAuth to render children directly
jest.mock('@/components/RequireAuth', () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock TreeMergeDialog
jest.mock('@/components/TreeMergeDialog', () => ({
  TreeMergeDialog: () => <div data-testid="tree-merge-dialog">Tree Merge Dialog</div>,
}));

// Store data channel instance for testing
let mockDataChannelInstance: any = null;

describe('ShareModal', () => {
  let mockShowError: jest.Mock;
  let mockCreateOffer: jest.Mock;
  let mockJoinCall: jest.Mock;
  let mockSaveTree: jest.Mock;
  let mockPeerConnection: any;
  
  const mockCurrentTree = {
    id: 'tree-123',
    name: 'Test Family Tree',
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockDataChannelInstance = null;

    // Setup mock implementations
    mockShowError = jest.fn();
    mockCreateOffer = jest.fn().mockResolvedValue('test-call-id');
    mockJoinCall = jest.fn().mockResolvedValue(undefined);
    mockSaveTree = jest.fn();

    (errorHook.useError as jest.Mock).mockReturnValue({
      showError: mockShowError,
    });

    (firestoreSignaling.useFirestoreSignaling as jest.Mock).mockReturnValue({
      createOffer: mockCreateOffer,
      joinCall: mockJoinCall,
    });

    (familyTreeContext.useFamilyTreeContext as jest.Mock).mockReturnValue({
      isDbReady: true,
      trees: [],
      saveTree: mockSaveTree,
      currentTree: mockCurrentTree,
    });

    // Setup RTCPeerConnection mock
    mockPeerConnection = {
      createDataChannel: jest.fn((name: string) => {
        mockDataChannelInstance = {
          label: name,
          readyState: 'open',
          send: jest.fn(),
          close: jest.fn(),
          onopen: null as any,
          onmessage: null as any,
          onerror: null as any,
          onclose: null as any,
        };
        return mockDataChannelInstance;
      }),
      ondatachannel: null as any,
      onconnectionstatechange: null as any,
      onicecandidate: null as any,
      close: jest.fn(),
      connectionState: 'new',
    };

    global.RTCPeerConnection = jest.fn().mockImplementation(() => mockPeerConnection) as any;
  });

  it('renders the share modal when open', () => {
    const mockOnClose = jest.fn();
    render(<ShareModal open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Share Family Tree')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    const mockOnClose = jest.fn();
    render(<ShareModal open={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Share Family Tree')).not.toBeInTheDocument();
  });

  describe('Data Channel - Sending', () => {
    it('should check if currentTree exists before sending', async () => {
      // Mock currentTree as null
      (familyTreeContext.useFamilyTreeContext as jest.Mock).mockReturnValue({
        isDbReady: true,
        trees: [],
        saveTree: mockSaveTree,
        currentTree: null,
      });

      const mockOnClose = jest.fn();
      render(<ShareModal open={true} onClose={mockOnClose} />);

      // Click the "Share" button to create an offer
      const shareButton = screen.getByRole('button', { name: /Share.*Family Tree/i });
      fireEvent.click(shareButton);

      // Wait for the async operation
      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalled();
      });

      // Trigger the data channel open event
      if (mockDataChannelInstance && mockDataChannelInstance.onopen) {
        mockDataChannelInstance.onopen({} as Event);
      }

      // Verify that an error is logged and shown
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(
          'Cannot send family tree: currentTree is null or undefined'
        );
      });
      expect(mockShowError).toHaveBeenCalledWith(
        'Cannot share tree: No tree is currently loaded.'
      );
    });

    it('should check data channel readyState before sending', async () => {
      // Override the mock to return a data channel with 'connecting' state
      mockPeerConnection.createDataChannel = jest.fn((name: string) => {
        mockDataChannelInstance = {
          label: name,
          readyState: 'connecting',
          send: jest.fn(),
          close: jest.fn(),
          onopen: null as any,
          onmessage: null as any,
          onerror: null as any,
          onclose: null as any,
        };
        return mockDataChannelInstance;
      });

      const mockOnClose = jest.fn();
      render(<ShareModal open={true} onClose={mockOnClose} />);

      // Click the "Share" button to create an offer
      const shareButton = screen.getByRole('button', { name: /Share.*Family Tree/i });
      fireEvent.click(shareButton);

      // Wait for the async operation
      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalled();
      });

      // Trigger the onopen event even though readyState is 'connecting'
      if (mockDataChannelInstance && mockDataChannelInstance.onopen) {
        mockDataChannelInstance.onopen({} as Event);
      }

      // Verify that an error is logged
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining("Cannot send data: data channel state is connecting")
        );
      });
      expect(mockShowError).toHaveBeenCalledWith(
        'Cannot share tree: Connection not ready.'
      );
    });

    it('should successfully send data when currentTree exists and channel is open', async () => {
      const mockOnClose = jest.fn();
      render(<ShareModal open={true} onClose={mockOnClose} />);

      // Click the "Share" button to create an offer
      const shareButton = screen.getByRole('button', { name: /Share.*Family Tree/i });
      fireEvent.click(shareButton);

      // Wait for the async operation
      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalled();
      });

      // Trigger the onopen event
      if (mockDataChannelInstance && mockDataChannelInstance.onopen) {
        mockDataChannelInstance.onopen({} as Event);
      }

      // Verify that send was called with the tree data
      await waitFor(() => {
        expect(mockDataChannelInstance.send).toHaveBeenCalledWith(
          JSON.stringify(mockCurrentTree)
        );
      });
      expect(logger.info).toHaveBeenCalledWith('Family tree sent successfully');
    });
  });

  describe('Data Channel - Receiving', () => {
    it('should log received data and parse it correctly', async () => {
      const receivedTree = {
        id: 'tree-456',
        name: 'Received Family Tree',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockOnClose = jest.fn();
      render(<ShareModal open={true} onClose={mockOnClose} />);

      // Click the "Share" button to initialize connection
      const shareButton = screen.getByRole('button', { name: /Share.*Family Tree/i });
      fireEvent.click(shareButton);

      // Wait for the async operation
      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalled();
      });

      // Simulate receiving a message
      const messageEvent = {
        data: JSON.stringify(receivedTree),
      } as MessageEvent;

      if (mockDataChannelInstance && mockDataChannelInstance.onmessage) {
        mockDataChannelInstance.onmessage(messageEvent);
      }

      // Verify that the data was logged and parsed
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith(
          expect.stringContaining('Received data')
        );
      });
      expect(logger.info).toHaveBeenCalledWith(
        `Successfully parsed family tree: ${receivedTree.name}`
      );
      // The received tree will be parsed from JSON, so dates will be strings
      expect(mockSaveTree).toHaveBeenCalledWith(
        expect.objectContaining({
          id: receivedTree.id,
          name: receivedTree.name,
          members: receivedTree.members,
        })
      );
    });

    it('should handle invalid JSON data gracefully', async () => {
      const mockOnClose = jest.fn();
      render(<ShareModal open={true} onClose={mockOnClose} />);

      // Click the "Share" button to initialize connection
      const shareButton = screen.getByRole('button', { name: /Share.*Family Tree/i });
      fireEvent.click(shareButton);

      // Wait for the async operation
      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalled();
      });

      // Simulate receiving invalid JSON
      const messageEvent = {
        data: 'invalid json data',
      } as MessageEvent;

      if (mockDataChannelInstance && mockDataChannelInstance.onmessage) {
        mockDataChannelInstance.onmessage(messageEvent);
      }

      // Verify that an error is logged and shown
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(
          'Failed to parse received message as family tree',
          expect.any(Error)
        );
      });
      expect(mockShowError).toHaveBeenCalledWith(
        'Received invalid data. The transfer may have failed.'
      );
    });
  });

  describe('Data Channel - Error Handling', () => {
    it('should log detailed error information on data channel error', async () => {
      const mockOnClose = jest.fn();
      render(<ShareModal open={true} onClose={mockOnClose} />);

      // Click the "Share" button to initialize connection
      const shareButton = screen.getByRole('button', { name: /Share.*Family Tree/i });
      fireEvent.click(shareButton);

      // Wait for the async operation
      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalled();
      });

      // Simulate a data channel error
      const errorEvent = new Event('error') as any;

      if (mockDataChannelInstance && mockDataChannelInstance.onerror) {
        mockDataChannelInstance.onerror(errorEvent);
      }

      // Verify that the error is logged
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(
          'Data channel error occurred',
          errorEvent
        );
      });
      expect(mockShowError).toHaveBeenCalledWith(
        'A data channel error occurred. The transfer may have failed.'
      );
    });
  });
});
