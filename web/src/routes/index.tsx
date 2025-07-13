import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Goldpinger</h1>
      <p className="text-gray-600 mb-6">
        Network monitoring and visualization for Kubernetes clusters
      </p>

      <div className="space-y-4">
        <Link
          to="/graph"
          className="block p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <h3 className="text-lg font-semibold">Network Graph</h3>
          <p className="text-blue-100">Visualize pod connectivity and health</p>
        </Link>
      </div>
    </div>
  );
}
