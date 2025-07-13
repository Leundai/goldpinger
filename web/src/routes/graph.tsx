import { createFileRoute } from "@tanstack/react-router";
import NetworkGraph from "../components/NetworkGraph";

export const Route = createFileRoute("/graph")({
  component: GraphPage,
});

function GraphPage() {
  return (
    <div className="h-[calc(100vh-80px)]">
      <NetworkGraph />
    </div>
  );
}
