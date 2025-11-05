import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteTreeDialog } from "@/components/DeleteTreeDialog";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";

// Mock the context
jest.mock("@/hooks/useFamilyTree");

const mockDeleteTree = jest.fn();
const mockOnClose = jest.fn();

const renderComponent = (props = { open: true }) => {
  (useFamilyTreeContext as jest.Mock).mockReturnValue({
    currentTree: { id: "tree-123", name: "Test Family Tree" },
    deleteTree: mockDeleteTree,
  });

  return render(
    <DeleteTreeDialog {...props} onClose={mockOnClose} />
  );
};

describe("DeleteTreeDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with tree name", () => {
    renderComponent();
    expect(screen.getByText("Delete Tree")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "Test Family Tree"/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    renderComponent();
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockDeleteTree).not.toHaveBeenCalled();
  });

  it("calls deleteTree and onClose when delete button is clicked", () => {
    renderComponent();
    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);
    expect(mockDeleteTree).toHaveBeenCalledTimes(1);
    expect(mockDeleteTree).toHaveBeenCalledWith("tree-123");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", () => {
    renderComponent({ open: false });
    expect(screen.queryByText("Delete Tree")).not.toBeInTheDocument();
  });

  it("does not crash if currentTree is null", () => {
    (useFamilyTreeContext as jest.Mock).mockReturnValue({
      currentTree: null,
      deleteTree: mockDeleteTree,
    });

    render(
      <DeleteTreeDialog open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByText("Delete Tree")).toBeInTheDocument();
    // Should not crash when displaying null tree name
  });

  it("does not call deleteTree if currentTree is null", () => {
    (useFamilyTreeContext as jest.Mock).mockReturnValue({
      currentTree: null,
      deleteTree: mockDeleteTree,
    });

    render(
      <DeleteTreeDialog open={true} onClose={mockOnClose} />
    );
    
    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockDeleteTree).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
