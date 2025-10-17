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
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
            {properties.map((prop) => (
              <th
                key={prop}
                className="px-3 py-2 text-left font-medium text-gray-700"
              >
                {prop}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {layer.data.features.slice(0, 100).map((feature, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-500">{index + 1}</td>
              {properties.map((prop) => (
                <td key={prop} className="px-3 py-2">
                  {String(feature.properties?.[prop] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {layer.data.features.length > 100 && (
        <div className="text-center py-4 text-sm text-gray-500">
          Showing 100 of {layer.data.features.length} features
        </div>
      )}
    </div>
  )
}
