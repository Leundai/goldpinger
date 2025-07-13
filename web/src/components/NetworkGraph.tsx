import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  NodeProps,
  EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import rawData from "../../raw_data.json";
import PingAnimation from "./PingAnimation";

interface GoldpingerData {
  hosts: Array<{
    hostIP: string;
    podIP: string;
    podName: string;
  }>;
  responses: Record<
    string,
    {
      HostIP: string;
      OK: boolean;
      PodIP: string;
      response: {
        podResults: Record<
          string,
          {
            HostIP: string;
            OK: boolean;
            PingTime: string;
            PodIP: string;
            "response-time-ms": number;
            "status-code": number;
          }
        >;
      };
    }
  >;
}

const data = rawData as GoldpingerData;

interface CustomNodeData extends Record<string, unknown> {
  label: string;
  podName: string;
  hostIP: string;
  podIP: string;
  isHealthy: boolean;
}

interface CustomEdgeData extends Record<string, unknown> {
  responseTime: number;
  isHealthy: boolean;
}

// Custom Node Component
const CustomNode = ({ data }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`px-4 py-2 rounded-lg border-2 text-white font-semibold text-center min-w-[120px] ${
        (data as CustomNodeData).isHealthy
          ? "bg-green-500 border-green-600"
          : "bg-red-500 border-red-600"
      }`}
    >
      <div className="text-sm">{(data as CustomNodeData).podName}</div>
      <div className="text-xs opacity-75">{(data as CustomNodeData).podIP}</div>
    </motion.div>
  );
};

// Custom Edge Component
const CustomEdge = ({
  data,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) => {
  const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  return (
    <g>
      <path
        d={edgePath}
        stroke={(data as CustomEdgeData)?.isHealthy ? "#10b981" : "#ef4444"}
        strokeWidth={Math.max(2, Math.min(8, ((data as CustomEdgeData)?.responseTime || 1) / 2))}
        strokeOpacity={0.6}
        fill="none"
      />
      {(data as CustomEdgeData)?.responseTime && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          textAnchor="middle"
          className="text-xs fill-gray-600"
          dy="-5"
        >
          {(data as CustomEdgeData).responseTime}ms
        </text>
      )}
    </g>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Transform data into ReactFlow format
const transformData = () => {
  const nodes: Node<CustomNodeData>[] = [];
  const edges: Edge<CustomEdgeData>[] = [];

  // Create nodes from hosts
  const hosts = data.hosts;
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  hosts.forEach((host, index) => {
    const angle = (index / hosts.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const responseData = data.responses[host.podName];

    nodes.push({
      id: host.podName,
      type: "custom",
      position: { x, y },
      data: {
        label: host.podName,
        podName: host.podName,
        hostIP: host.hostIP,
        podIP: host.podIP,
        isHealthy: responseData?.OK || false,
      },
    });
  });

  // Create edges from pod results
  Object.entries(data.responses).forEach(([sourcePod, responseData]) => {
    if (responseData.response?.podResults) {
      Object.entries(responseData.response.podResults).forEach(
        ([targetPod, result]) => {
          if (sourcePod !== targetPod) {
            edges.push({
              id: `${sourcePod}-${targetPod}`,
              source: sourcePod,
              target: targetPod,
              type: "custom",
              data: {
                responseTime: result["response-time-ms"] || 0,
                isHealthy: result.OK,
              },
            });
          }
        }
      );
    }
  });

  return { nodes, edges };
};

export default function NetworkGraph() {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => transformData(),
    []
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(true);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node as Node<CustomNodeData>);
    },
    []
  );

  const handleReload = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = transformData();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  return (
    <div className="h-full w-full relative">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={`flex items-center gap-2 px-3 py-2 rounded text-white font-medium ${
            isAnimating
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isAnimating ? <Pause size={16} /> : <Play size={16} />}
          {isAnimating ? "Pause" : "Play"}
        </button>
        <button
          onClick={handleReload}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
        >
          <RotateCcw size={16} />
          Reload
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => (node.data?.isHealthy ? "#10b981" : "#ef4444")}
          className="bg-white"
        />
      </ReactFlow>

      {/* Ping Animations */}
      <PingAnimation edges={edges} nodes={nodes} isAnimating={isAnimating} />

      {/* Node Details Modal */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedNode(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              {selectedNode.data.podName}
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Pod IP:</strong> {selectedNode.data.podIP}
              </p>
              <p>
                <strong>Host IP:</strong> {selectedNode.data.hostIP}
              </p>
              <p>
                <strong>Status:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-white text-sm ${
                    selectedNode.data.isHealthy ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {selectedNode.data.isHealthy ? "Healthy" : "Unhealthy"}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
