import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Node } from "reactflow";

// Assuming nodes is an array of your ReactFlow nodes with data.dateOfBirth
export const calculateEarliestDateOfBirth = (nodes: Node<FamilyNodeData>[]) => {
  let earliestTime = Date.now();
  
  // Single pass through nodes - no intermediate arrays
  for (const node of nodes) {
    const dateStr = node.data?.dateOfBirth;
    if (dateStr) {
      const time = new Date(dateStr).getTime();
      if (time < earliestTime) {
        earliestTime = time;
      }
    }
  }
  
  return new Date(earliestTime);
};