import { createFileRoute } from '@tanstack/react-router'
import NetworkGraph from '../components/NetworkGraph'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="h-screen w-full flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Goldpinger Network Graph</h1>
        <p className="text-gray-300">Real-time Kubernetes pod connectivity visualization</p>
      </header>
      <main className="flex-1">
        <NetworkGraph />
      </main>
    </div>
  )
}
