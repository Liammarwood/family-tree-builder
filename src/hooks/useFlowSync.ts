import { useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';

export function useFlowSync(
  isLoaded: boolean,
  value: { nodes: Node[]; edges: Edge[] },
  setValue: (v: { nodes: Node[]; edges: Edge[] }) => void,
  nodes: Node[],
  setNodes: (n: Node[]) => void,
  edges: Edge[],
  setEdges: (e: Edge[]) => void
) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // First time: sync value → state
    if (!initialized.current) {
      setNodes(value.nodes);
      setEdges(value.edges);
      initialized.current = true;
      return;
    }

    // After initial load: sync state → value only if changed
    if (value.nodes !== nodes || value.edges !== edges) {
      setValue({ nodes, edges });
    }
  }, [isLoaded, value, nodes, edges, setNodes, setEdges, setValue]);
}
