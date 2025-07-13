import { useRef, useState } from 'react'
import { useNetworkData } from '../hooks/useNetworkData'
import { useSigmaGraph } from '../hooks/useSigmaGraph'
import NodeDetailsSidebar from './NodeDetailsSidebar'
import NetworkControls from './NetworkControls'

export default function NetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: networkData, loading, error, reload } = useNetworkData()
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null)
  const [selectedEdgeData, setSelectedEdgeData] = useState<any>(null)
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

  const handleReload = () => {
    reload()
    resetHighlight()
  }

  const handleCloseSidebar = () => {
    setShowSidebar(false)
    setSelectedNodeData(null)
    setSelectedEdgeData(null)
  }

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
    <div className="relative w-full h-full">
      <NetworkControls onReload={handleReload} />
      
      <div
        ref={containerRef}
        className={`w-full h-full bg-white transition-all duration-300 ${
          showSidebar ? 'mr-96' : ''
        }`}
        style={{ cursor: 'default' }}
      />

      <NodeDetailsSidebar
        isOpen={showSidebar}
        onClose={handleCloseSidebar}
        nodeData={selectedNodeData}
        edgeData={selectedEdgeData}
      />
      
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-md text-sm">
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