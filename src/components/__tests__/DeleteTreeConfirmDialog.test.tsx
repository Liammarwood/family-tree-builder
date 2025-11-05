import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteTreeConfirmDialog } from "@/components/DeleteTreeConfirmDialog";

const mockOnClose = jest.fn();
const mockOnConfirm = jest.fn();

describe("DeleteTreeConfirmDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with tree name", () => {
    render(
      <DeleteTreeConfirmDialog
        open={true}
        treeName="My Family Tree"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Delete Tree?")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "My Family Tree"/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  it("renders dialog without tree name", () => {
    render(
      <DeleteTreeConfirmDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete this tree/)).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <DeleteTreeConfirmDialog
        open={true}
        treeName="My Family Tree"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm when delete button is clicked", () => {
    render(
      <DeleteTreeConfirmDialog
        open={true}
        treeName="My Family Tree"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("does not render when open is false", () => {
    render(
      <DeleteTreeConfirmDialog
        open={false}
        treeName="My Family Tree"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText("Delete Tree?")).not.toBeInTheDocument();
  });
});
