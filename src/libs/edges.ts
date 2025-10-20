import { Edge } from "reactflow"
import { DivorcedRelationship, MarriedRelationship, ParentRelationship, PartnerRelationship } from "./constants"

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
        data: { relationship: dateOfMarriage === "" ? PartnerRelationship : MarriedRelationship, dateOfMarriage: dateOfMarriage }
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
        data: { relationship: DivorcedRelationship, dateOfMarriage, dateOfDivorce }
    })
}

// source (child), target (parent)
export const ParentEdge = (child: string, parent: string) => {
    return ({
        id: `parent-${parent}-${child}`,
        source: parent,
        target: child,
        type: "draggable",
        markerEnd: undefined,
        animated: false,
        sourceHandle: 'child',
        targetHandle: 'parent',
        label: "Handle",
        data: { relationship: ParentRelationship }
    })
}

export const ChildEdge = (child: string, parent: string) => {
    return ({
        id: `parent-${child}-${parent}`,
        source: child,
        target: parent,
        type: "draggable",
        markerEnd: undefined,
        animated: false,
        sourceHandle: 'child',
        targetHandle: 'parent',
        label: "Handle",
        data: { relationship: ParentRelationship }
    })
}

export const SiblingEdge = (target: string, parentEdges: Edge[]) => {
    const siblingEdges: Edge[] = [];
    parentEdges.forEach((pe) => {
        siblingEdges.push(ParentEdge(target, pe.source));
    });
    return siblingEdges;
}