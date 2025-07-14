import { createFileRoute } from "@tanstack/react-router";
import NetworkGraph from "../components/NetworkGraph";

export const Route = createFileRoute("/graph")({
  component: GraphPage,
});

function GraphPage() {
  return <NetworkGraph />;
}
