import { EditMode } from "@/types/EditMode";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import {Node} from "reactflow";

// Centralized spacing constants used across layout and node components
export const NODE_WIDTH = 220; //180;
export const NODE_HEIGHT = 320;
// Default spacing used by auto-layout; compact mode may reduce this
export const BASE_SPACING = 30;
export const PARTNER_SPACING = 1.5 * NODE_WIDTH + BASE_SPACING;
export const SIBLING_SPACING = 1.5 * NODE_WIDTH + BASE_SPACING;
export const PARENT_VERTICAL_OFFSET = 275;
export const CHILD_VERTICAL_OFFSET = 275;
export const PARTNER_HORIZONTAL_OFFSET = 450;
export const SIBLING_HORIZONTAL_OFFSET = 450;
export const DIVORCED_HORIZONTAL_OFFSET = 450;
export const DIVORCED_VERTICAL_OFFSET = 50;
export const DEFAULT_HORIZONTAL_OFFSET = 250;
export const DEFAULT_VERTICAL_OFFSET = 275;

export const calculateAddNodePosition = (relation: EditMode["relation"], selectedNode?: Node<FamilyNodeData>): { x: number; y: number } => {
    if (!selectedNode) {
      return { x: 0, y: 0 };
    }

    switch (relation) {
      case "parent":
        return { x: selectedNode.position.x, y: selectedNode.position.y - PARENT_VERTICAL_OFFSET };
      case "child":
        return { x: selectedNode.position.x, y: selectedNode.position.y + CHILD_VERTICAL_OFFSET };
      case "partner":
        return { x: selectedNode.position.x + PARTNER_HORIZONTAL_OFFSET, y: selectedNode.position.y };
      case "sibling":
        return { x: selectedNode.position.x + SIBLING_HORIZONTAL_OFFSET, y: selectedNode.position.y };
      case "divorced-partner":
        return { x: selectedNode.position.x - DIVORCED_HORIZONTAL_OFFSET, y: selectedNode.position.y + DIVORCED_VERTICAL_OFFSET };
      default:
        return { x: selectedNode.position.x + DEFAULT_HORIZONTAL_OFFSET, y: selectedNode.position.y - DEFAULT_VERTICAL_OFFSET };
    }
  }