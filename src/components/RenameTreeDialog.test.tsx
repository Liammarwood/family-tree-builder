import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RenameTreeDialog } from "./RenameTreeDialog";
import { ErrorProvider } from "@/hooks/useError";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";

// Mock the context
jest.mock("@/hooks/useFamilyTree");

const mockRenameTree = jest.fn();
const mockOnClose = jest.fn();

const renderComponent = (props = { open: true }) => {
  (useFamilyTreeContext as jest.Mock).mockReturnValue({
    currentTree: { id: "tree-123", name: "Original Name" },
    renameTree: mockRenameTree,
  });

  return render(
    <ErrorProvider>
      <RenameTreeDialog {...props} onClose={mockOnClose} />
    </ErrorProvider>
  );
};

describe("RenameTreeDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with pre-filled tree name", () => {
    renderComponent();
    const input = screen.getByLabelText("Tree Name") as HTMLInputElement;
    expect(input.value).toBe("Original Name");

    expect(screen.getByText("Rename Tree")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  it("updates input value when user types", () => {
    renderComponent();
    const input = screen.getByLabelText("Tree Name") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "New Name" } });
    expect(input.value).toBe("New Name");
  });

  it("calls onClose when cancel button is clicked", () => {
    renderComponent();
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call renameTree if name is unchanged", async () => {
    renderComponent();
    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRenameTree).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call renameTree if name is empty", async () => {
    renderComponent();
    const input = screen.getByLabelText("Tree Name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "   " } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRenameTree).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("calls renameTree with trimmed new name and closes dialog", async () => {
    renderComponent();
    const input = screen.getByLabelText("Tree Name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  New Tree Name  " } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRenameTree).toHaveBeenCalledTimes(1);
      expect(mockRenameTree).toHaveBeenCalledWith("tree-123", "New Tree Name");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("prefills input correctly when dialog is reopened with a different tree", () => {
    const { rerender } = render(
      <ErrorProvider>
        <RenameTreeDialog
          open={true}
          onClose={mockOnClose}
        />
      </ErrorProvider>
    );

    // Initial tree
    (useFamilyTreeContext as jest.Mock).mockReturnValue({
      currentTree: { id: "tree-456", name: "Another Tree" },
      renameTree: mockRenameTree,
    });

    // Reopen dialog
    rerender(
      <ErrorProvider>
        <RenameTreeDialog open={true} onClose={mockOnClose} />
      </ErrorProvider>
    );
    const input = screen.getByLabelText("Tree Name") as HTMLInputElement;
    expect(input.value).toBe("Another Tree");
  });

  it("handles async renameTree errors but still closes dialog", async () => {
    mockRenameTree.mockRejectedValueOnce(new Error("Rename failed"));

    renderComponent();
    const input = screen.getByLabelText("Tree Name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New Name" } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRenameTree).toHaveBeenCalledWith("tree-123", "New Name");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
