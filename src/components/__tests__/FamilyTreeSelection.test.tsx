import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FamilyTreeSection } from "@/components/FamilyTreeSelection";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";

// Mock the context
jest.mock("@/hooks/useFamilyTree");

const mockSetSelectedTreeId = jest.fn();
const mockCreateTree = jest.fn();
const mockOnClose = jest.fn();

const renderComponent = (props = { open: true, onClose: mockOnClose }) => {
  (useFamilyTreeContext as jest.Mock).mockReturnValue({
    trees: [
      { id: "tree-1", name: "Smith Family" },
      { id: "tree-2", name: "Jones Family" },
    ],
    selectedTreeId: "tree-1",
    setSelectedTreeId: mockSetSelectedTreeId,
    createTree: mockCreateTree,
  });

  return render(<FamilyTreeSection {...props} />);
};

describe("FamilyTreeSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with the current selected tree as default value", () => {
    renderComponent();
    const select = screen.getByLabelText("Select Family Tree") as HTMLInputElement;
    // MUI Select stores the value internally and displays it
    expect(screen.getByText("Smith Family")).toBeInTheDocument();
  });

  it("resets to current selection when modal is reopened", async () => {
    const { rerender } = renderComponent({ open: false, onClose: mockOnClose });
    
    // Mock a different selected tree
    (useFamilyTreeContext as jest.Mock).mockReturnValue({
      trees: [
        { id: "tree-1", name: "Smith Family" },
        { id: "tree-2", name: "Jones Family" },
      ],
      selectedTreeId: "tree-2",
      setSelectedTreeId: mockSetSelectedTreeId,
      createTree: mockCreateTree,
    });

    // Reopen modal
    rerender(<FamilyTreeSection open={true} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText("Jones Family")).toBeInTheDocument();
    });
  });

  it("allows switching to a different tree", async () => {
    renderComponent();
    
    // Open the select dropdown
    const selectButton = screen.getByRole("combobox");
    fireEvent.mouseDown(selectButton);
    
    // Select a different tree
    await waitFor(() => {
      const option = screen.getByRole("option", { name: "Jones Family" });
      fireEvent.click(option);
    });
    
    // Click Save
    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSetSelectedTreeId).toHaveBeenCalledWith("tree-2");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("allows creating a new tree", async () => {
    renderComponent();
    
    // Open the select dropdown
    const selectButton = screen.getByRole("combobox");
    fireEvent.mouseDown(selectButton);
    
    // Select "Create New Family Tree" option
    await waitFor(() => {
      const createOption = screen.getByRole("option", { name: "+ Create New Family Tree" });
      fireEvent.click(createOption);
    });
    
    // Enter new tree name
    const input = screen.getByLabelText("New Family Tree Name");
    fireEvent.change(input, { target: { value: "New Family" } });
    
    // Click Save
    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreateTree).toHaveBeenCalledWith("New Family");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("prevents closing when no tree is selected", () => {
    (useFamilyTreeContext as jest.Mock).mockReturnValue({
      trees: [{ id: "tree-1", name: "Smith Family" }],
      selectedTreeId: null,
      setSelectedTreeId: mockSetSelectedTreeId,
      createTree: mockCreateTree,
    });

    render(<FamilyTreeSection open={true} onClose={mockOnClose} />);
    
    // Try to close without selecting
    const backdrop = screen.getByRole("presentation").firstChild;
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    
    // Should not have called onClose
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("shows create new tree form when no trees exist", () => {
    (useFamilyTreeContext as jest.Mock).mockReturnValue({
      trees: [],
      selectedTreeId: null,
      setSelectedTreeId: mockSetSelectedTreeId,
      createTree: mockCreateTree,
    });

    render(<FamilyTreeSection open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText("Create New Family Tree")).toBeInTheDocument();
    expect(screen.getByLabelText("New Family Tree Name")).toBeInTheDocument();
    expect(screen.queryByLabelText("Select Family Tree")).not.toBeInTheDocument();
  });
});
