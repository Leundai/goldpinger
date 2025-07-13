interface NetworkControlsProps {
  onReload: () => void;
}

export default function NetworkControls({ onReload }: NetworkControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white/90 rounded-lg shadow-md p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onReload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Reload
        </button>

        <div className="text-sm text-gray-600">
          Click nodes/edges for details
        </div>
      </div>
    </div>
  );
}
