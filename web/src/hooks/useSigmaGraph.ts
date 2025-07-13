import { useEffect, useRef, useState } from "react";
import Sigma from "sigma";
import { EdgeArrowProgram } from "sigma/rendering";
import {
  DEFAULT_EDGE_CURVATURE,
  EdgeCurvedArrowProgram,
  indexParallelEdgesIndex,
} from "@sigma/edge-curve";
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import { NetworkData } from "../types/goldpinger";
import { transformToSigmaData } from "../utils/dataTransformers";

interface SigmaGraphOptions {
  onNodeClick?: (nodeId: string, data: any) => void;
  onEdgeClick?: (edgeId: string, data: any) => void;
  onStageClick?: () => void;
}

export function useSigmaGraph(
  containerRef: React.RefObject<HTMLDivElement | null>,
  networkData: NetworkData | null,
  options: SigmaGraphOptions = {}
) {
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const layoutRef = useRef<ForceSupervisor | null>(null);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  // Initialize Sigma instance
  useEffect(() => {
    if (!containerRef.current || !networkData) return;

    // Clean up previous instances
    if (layoutRef.current) {
      layoutRef.current.stop();
    }
    if (sigmaRef.current) {
      sigmaRef.current.kill();
    }

    // Create new graph
    const graph = new Graph();
    graphRef.current = graph;

    // Transform network data to Sigma format
    const { nodes, edges } = transformToSigmaData(networkData);

    // Add nodes to graph with random initial positions for force simulation
    nodes.forEach((node) => {
      graph.addNode(node.key, {
        ...node,
        x: Math.random() * 4 - 2,
        y: Math.random() * 4 - 2,
      });
    });

    // Add edges to graph
    edges.forEach((edge) => {
      graph.addEdge(edge.source, edge.target, {
        key: edge.key,
        color: edge.color,
        type: edge.type,
        size: edge.size,
        label: edge.label,
        data: edge.data,
      });
    });

    const layout = new ForceSupervisor(graph, {
      isNodeFixed: (_, attr) => attr.highlighted,
      settings: {
        gravity: 0.2,
        repulsion: 0.3,
      },
    });
    layout.start();
    layoutRef.current = layout;

    indexParallelEdgesIndex(graph, {
      edgeIndexAttribute: "parallelIndex",
      edgeMinIndexAttribute: "parallelMinIndex",
      edgeMaxIndexAttribute: "parallelMaxIndex",
    });

    graph.forEachEdge(
      (
        edge,
        {
          parallelIndex,
          parallelMinIndex,
          parallelMaxIndex,
        }:
          | {
              parallelIndex: number;
              parallelMinIndex?: number;
              parallelMaxIndex: number;
            }
          | {
              parallelIndex?: null;
              parallelMinIndex?: null;
              parallelMaxIndex?: null;
            }
      ) => {
        if (typeof parallelMinIndex === "number") {
          graph.mergeEdgeAttributes(edge, {
            type: parallelIndex ? "curved" : "straight",
            curvature: getCurvature(parallelIndex, parallelMaxIndex),
          });
        } else if (typeof parallelIndex === "number") {
          graph.mergeEdgeAttributes(edge, {
            type: "curved",
            curvature: getCurvature(parallelIndex, parallelMaxIndex),
          });
        } else {
          graph.setEdgeAttribute(edge, "type", "straight");
        }
      }
    );

    // Create Sigma instance
    const sigma = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      renderEdgeLabels: true,
      minCameraRatio: 0.5,
      maxCameraRatio: 2,
      edgeProgramClasses: {
        straight: EdgeArrowProgram,
        curved: EdgeCurvedArrowProgram,
      },
    });

    sigmaRef.current = sigma;

    // Set up event handlers
    if (options.onNodeClick) {
      sigma.on("clickNode", ({ node }) => {
        const nodeData = graph.getNodeAttributes(node);
        setHighlightedNode(node);
        options.onNodeClick?.(node, nodeData.data);
      });
    }

    if (options.onEdgeClick) {
      sigma.on("clickEdge", ({ edge }) => {
        const edgeData = graph.getEdgeAttributes(edge);
        options.onEdgeClick?.(edge, edgeData.data);
      });
    }

    if (options.onStageClick) {
      sigma.on("clickStage", () => {
        setHighlightedNode(null);
        options.onStageClick?.();
      });
    }

    return () => {
      if (layoutRef.current) {
        layoutRef.current.stop();
      }
      sigma.kill();
    };
  }, [networkData]);

  // Set up drag functionality
  useEffect(() => {
    if (!sigmaRef.current || !graphRef.current) return;

    const sigma = sigmaRef.current;
    const graph = graphRef.current;

    // State for drag'n'drop
    let draggedNode: string | null = null;
    let isDragging = false;

    // On mouse down on a node
    const handleDownNode = (e: { node: string }) => {
      isDragging = true;
      draggedNode = e.node;
      graph.setNodeAttribute(draggedNode, "highlighted", true);
      if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
    };

    // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
    const handleMoveBody = ({ event }: { event: any }) => {
      if (!isDragging || !draggedNode) return;

      // Get new position of node
      const pos = sigma.viewportToGraph(event);
      graph.setNodeAttribute(draggedNode, "x", pos.x);
      graph.setNodeAttribute(draggedNode, "y", pos.y);

      // Prevent sigma to move camera:
      event.preventSigmaDefault();
      event.original.preventDefault();
      event.original.stopPropagation();
    };

    // On mouse up, we reset the dragging mode
    const handleUp = () => {
      if (draggedNode) {
        graph.removeNodeAttribute(draggedNode, "highlighted");
      }

      isDragging = false;
      draggedNode = null;
    };

    sigma.on("downNode", handleDownNode);
    sigma.on("moveBody", handleMoveBody);
    sigma.on("upNode", handleUp);
    sigma.on("upStage", handleUp);

    return () => {
      sigma.off("downNode", handleDownNode);
      sigma.off("moveBody", handleMoveBody);
      sigma.off("upNode", handleUp);
      sigma.off("upStage", handleUp);
      delete (sigma as any)._justFinishedDrag;
    };
  }, [networkData]);

  // Handle node highlighting
  useEffect(() => {
    console.log("Highlighting node:", highlightedNode);
    if (!sigmaRef.current || !graphRef.current) return;

    const graph = graphRef.current;
    const sigma = sigmaRef.current;

    if (highlightedNode) {
      // Store original colors and dim all edges except those connected to highlighted node
      graph.forEachEdge((edge, attributes) => {
        const [source, target] = graph.extremities(edge);
        // Store original color if not already stored
        if (!attributes.originalColor) {
          graph.setEdgeAttribute(edge, "originalColor", attributes.color);
        }

        if (source === highlightedNode || target === highlightedNode) {
          graph.setEdgeAttribute(
            edge,
            "color",
            attributes.originalColor || attributes.color
          );
        } else {
          // Dim other edges
          graph.setEdgeAttribute(edge, "color", "#f5f5f5");
        }
      });
    } else {
      // Restore original edge colors
      graph.forEachEdge((edge, attributes) => {
        if (attributes.originalColor) {
          graph.setEdgeAttribute(edge, "color", attributes.originalColor);
        }
      });
    }

    sigma.refresh();
  }, [highlightedNode, networkData]);

  const refresh = () => {
    sigmaRef.current?.refresh();
  };

  const resetHighlight = () => {
    setHighlightedNode(null);
  };

  return {
    sigma: sigmaRef.current,
    graph: graphRef.current,
    highlightedNode,
    refresh,
    resetHighlight,
  };
}

function getCurvature(index: number, maxIndex: number): number {
  if (maxIndex <= 0) throw new Error("Invalid maxIndex");
  if (index < 0) return -getCurvature(-index, maxIndex);
  const amplitude = 3.5;
  const maxCurvature =
    amplitude * (1 - Math.exp(-maxIndex / amplitude)) * DEFAULT_EDGE_CURVATURE;
  return (maxCurvature * index) / maxIndex;
}
