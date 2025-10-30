import { Edge, Node } from "reactflow"
import { RelationshipType } from "@/types/RelationshipEdgeData"
import { FamilyNodeData } from "@/types/FamilyNodeData"
import { getChildHandleId } from "./handleGroups"

export const PartnerEdge = (source: string, target: string, dateOfMarriage: string) => {
    return ({
        id: `partner-${source}-${target}`,
        source,
        target,
        type: "partner",
        style: { stroke: '#b77', strokeDasharray: '2 2' },
        markerEnd: undefined,
        animated: false,
        sourceHandle: 'right',
        targetHandle: 'left',
        data: { relationship: RelationshipType.Partner, dateOfMarriage: dateOfMarriage }
    })
}

export const DivorcedEdge = (source: string, target: string, dateOfMarriage: string, dateOfDivorce: string) => {
    return ({
        id: `divorced-${source}-${target}`,
        source,
        target,
        type: "partner",
        style: { stroke: '#b77', strokeDasharray: '2 2' },
        markerEnd: undefined,
        animated: false,
        sourceHandle: 'right',
        targetHandle: 'left',
        data: { relationship: RelationshipType.Divorced, dateOfMarriage, dateOfDivorce }
    })
}

// source (parent), target (child)
// Now uses dynamic handle IDs based on child groupings
export const ParentEdge = (child: string, parent: string, nodes: Node<FamilyNodeData>[] = [], edges: Edge[] = []) => {
    // Get the appropriate handle ID for this parent-child relationship
    const sourceHandle = getChildHandleId(parent, child, nodes, edges);
    
    return ({
        id: `parent-${parent}-${child}`,
        source: parent,
        target: child,
        type: "step",
        markerEnd: undefined,
        animated: false,
        sourceHandle,
        targetHandle: 'parent',
        style: {
          stroke: '#b1b1b7',
          strokeWidth: 2,
        },
        data: { relationship: RelationshipType.Parent }
    })
}

export const ChildEdge = (child: string, parent: string, nodes: Node<FamilyNodeData>[] = [], edges: Edge[] = []) => {
    // When child is source, we still need to compute the handle on the parent side
    // But the direction is reversed - this edge goes child -> parent
    // So sourceHandle is on child (use default 'child-0') and targetHandle is on parent
    const targetHandle = getChildHandleId(parent, child, nodes, edges);
    
    return ({
        id: `parent-${child}-${parent}`,
        source: child,
        target: parent,
        type: "step",
        markerEnd: undefined,
        animated: false,
        sourceHandle: 'child-0', // Child nodes use default handle for outgoing edges
        targetHandle,
        style: {
          stroke: '#b1b1b7',
          strokeWidth: 2,
        },
        data: { relationship: RelationshipType.Parent }
    })
}

export const SiblingEdge = (target: string, parentEdges: Edge[], nodes: Node<FamilyNodeData>[] = [], edges: Edge[] = []) => {
    const siblingEdges: Edge[] = [];
    parentEdges.forEach((pe) => {
        siblingEdges.push(ParentEdge(target, pe.source, nodes, edges));
    });
    return siblingEdges;
}