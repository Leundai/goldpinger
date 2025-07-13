interface NodeDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  nodeData?: any
  edgeData?: any
}

export default function NodeDetailsSidebar({
  isOpen,
  onClose,
  nodeData,
  edgeData
}: NodeDetailsSidebarProps) {
  if (!isOpen) return null

  const data = nodeData || edgeData
  const title = nodeData ? nodeData.id : edgeData?.id || 'Details'

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 hover:bg-gray-200 rounded"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            {nodeData && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Node Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-600">ID:</span>
                    <span className="ml-2">{nodeData.id}</span>
                  </div>
                  {nodeData.hostIP && (
                    <div>
                      <span className="font-medium text-gray-600">Host IP:</span>
                      <span className="ml-2">{nodeData.hostIP}</span>
                    </div>
                  )}
                  {nodeData.podIP && (
                    <div>
                      <span className="font-medium text-gray-600">Pod IP:</span>
                      <span className="ml-2">{nodeData.podIP}</span>
                    </div>
                  )}
                  {nodeData.status && (
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        nodeData.status === 'healthy' 
                          ? 'bg-green-100 text-green-800' 
                          : nodeData.status === 'unhealthy'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {nodeData.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {edgeData && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Connection Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-600">Connection ID:</span>
                    <span className="ml-2">{edgeData.id}</span>
                  </div>
                  {edgeData.latency && (
                    <div>
                      <span className="font-medium text-gray-600">Latency:</span>
                      <span className="ml-2">{edgeData.latency}ms</span>
                    </div>
                  )}
                  {edgeData.status && (
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        edgeData.status === 'healthy' 
                          ? 'bg-green-100 text-green-800' 
                          : edgeData.status === 'unhealthy'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {edgeData.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Raw Data</h3>
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-3 rounded border overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}