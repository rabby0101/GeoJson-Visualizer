import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { useGeoJSONStore } from '@/store/geojson-store'

export function LayerList() {
  const { layers, setLayerVisibility, removeLayer } = useGeoJSONStore()

  if (layers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No layers loaded. Upload a GeoJSON file to get started.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Active Layers</h3>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate flex-1">
              {layer.name}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLayerVisibility(layer.id, !layer.visible)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title={layer.visible ? 'Hide layer' : 'Show layer'}
              >
                {layer.visible ? (
                  <Eye className="h-4 w-4 text-gray-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => removeLayer(layer.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                title="Remove layer"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {layer.data.features.length} features
          </div>
        </div>
      ))}
    </div>
  )
}
