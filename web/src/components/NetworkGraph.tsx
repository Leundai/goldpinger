import { useRef, useState } from 'react'
import { useNetworkData } from '../hooks/useNetworkData'
import { useSigmaGraph } from '../hooks/useSigmaGraph'
import NodeDetailsSidebar from './NodeDetailsSidebar'
import NetworkControls from './NetworkControls'
import { NetworkNode, NetworkLink} from '~/types/goldpinger'

export default function NetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: networkData, loading, error, reload } = useNetworkData()
  const [selectedNodeData, setSelectedNodeData] = useState<NetworkNode | null>(null)
  const [selectedEdgeData, setSelectedEdgeData] = useState<NetworkLink | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  const { refresh, resetHighlight } = useSigmaGraph(containerRef, networkData, {
    onNodeClick: (nodeId, data) => {
      setSelectedNodeData({ id: nodeId, ...data })
      setSelectedEdgeData(null)
      setShowSidebar(true)
    },
    onEdgeClick: (edgeId, data) => {
      setSelectedEdgeData({ id: edgeId, ...data })
      setSelectedNodeData(null)
      setShowSidebar(true)
    },
    onStageClick: () => {
      resetHighlight()
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading network data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!networkData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">No network data available</div>
      </div>
    )
  }

  return (
    <div className="flex w-full h-full">
      <div
        ref={containerRef}
        className={`w-3/4 h-full bg-white`}
      >
        </div>
      <NodeDetailsSidebar
        nodeData={selectedNodeData}
        edgeData={selectedEdgeData}
      />
      <div className="absolute bottom-6 left-4 bg-white/90 p-3 rounded-lg shadow-md text-sm">
          <div className="font-semibold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Unhealthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Unknown</span>
          </div>
        </div>
      </div>
    </div>
  )
}