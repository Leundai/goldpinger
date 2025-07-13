import { createFileRoute } from '@tanstack/react-router'
import NetworkGraph from '../components/NetworkGraph'

export const Route = createFileRoute('/graph')({
  component: GraphPage,
})

function GraphPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Goldpinger Network Graph</h1>
          <div className="space-x-4">
            <a href="/graph" className="text-blue-300 hover:text-white">Graph</a>
            <a href="/data" className="text-gray-300 hover:text-white">Data</a>
            <a href="/heatmap" className="text-gray-300 hover:text-white">Heatmap</a>
            <a href="/check_all" className="text-gray-300 hover:text-white">Raw</a>
            <a href="/metrics" className="text-gray-300 hover:text-white">Metrics</a>
          </div>
        </div>
      </nav>
      
      <div className="h-[calc(100vh-80px)]">
        <NetworkGraph />
      </div>
    </div>
  )
}