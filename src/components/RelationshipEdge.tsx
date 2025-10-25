import { MarriedRelationship, PartnerRelationship } from "@/libs/constants";
import { Favorite, HeartBroken } from "@mui/icons-material";
import React from "react";
import { BaseEdge, EdgeLabelRenderer } from "reactflow";

export type RelationshipEdgeData = {
  relationship?: string;
  dateOfMarriage?: string;
  dateOfDivorce?: string;
}
type Props = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  markerEnd?: string;
  onClick?: (event: React.MouseEvent, edgeInfo: { id: string; sourceX: number; sourceY: number; targetX: number; targetY: number; label?: string }) => void;
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
  onClick,
  data,
}: Props) {
  const { path, labelX, labelY } = getStepPathAndLabel(sourceX, sourceY, targetX, targetY);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Replace with your edit logic / open popover / set state
    onClick?.(e, { id, sourceX, sourceY, targetX, targetY });
  };

  return (
    <>
      {/* Draw the step path as the edge */}
      <BaseEdge id={id} path={path} markerEnd={markerEnd}
        style={data?.dateOfDivorce ? {
          stroke: '#b1b1b7',
          strokeWidth: 2,
          strokeDasharray: '6 4',
        } : {}} />
      <EdgeLabelRenderer>
        <div
          onClick={handleClick}
          className="nodrag nopan"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
            border: "2px solid #8b7355",
            borderRadius: 12,
            padding: "8px 14px",
            width: "fit-content",
            whiteSpace: "nowrap",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(139, 115, 85, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
            fontSize: 11,
            lineHeight: 1.3
          }}
        >
          <div style={{
            fontWeight: 600,
            color: "#5d4e37",
            letterSpacing: "0.3px",
            textTransform: "uppercase",
            fontSize: 10,
            marginBottom: 4
          }}>
            {data?.relationship ?
              data.relationship === PartnerRelationship && data.dateOfMarriage ? MarriedRelationship : data.relationship
              : "Relationship"}
          </div>
          {data?.dateOfMarriage && (
            <div style={{
              fontSize: 11,
              color: "#6b5d4f",
              fontStyle: "italic",
              marginTop: 3,
              fontWeight: 500
            }}>
              <Favorite color={data?.dateOfDivorce ? "disabled" : "error"} /> {data.dateOfMarriage}
            </div>
          )}
          {data?.dateOfDivorce && (
            <div style={{
              fontSize: 11,
              color: "#8b6f47",
              fontStyle: "italic",
              marginTop: 3
            }}>
              <HeartBroken color="disabled" /> {data.dateOfDivorce}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
