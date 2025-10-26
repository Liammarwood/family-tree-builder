import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Node } from "reactflow";

// Assuming nodes is an array of your ReactFlow nodes with data.dateOfBirth
export const calculateEarliestDateOfBirth = (nodes: Node<FamilyNodeData>[]) => nodes
  .map(node => node.data?.dateOfBirth)   // get all date strings
  .filter(Boolean)                       // remove undefined/null
  .map(dateStr => new Date(dateStr))     // convert to Date objects
  .reduce((earliest, current) => {
    return current < earliest ? current : earliest;
  }, new Date());                        // start with "now", or could use Infinity