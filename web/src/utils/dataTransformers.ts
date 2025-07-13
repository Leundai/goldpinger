import {
  GoldpingerData,
  NetworkNode,
  NetworkLink,
  NetworkData,
} from "../types/goldpinger";

export interface SigmaNode {
  key: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  type: "circle" | "square";
  data: any;
}

export interface SigmaEdge {
  key: string;
  source: string;
  target: string;
  color: string;
  type: "arrow" | "line";
  size: number;
  label?: string;
  data: any;
}

export function transformToNetworkData(
  goldpingerData: GoldpingerData
): NetworkData {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];
  const podIPs: string[] = [];

  // Process pod nodes from responses
  for (const [podIP, responseData] of Object.entries(
    goldpingerData.responses
  )) {
    nodes.push({
      id: podIP,
      label: `${podIP} (${responseData.HostIP})`,
      type: "pod",
      hostIP: responseData.HostIP,
      podIP: responseData.PodIP,
      status: responseData.OK ? "healthy" : "unhealthy",
      data: responseData,
    });
    podIPs.push(podIP);
  }

  // Process edges from pod-to-pod connections
  for (const [sourceIP, responseData] of Object.entries(
    goldpingerData.responses
  )) {
    if (responseData.response?.podResults) {
      for (const [targetIP, podResult] of Object.entries(
        responseData.response.podResults
      )) {
        links.push({
          source: sourceIP,
          target: targetIP,
          latency: podResult["response-time-ms"] || 0,
          status: podResult.OK ? "healthy" : "unhealthy",
          type: "pod-to-pod",
          data: podResult,
        });
      }
    }
  }

  // Process external probe targets
  if (goldpingerData.probeResults) {
    for (const [targetHost, podResults] of Object.entries(
      goldpingerData.probeResults
    )) {
      // Add external target node if not already present
      if (!nodes.find((n) => n.id === targetHost)) {
        // Determine overall health for this external target
        let allHealthy = true;
        for (const [podName, probeResults] of Object.entries(podResults)) {
          for (const probe of probeResults) {
            if (probe.error) {
              allHealthy = false;
              break;
            }
          }
          if (!allHealthy) break;
        }

        nodes.push({
          id: targetHost,
          label: targetHost,
          type: "external",
          status: allHealthy ? "healthy" : "unhealthy",
          data: podResults,
        });
      }

      // Add edges from pods to external targets
      for (const [podName, probeResults] of Object.entries(podResults)) {
        for (const probe of probeResults) {
          links.push({
            source: podName,
            target: targetHost,
            latency: probe["response-time-ms"] || 0,
            status: probe.error ? "unhealthy" : "healthy",
            type: "pod-to-external",
            data: probe,
          });
        }
      }
    }
  }

  // Handle missing nodes that are referenced in edges but not in responses
  const allNodeIds = new Set(nodes.map((n) => n.id));
  for (const link of links) {
    for (const nodeId of [link.source, link.target]) {
      if (!allNodeIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          label: nodeId,
          type: "pod",
          status: "unknown",
          data: {},
        });
        allNodeIds.add(nodeId);
      }
    }
  }

  return { nodes, links };
}

export function transformToSigmaData(networkData: NetworkData): {
  nodes: SigmaNode[];
  edges: SigmaEdge[];
} {
  const nodes: SigmaNode[] = [];
  const edges: SigmaEdge[] = [];

  // Transform all nodes with appropriate sizing for force layout
  networkData.nodes.forEach((node) => {
    const isExternal = node.type === "external";
    nodes.push({
      key: node.id,
      label: node.label,
      x: 0, // Will be overridden by force layout
      y: 0, // Will be overridden by force layout
      size: isExternal ? 8 : 12, // External nodes slightly smaller
      color: getNodeColor(node.status),
      type: "circle",
      data: { ...node },
    });
  });

  // Transform edges with better styling for force layout
  networkData.links.forEach((link, i) => {
    // const isExternal = link.type === "pod-to-external";
    edges.push({
      key: `e${i}`,
      source: link.source,
      target: link.target,
      color: getEdgeColor(link.status, link.type),
      type: "arrow",
      size: 3,
      label: link.latency > 0 ? `${link.latency}ms` : undefined,
      data: { ...link },
    });
  });

  return { nodes, edges };
}

function getNodeColor(status: "healthy" | "unhealthy" | "unknown"): string {
  switch (status) {
    case "healthy":
      return "#4CC40B";
    case "unhealthy":
      return "#FF0000";
    case "unknown":
      return "#CCCCCC";
    default:
      return "#CCCCCC";
  }
}

function getEdgeColor(
  status: "healthy" | "unhealthy" | "unknown",
  type: "pod-to-pod" | "pod-to-external"
): string {
  if (status === "unhealthy") return "#FF0000";
  if (type === "pod-to-external") return "#999999";
  return "#CCCCCC";
}
