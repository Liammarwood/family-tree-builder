import { useConfiguration } from '@/hooks/useConfiguration';
import { SmoothStepEdge, SmoothStepEdgeProps } from 'reactflow';

export const FamilyTreeEdge = (props: SmoothStepEdgeProps) => {
  const { id, sourceX, sourceY, target, source, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = props;
    const { edgeColor } = useConfiguration();

  return (
    <SmoothStepEdge id={id} markerEnd={markerEnd}
      style={{
          stroke: edgeColor || '#b1b1b7',
          strokeWidth: 2
      }} source={source} target={target} sourceX={sourceX} sourceY={sourceY} targetX={targetX} targetY={targetY} sourcePosition={sourcePosition} targetPosition={targetPosition} />
  );
};
