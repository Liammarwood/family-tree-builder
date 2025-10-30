import { Edge } from "reactflow"
import { RelationshipType } from "@/types/RelationshipEdgeData"

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

// source (child), target (parent)
export const ParentEdge = (child: string, parent: string) => {
    return ({
        id: `parent-${parent}-${child}`,
        source: parent,
        target: child,
        type: "family",
        markerEnd: undefined,
        animated: false,
        sourceHandle: 'child',
        targetHandle: 'parent',
        style: {
          stroke: '#b1b1b7',
          strokeWidth: 2,
        },
        data: { relationship: RelationshipType.Parent }
    })
}

export const ChildEdge = (child: string, parent: string) => {
    return ({
        id: `parent-${child}-${parent}`,
        source: child,
        target: parent,
        type: "family",
        markerEnd: undefined,
        animated: false,
        sourceHandle: 'child',
        targetHandle: 'parent',
        style: {
          stroke: '#b1b1b7',
          strokeWidth: 2,
        },
        data: { relationship: RelationshipType.Parent }
    })
}

export const SiblingEdge = (target: string, parentEdges: Edge[]) => {
    const siblingEdges: Edge[] = [];
    parentEdges.forEach((pe) => {
        siblingEdges.push(ParentEdge(target, pe.source));
    });
    return siblingEdges;
}