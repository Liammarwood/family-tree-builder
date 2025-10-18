import React from "react";
import { BaseEdge, EdgeLabelRenderer } from "reactflow";

export type RelationshipEdgeData = {
    relationship?: string;
    dom?: string;
    dod?: string;
}
type Props = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  markerEnd?: string;
  data?: RelationshipEdgeData;
};

/**
 * Creates a simple step path (source -> midX at sourceY -> midX at targetY -> target).
 * Returns the SVG path string and a reasonable label position.
 */
function getStepPathAndLabel(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  // Choose midX between source and target. Slight offset if they are very close.
  const midX = sourceX + (targetX - sourceX) / 2;

  // Build path: horizontal to midX, vertical to targetY, horizontal to targetX
  const path = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;

  // Place label in the center of the middle segment:
  // middle segment runs from (midX, sourceY) to (midX, targetY) -> center is (midX, (sourceY+targetY)/2)
  const labelX = midX;
  const labelY = sourceY + (targetY - sourceY) / 2;

  return { path, labelX, labelY };
}

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  data,
}: Props) {
  const { path, labelX, labelY } = getStepPathAndLabel(sourceX, sourceY, targetX, targetY);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Replace with your edit logic / open popover / set state
    console.log("Clicked edge label", id, data);
  };

  return (
    <>
      {/* Draw the step path as the edge */}
      <BaseEdge id={id} path={path} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          onClick={handleClick}
          className="nodrag nopan"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid #dcdcdc",
            borderRadius: 8,
            padding: "6px 10px",
            minWidth: 120,
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            fontSize: 12,
            lineHeight: 1.2,
          }}
        >
          <div style={{ fontWeight: 700, color: "#333" }}>
            {data?.relationship ?? "Relationship"}
          </div>
          {data?.dom && (
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{data.dom}</div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
