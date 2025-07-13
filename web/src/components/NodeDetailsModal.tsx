interface NodeDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  nodeData?: any
  edgeData?: any
}

export default function NodeDetailsModal({
  isOpen,
  onClose,
  nodeData,
  edgeData
}: NodeDetailsModalProps) {
  if (!isOpen) return null

  const data = nodeData || edgeData
  const title = nodeData ? nodeData.id : edgeData?.id || 'Details'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 overflow-auto max-h-96">
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}