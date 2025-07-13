import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Copy, Network, Server } from "lucide-react";
import { NetworkLink, NetworkNode } from "~/types/goldpinger";

interface NodeDetailsSidebarProps {
  nodeData: NetworkNode | null;
  edgeData: NetworkLink | null;
}

export default function NodeDetailsSidebar({
  nodeData,
  edgeData,
}: NodeDetailsSidebarProps) {
  const data = nodeData || edgeData;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "default";
      case "unhealthy":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (data === null) {
    return (
      <div className="h-full border-l bg-background w-1/4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select a node or edge to see details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border-l bg-background w-1/4">
      <TooltipProvider>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {nodeData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="w-5 h-5" />
                    Node Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        ID:
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-mono truncate">
                          {nodeData.id}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(nodeData.id)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy ID</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Host IP:
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-mono truncate">
                          {nodeData.hostIP}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                copyToClipboard(nodeData.hostIP || "")
                              }
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Host IP</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Pod IP:
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-mono truncate">
                          {nodeData.podIP}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                copyToClipboard(nodeData.podIP || "")
                              }
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Pod IP</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {nodeData.status && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Status:
                        </span>
                        <Badge variant={getStatusVariant(nodeData.status)}>
                          {nodeData.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* {edgeData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5" />
                    Connection Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Connection ID:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{edgeData.id}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(edgeData.id)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Connection ID</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {edgeData.latency && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Latency:
                        </span>
                        <span className="text-sm font-mono">
                          {edgeData.latency}ms
                        </span>
                      </div>
                    )}

                    {edgeData.status && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Status:
                        </span>
                        <Badge variant={getStatusVariant(edgeData.status)}>
                          {edgeData.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )} */}

            <Separator />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Raw Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full border rounded-md bg-muted overflow-auto max-w-80">
                  <pre className="text-xs font-mono p-3 whitespace-pre min-w-0">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </TooltipProvider>
    </div>
  );
}
