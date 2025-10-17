import { useGeoJSONStore } from '@/store/geojson-store'

export function AttributeTable() {
  const { layers } = useGeoJSONStore()

  if (layers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Load a GeoJSON file to view attribute table
      </div>
    )
  }

  // Show table for the first visible layer
  const layer = layers.find((l) => l.visible) || layers[0]

  if (!layer || layer.data.features.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No features in this layer
      </div>
    )
  }

  const properties = Object.keys(layer.data.features[0]?.properties || {})

  return (
    <div className="h-full flex flex-col">
      {/* Table Header */}
      <div className="bg-gray-50 border-b sticky top-0 z-10">
        <div className="flex text-sm">
          <div className="px-3 py-2 font-medium text-gray-700 w-16 flex-shrink-0">
            #
          </div>
          {properties.map((prop) => (
            <div
              key={prop}
              className="px-3 py-2 font-medium text-gray-700 flex-1 min-w-[120px]"
            >
              {prop}
            </div>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto text-sm">
        <div>
          {layer.data.features.map((feature, index) => (
            <div
              key={index}
              className="flex border-b hover:bg-gray-50"
            >
              <div className="px-3 py-2 text-gray-500 w-16 flex-shrink-0">
                {index + 1}
              </div>
              {properties.map((prop) => (
                <div key={prop} className="px-3 py-2 flex-1 min-w-[120px] truncate">
                  {String(feature.properties?.[prop] || '')}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
