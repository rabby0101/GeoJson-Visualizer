import { useState } from 'react'
import { useGeoJSONStore } from '@/store/geojson-store'
import { SearchFilter } from './SearchFilter'
import { FeatureList } from './FeatureList'
import { Layers, ChevronDown, ChevronRight } from 'lucide-react'

export function FeaturesView() {
  const { layers } = useGeoJSONStore()
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())

  // Get all features from visible layers
  const visibleLayers = layers.filter((layer) => layer.visible)

  // Initialize all layers as expanded
  if (expandedLayers.size === 0 && visibleLayers.length > 0) {
    setExpandedLayers(new Set(visibleLayers.map((layer) => layer.id)))
  }

  const toggleLayer = (layerId: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layerId)) {
        next.delete(layerId)
      } else {
        next.add(layerId)
      }
      return next
    })
  }

  if (visibleLayers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No layers loaded</p>
        <p className="text-xs mt-1">Upload a GeoJSON file to view features</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter Section */}
      <SearchFilter
        features={visibleLayers.flatMap((layer) => layer.data.features)}
      />

      {/* Feature Lists by Layer */}
      <div className="flex-1 overflow-y-auto">
        {visibleLayers.map((layer) => {
          const isExpanded = expandedLayers.has(layer.id)

          return (
            <div key={layer.id} className="border-b border-gray-200 last:border-b-0">
              {/* Collapsible Layer Header */}
              <button
                onClick={() => toggleLayer(layer.id)}
                className="w-full px-4 py-2 bg-gray-100 border-b border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {layer.name}
                    <span className="text-xs font-normal text-gray-500">
                      ({layer.data.features.length} features)
                    </span>
                  </h3>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </div>
              </button>

              {/* Feature List (collapsible) */}
              {isExpanded && (
                <FeatureList layerId={layer.id} features={layer.data.features} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
