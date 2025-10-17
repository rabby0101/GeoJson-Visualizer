import { useGeoJSONStore } from '@/store/geojson-store'
import { applyFilters } from '@/lib/utils/filter-helpers'
import { Feature } from 'geojson'
import { MapPin, Box, Circle } from 'lucide-react'

interface FeatureListProps {
  layerId: string
  features: Feature[]
}

export function FeatureList({ layerId, features }: FeatureListProps) {
  const { filterCriteria, selectedFeature, flyToFeature } = useGeoJSONStore()

  // Apply filters
  const filteredFeatures = applyFilters(features, filterCriteria)

  const getGeometryIcon = (type: string) => {
    if (type.includes('Point')) return <Circle className="h-4 w-4" />
    if (type.includes('Polygon')) return <Box className="h-4 w-4" />
    return <MapPin className="h-4 w-4" />
  }

  const getFeatureLabel = (feature: Feature, index: number): string => {
    if (feature.properties) {
      // Try common name properties
      const nameProps = ['name', 'Name', 'NAME', 'title', 'id', 'ID']
      for (const prop of nameProps) {
        if (feature.properties[prop]) {
          return String(feature.properties[prop])
        }
      }

      // Use first property if available
      const firstKey = Object.keys(feature.properties)[0]
      if (firstKey) {
        return `${firstKey}: ${feature.properties[firstKey]}`
      }
    }

    return `Feature ${index + 1}`
  }

  if (filteredFeatures.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm text-gray-500">
          {features.length === 0
            ? 'No features in this layer'
            : 'No features match the current filters'}
        </p>
        {features.length > 0 && filteredFeatures.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Try adjusting your search or filter criteria
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Results Count */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-600">
          Showing <span className="font-semibold">{filteredFeatures.length}</span> of{' '}
          <span className="font-semibold">{features.length}</span> features
        </p>
      </div>

      {/* Feature Items */}
      <div className="max-h-96 overflow-y-auto">
        {filteredFeatures.map((feature, index) => {
          const isSelected =
            selectedFeature?.layerId === layerId &&
            selectedFeature?.feature === feature

          return (
            <button
              key={index}
              onClick={() => flyToFeature(feature, layerId)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-4 ${
                isSelected
                  ? 'bg-blue-50 border-l-blue-600'
                  : 'border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 ${
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {getGeometryIcon(feature.geometry?.type || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {getFeatureLabel(feature, index)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {feature.geometry?.type}
                    </span>
                    {feature.properties && (
                      <span className="text-xs text-gray-500">
                        {Object.keys(feature.properties).length} properties
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
