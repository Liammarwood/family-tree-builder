import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  EdgeProps,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from 'reactflow';

interface ControlPoint {
  x: number;
  y: number;
}

interface DraggableStepEdgeData {
  controlPoints?: ControlPoint[];
}

// Self-contained Draggable Step Edge Component
const DraggableStepEdge: React.FC<EdgeProps<DraggableStepEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  style,
}) => {
  const { setEdges, screenToFlowPosition } = useReactFlow();
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<ControlPoint | null>(null);
  const dragPositionRef = useRef<ControlPoint | null>(null);
  
  // Get control points from edge data, default to one point in the middle
  const controlPoints: ControlPoint[] = useMemo(() => data?.controlPoints ?? [
    { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 }
  ], [data?.controlPoints, sourceX, sourceY, targetX, targetY])

  const updateControlPoint = useCallback((index: number, x: number, y: number): void => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const newControlPoints = [...(edge.data?.controlPoints ?? controlPoints)];
          newControlPoints[index] = { x, y };
          return {
            ...edge,
            data: {
              ...edge.data,
              controlPoints: newControlPoints,
            },
          };
        }
        return edge;
      })
    );
  }, [id, setEdges, controlPoints]);

  const addControlPoint = useCallback((x: number, y: number): void => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const newControlPoints = [...(edge.data?.controlPoints ?? controlPoints), { x, y }];
          return {
            ...edge,
            data: {
              ...edge.data,
              controlPoints: newControlPoints,
            },
          };
        }
        return edge;
      })
    );
  }, [id, setEdges, controlPoints]);

  const removeControlPoint = useCallback((index: number): void => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const newControlPoints = [...(edge.data?.controlPoints ?? controlPoints)];
          if (newControlPoints.length > 1) {
            newControlPoints.splice(index, 1);
          }
          return {
            ...edge,
            data: {
              ...edge.data,
              controlPoints: newControlPoints,
            },
          };
        }
        return edge;
      })
    );
  }, [id, setEdges, controlPoints]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number): void => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingIndex(index);

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      const flowPos = screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });
      dragPositionRef.current = flowPos;
      setDragPosition(flowPos);
    };

    const handleMouseUp = (): void => {
      if (dragPositionRef.current) {
        updateControlPoint(index, dragPositionRef.current.x, dragPositionRef.current.y);
      }
      setDraggingIndex(null);
      setDragPosition(null);
      dragPositionRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [screenToFlowPosition, updateControlPoint]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number): void => {
    e.preventDefault();
    e.stopPropagation();
    removeControlPoint(index);
  }, [removeControlPoint]);

  const handlePathContextMenu = useCallback((e: React.MouseEvent<SVGPathElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    
    const flowPos = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });
    addControlPoint(flowPos.x, flowPos.y);
  }, [addControlPoint, screenToFlowPosition]);

  // Get display positions (use drag position while dragging)
  const displayPoints = useMemo(() => {
    return controlPoints.map((point, index) => {
      if (draggingIndex === index && dragPosition) {
        return dragPosition;
      }
      return point;
    });
  }, [controlPoints, draggingIndex, dragPosition]);

  // Create step path using all control points
  const edgePath: string = useMemo(() => {
    let path = `M ${sourceX} ${sourceY}`;
    let currentY = sourceY;
    
    // Create step pattern through each control point
    for (let i = 0; i < displayPoints.length; i++) {
      const point = displayPoints[i];
      
      // Go horizontal to the control point's X
      path += ` L ${point.x} ${currentY}`;
      
      // Go vertical to the control point's Y
      path += ` L ${point.x} ${point.y}`;
      currentY = point.y;
    }
    
    // Final steps to target
    // Horizontal to target's X position at current Y
    path += ` L ${targetX} ${currentY}`;
    // Vertical to target's Y position
    path += ` L ${targetX} ${targetY}`;
    
    return path;
  }, [sourceX, sourceY, targetX, targetY, displayPoints]);

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: 2 }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onContextMenu={handlePathContextMenu}
        style={{ cursor: 'context-menu', pointerEvents: 'all' }}
      />
      <EdgeLabelRenderer>
        {displayPoints.map((point, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${point.x}px, ${point.y}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
            onContextMenu={(e) => handleContextMenu(e, index)}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: '2px solid #3b82f6',
                backgroundColor: 'white',
                cursor: draggingIndex === index ? 'grabbing' : 'grab',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
              className="hover:scale-125 transition-transform"
            />
          </div>
        ))}
      </EdgeLabelRenderer>
    </>
  );
};

export default DraggableStepEdge;