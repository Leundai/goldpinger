export interface Host {
  hostIP: string;
  podIP: string;
  podName: string;
}

export interface ProbeResult {
  protocol: string;
  "response-time-ms": number;
  OK?: boolean;
  error?: string;
}

export interface PodResult {
  HostIP: string;
  OK: boolean;
  PingTime: string;
  PodIP: string;
  response: {
    boot_time: string;
  };
  "response-time-ms": number;
  "status-code": number;
}

export interface ResponseData {
  HostIP: string;
  OK: boolean;
  PodIP: string;
  response: {
    podResults: Record<string, PodResult>;
    probeResults: Record<string, ProbeResult[]>;
  };
}

export interface GoldpingerData {
  hosts: Host[];
  probeResults: Record<string, Record<string, ProbeResult[]>>;
  responses: Record<string, ResponseData>;
}

export interface NetworkNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  type: "pod" | "external";
  hostIP?: string;
  podIP?: string;
  podName?: string;
  status: "healthy" | "unhealthy" | "unknown";
  data: Host | ResponseData | Record<string, ProbeResult[]>;
}

export interface NetworkLink {
  source: string;
  target: string;
  latency: number;
  status: "healthy" | "unhealthy" | "unknown";
  type: "pod-to-pod" | "pod-to-external";
  data: PodResult | ProbeResult;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}