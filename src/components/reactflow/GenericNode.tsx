import React from "react";
import { NodeProps } from "reactflow";
import { AltFamilyTreeNode } from "@/components/reactflow/AltFamilyTreeNode";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { useMode } from "@/contexts/ModeContext";

/**
 * GenericNode is a wrapper component that renders different node types based on the current mode.
 * 
 * Current behavior:
 * - family mode: Renders AltFamilyTreeNode (existing default)
 * - org mode: Renders AltFamilyTreeNode (TODO: implement OrgNode)
 * - generic mode: Renders AltFamilyTreeNode (TODO: implement GenericTreeNode)
 * 
 * This allows for future extension to support different node types without changing
 * the existing Family Tree behavior. Currently uses AltFamilyTreeNode for all modes
 * to preserve backward compatibility.
 */
export const GenericNode = (props: NodeProps<FamilyNodeData> & { preview?: boolean }) => {
  const { mode } = useMode();

  // For now, all modes use AltFamilyTreeNode to preserve existing behavior
  // Future PRs can add mode-specific node components here
  switch (mode) {
    case 'family':
      return <AltFamilyTreeNode {...props} />;
    case 'org':
      // TODO: Implement OrgNode component
      return <AltFamilyTreeNode {...props} />;
    case 'generic':
      // TODO: Implement GenericTreeNode component
      return <AltFamilyTreeNode {...props} />;
    default:
      return <AltFamilyTreeNode {...props} />;
  }
};
