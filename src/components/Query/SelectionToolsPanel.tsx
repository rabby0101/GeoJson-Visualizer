import { useState } from 'react'
import {
  MousePointer,
  Box,
  X,
  CheckSquare,
} from 'lucide-react'
import { useGeoJSONStore, SelectionMode } from '@/store/geojson-store'

export function SelectionToolsPanel() {
  const {
    selectionMode,
    selectedFeatures,
    layers,
    setSelectionMode,
    clearSelection,
    selectAll,
  } = useGeoJSONStore()

  const [activeLayerId, setActiveLayerId] = useState<string>('')

  const activeLayers = layers.filter((l) => l.visible)

  const handleSelectionModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode)
    if (mode === 'single') {
      clearSelection()
    }
  }

  const handleSelectAll = () => {
    if (activeLayerId) {
      selectAll(activeLayerId)
    } else if (activeLayers.length > 0) {
      selectAll(activeLayers[0].id)
    }
  }

  const selectionModes: Array<{ mode: SelectionMode; icon: typeof MousePointer; label: string }> = [
    { mode: 'single', icon: MousePointer, label: 'Single' },
    { mode: 'multiple', icon: CheckSquare, label: 'Multiple' },
    { mode: 'box', icon: Box, label: 'Box Select' },
  ]

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Selection Tools
        </h3>
        {selectedFeatures.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear ({selectedFeatures.length})
          </button>
        )}
      </div>

      {/* Selection Mode */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Selection Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {selectionModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => handleSelectionModeChange(mode)}
              className={`px-3 py-2 text-xs rounded border transition-colors flex flex-col items-center gap-1 ${
                selectionMode === mode
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Selection */}
      {activeLayers.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Active Layer
          </label>
          <select
            value={activeLayerId || activeLayers[0]?.id || ''}
            onChange={(e) => setActiveLayerId(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {activeLayers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name} ({layer.data.features.length} features)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Quick Actions
        </label>
        <div className="space-y-2">
          <button
            onClick={handleSelectAll}
            disabled={activeLayers.length === 0}
            className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors flex items-center justify-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            Select All in Layer
          </button>

          {selectedFeatures.length > 0 && (
            <button
              onClick={clearSelection}
              className="w-full px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Selection Info */}
      {selectedFeatures.length > 0 && (
        <div className="pt-3 border-t">
          <div className="text-xs text-gray-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Selected Features:</span>
              <span className="text-blue-600 font-semibold">
                {selectedFeatures.length}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              {selectedFeatures.slice(0, 5).map((sf, idx) => {
                const layer = layers.find((l) => l.id === sf.layerId)
                const featureName =
                  sf.feature.properties?.name ||
                  sf.feature.properties?.id ||
                  `Feature ${idx + 1}`

                return (
                  <div
                    key={`${sf.layerId}-${sf.feature.id || idx}`}
                    className="text-xs bg-gray-50 rounded px-2 py-1 flex items-center justify-between"
                  >
                    <span className="truncate">{featureName}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {layer?.name}
                    </span>
                  </div>
                )
              })}

              {selectedFeatures.length > 5 && (
                <div className="text-xs text-gray-400 text-center pt-1">
                  ... and {selectedFeatures.length - 5} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {activeLayers.length === 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          Load a GeoJSON file to enable selection tools
        </div>
      )}
    </div>
  )
}
