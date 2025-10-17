import { useState } from 'react'
import { Search, Filter, MapPin, Circle, Box } from 'lucide-react'
import { useGeoJSONStore } from '@/store/geojson-store'
import { SpatialQuery, SpatialRelation } from '@/lib/query/spatial-query'

export function SpatialQueryPanel() {
  const { layers, setQueryResults, addSelectedFeature, clearSelection } = useGeoJSONStore()

  const [queryType, setQueryType] = useState<'spatial' | 'attribute'>('attribute')
  const [selectedLayerId, setSelectedLayerId] = useState<string>('')
  const [relation, setRelation] = useState<SpatialRelation>('intersects')
  const [bufferDistance, setBufferDistance] = useState<number>(0)

  // Attribute query state
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [operator, setOperator] = useState<
    '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith'
  >('=')
  const [queryValue, setQueryValue] = useState<string>('')

  const activeLayers = layers.filter((l) => l.visible)
  const selectedLayer = layers.find((l) => l.id === selectedLayerId)

  // Get available properties from selected layer
  const availableProperties = selectedLayer
    ? Array.from(
        new Set(
          selectedLayer.data.features.flatMap((f) =>
            f.properties ? Object.keys(f.properties) : []
          )
        )
      )
    : []

  const handleAttributeQuery = () => {
    if (!selectedLayer || !selectedProperty) return

    const results = SpatialQuery.queryByAttribute(
      selectedLayer.data.features,
      selectedProperty,
      operator,
      queryValue
    )

    setQueryResults(results)

    // Auto-select results
    clearSelection()
    results.forEach((feature) => {
      addSelectedFeature({ feature, layerId: selectedLayerId })
    })
  }

  const handleNearestQuery = () => {
    if (!selectedLayer) return

    // This would require a point to be selected
    // For now, we'll show a message
    alert('Click on the map to select a point, then use this tool to find nearest features')
  }

  const handleBufferQuery = () => {
    if (!selectedLayer) return

    alert('Draw or select a feature to create a buffer query')
  }

  const spatialRelations: Array<{ value: SpatialRelation; label: string }> = [
    { value: 'intersects', label: 'Intersects' },
    { value: 'contains', label: 'Contains' },
    { value: 'within', label: 'Within' },
    { value: 'overlaps', label: 'Overlaps' },
    { value: 'touches', label: 'Touches' },
    { value: 'crosses', label: 'Crosses' },
    { value: 'disjoint', label: 'Disjoint' },
  ]

  const operators = [
    { value: '=', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
    { value: '>', label: 'Greater Than' },
    { value: '<', label: 'Less Than' },
    { value: '>=', label: 'Greater or Equal' },
    { value: '<=', label: 'Less or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
  ]

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Search className="h-4 w-4" />
          Query Features
        </h3>
      </div>

      {/* Query Type Selection */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Query Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setQueryType('attribute')}
            className={`px-3 py-2 text-xs rounded border transition-colors ${
              queryType === 'attribute'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            <Filter className="h-4 w-4 inline mr-1" />
            Attribute
          </button>
          <button
            onClick={() => setQueryType('spatial')}
            className={`px-3 py-2 text-xs rounded border transition-colors ${
              queryType === 'spatial'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-1" />
            Spatial
          </button>
        </div>
      </div>

      {/* Layer Selection */}
      {activeLayers.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Select Layer
          </label>
          <select
            value={selectedLayerId || activeLayers[0]?.id || ''}
            onChange={(e) => setSelectedLayerId(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {activeLayers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Attribute Query */}
      {queryType === 'attribute' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Property
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedLayer}
            >
              <option value="">Select a property...</option>
              {availableProperties.map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Operator
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Value
            </label>
            <input
              type="text"
              value={queryValue}
              onChange={(e) => setQueryValue(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleAttributeQuery}
            disabled={!selectedLayer || !selectedProperty || !queryValue}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Run Query
          </button>
        </div>
      )}

      {/* Spatial Query */}
      {queryType === 'spatial' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Spatial Relation
            </label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as SpatialRelation)}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {spatialRelations.map((rel) => (
                <option key={rel.value} value={rel.value}>
                  {rel.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Buffer Distance (meters)
            </label>
            <input
              type="number"
              value={bufferDistance}
              onChange={(e) => setBufferDistance(Number(e.target.value))}
              min="0"
              step="100"
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={handleBufferQuery}
              disabled={!selectedLayer}
              className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Circle className="h-4 w-4" />
              Query by Buffer
            </button>

            <button
              onClick={handleNearestQuery}
              disabled={!selectedLayer}
              className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Find Nearest
            </button>

            <button
              onClick={() => alert('Draw a box on the map to select features')}
              disabled={!selectedLayer}
              className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Box className="h-4 w-4" />
              Query by Box
            </button>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {activeLayers.length === 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          Load a GeoJSON file to enable query tools
        </div>
      )}
    </div>
  )
}
