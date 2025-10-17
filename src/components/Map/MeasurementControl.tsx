import { useGeoJSONStore } from '@/store/geojson-store'
import { Ruler, Square, Navigation, X } from 'lucide-react'

export function MeasurementControl() {
  const { measurementMode, setMeasurementMode, clearCurrentMeasurement } =
    useGeoJSONStore()

  const tools = [
    {
      id: 'distance' as const,
      icon: Ruler,
      label: 'Distance',
      description: 'Measure distance between points',
    },
    {
      id: 'area' as const,
      icon: Square,
      label: 'Area',
      description: 'Measure polygon area',
    },
    {
      id: 'bearing' as const,
      icon: Navigation,
      label: 'Bearing',
      description: 'Measure direction between two points',
    },
  ]

  const handleToolClick = (toolId: typeof measurementMode) => {
    if (measurementMode === toolId) {
      // Deactivate if clicking the same tool
      setMeasurementMode(null)
    } else {
      setMeasurementMode(toolId)
    }
  }

  return (
    <div className="absolute top-20 left-4 z-[1000] flex flex-col gap-2">
      {/* Tool buttons */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = measurementMode === tool.id

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`flex items-center gap-3 px-4 py-3 w-full transition-all border-b border-gray-200 last:border-b-0 ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-white text-gray-700 hover:bg-gray-100 font-medium'
              }`}
              title={tool.description}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm whitespace-nowrap">
                {tool.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active measurement info */}
      {measurementMode && (
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1">
                {tools.find((t) => t.id === measurementMode)?.label} Mode
              </p>
              <p className="text-xs opacity-90">
                {measurementMode === 'distance' &&
                  'Click points on map. Double-click to finish.'}
                {measurementMode === 'area' &&
                  'Click to draw polygon. Double-click to close.'}
                {measurementMode === 'bearing' && 'Click two points on map.'}
              </p>
            </div>
            <button
              onClick={() => {
                setMeasurementMode(null)
                clearCurrentMeasurement()
              }}
              className="text-white hover:text-blue-200 transition-colors"
              title="Cancel measurement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
