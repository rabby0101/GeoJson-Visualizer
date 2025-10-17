import { useGeoJSONStore } from '@/store/geojson-store'
import { BarChart3, MapPin, Box, Database, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export function StatisticsView() {
  const { statistics } = useGeoJSONStore()
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null)

  if (!statistics) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Load a GeoJSON file to view statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Box className="h-4 w-4" />
          Dataset Overview
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between py-1.5">
            <span className="text-sm text-blue-800">Total Features</span>
            <span className="text-sm font-bold text-blue-900">{statistics.featureCount}</span>
          </div>
          {statistics.crs && (
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-blue-800">CRS</span>
              <span className="text-xs font-mono text-blue-900">{statistics.crs}</span>
            </div>
          )}
        </div>
      </div>

      {/* Geometry Types Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Geometry Types
        </h3>
        <div className="space-y-2">
          {Object.entries(statistics.geometryTypes).map(([type, count]) => {
            const percentage = ((count / statistics.featureCount) * 100).toFixed(1)
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{type}</span>
                  <span className="text-xs text-gray-500">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Measurements Section */}
      {(statistics.totalArea || statistics.totalLength) && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Measurements
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {statistics.totalArea && (
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600">Total Area</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {statistics.totalArea.toFixed(2)} km²
                  </div>
                  <div className="text-xs text-gray-500">
                    {(statistics.totalArea * 0.386102).toFixed(2)} mi²
                  </div>
                </div>
              </div>
            )}
            {statistics.totalLength && (
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600">Total Length</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {statistics.totalLength.toFixed(2)} km
                  </div>
                  <div className="text-xs text-gray-500">
                    {(statistics.totalLength * 0.621371).toFixed(2)} mi
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bounding Box Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Bounding Box
        </h3>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-gray-500 mb-1">Southwest</div>
              <div className="text-gray-900">
                {statistics.bounds.minLng.toFixed(6)}°
              </div>
              <div className="text-gray-900">
                {statistics.bounds.minLat.toFixed(6)}°
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Northeast</div>
              <div className="text-gray-900">
                {statistics.bounds.maxLng.toFixed(6)}°
              </div>
              <div className="text-gray-900">
                {statistics.bounds.maxLat.toFixed(6)}°
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="text-gray-500 mb-1">Extent</div>
            <div className="text-gray-900">
              Width: {Math.abs(statistics.bounds.maxLng - statistics.bounds.minLng).toFixed(4)}°
            </div>
            <div className="text-gray-900">
              Height: {Math.abs(statistics.bounds.maxLat - statistics.bounds.minLat).toFixed(4)}°
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      {statistics.properties && statistics.properties.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Properties ({statistics.properties.length})
          </h3>
          <div className="space-y-2">
            {statistics.properties.map((prop) => (
              <div
                key={prop.name}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedProperty(
                      expandedProperty === prop.name ? null : prop.name
                    )
                  }
                  className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {prop.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {prop.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {expandedProperty === prop.name ? '▼' : '▶'}
                  </span>
                </button>

                {expandedProperty === prop.name && (
                  <div className="px-3 py-3 bg-white space-y-2 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Unique Values</span>
                      <span className="font-medium text-gray-900">
                        {prop.uniqueValues}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Null Count</span>
                      <span className="font-medium text-gray-900">
                        {prop.nullCount}
                      </span>
                    </div>

                    {prop.type === 'number' && (
                      <>
                        <div className="border-t pt-2 mt-2" />
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Min</span>
                          <span className="font-mono text-gray-900">
                            {prop.min?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Max</span>
                          <span className="font-mono text-gray-900">
                            {prop.max?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Mean</span>
                          <span className="font-mono text-gray-900">
                            {prop.mean?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Median</span>
                          <span className="font-mono text-gray-900">
                            {prop.median?.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    {prop.type === 'string' && prop.topValues && (
                      <>
                        <div className="border-t pt-2 mt-2" />
                        <div className="text-gray-600 mb-2">Top Values</div>
                        {prop.topValues.slice(0, 5).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between py-1 pl-2"
                          >
                            <span className="text-gray-700 truncate max-w-[150px]">
                              {item.value}
                            </span>
                            <span className="font-medium text-gray-900">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
