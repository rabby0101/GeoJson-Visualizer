import { useGeoJSONStore } from '@/store/geojson-store'
import { Ruler, Square, Navigation, Trash2, X } from 'lucide-react'

export function MeasurementResults() {
  const { measurements, removeMeasurement, clearAllMeasurements } =
    useGeoJSONStore()

  if (measurements.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'distance':
        return <Ruler className="h-4 w-4" />
      case 'area':
        return <Square className="h-4 w-4" />
      case 'bearing':
        return <Navigation className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="absolute bottom-4 right-4 z-[1000] max-w-sm">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Measurements ({measurements.length})
          </h3>
          <button
            onClick={clearAllMeasurements}
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Clear all measurements"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Measurement list */}
        <div className="max-h-64 overflow-y-auto">
          {measurements.map((measurement) => (
            <div
              key={measurement.id}
              className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <div className="text-green-600 mt-0.5">{getIcon(measurement.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {measurement.type}
                </div>
                <div className="text-sm text-gray-600">{measurement.label}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {measurement.coordinates.length} points
                </div>
              </div>
              <button
                onClick={() => removeMeasurement(measurement.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Remove measurement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
