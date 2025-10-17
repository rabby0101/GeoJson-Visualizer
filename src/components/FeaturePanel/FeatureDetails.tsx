import { useGeoJSONStore } from '@/store/geojson-store'
import { MousePointer2, MapPin, Ruler, Box } from 'lucide-react'
import * as turf from '@turf/turf'

export function FeatureDetails() {
  const { selectedFeature } = useGeoJSONStore()

  if (!selectedFeature) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MousePointer2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Click on a feature to view details</p>
      </div>
    )
  }

  const { feature } = selectedFeature

  // Calculate geometry metadata
  const getGeometryMetadata = () => {
    if (!feature.geometry) return null

    const metadata: any = {
      type: feature.geometry.type,
    }

    try {
      if (feature.geometry.type.includes('Point')) {
        const coords = feature.geometry.type === 'Point'
          ? (feature.geometry as any).coordinates
          : (feature.geometry as any).coordinates[0]
        metadata.coordinates = coords
      }

      if (feature.geometry.type.includes('Polygon')) {
        const area = turf.area(feature as any)
        metadata.area = {
          sqm: area,
          sqkm: area / 1_000_000,
          sqmi: area / 2_589_988,
          hectares: area / 10_000,
          acres: area / 4_046.86,
        }
        const length = turf.length(feature as any, { units: 'kilometers' })
        metadata.perimeter = {
          km: length,
          mi: length * 0.621371,
          m: length * 1000,
        }
      }

      if (feature.geometry.type.includes('LineString')) {
        const length = turf.length(feature as any, { units: 'kilometers' })
        metadata.length = {
          km: length,
          mi: length * 0.621371,
          m: length * 1000,
        }
      }

      // Get center point
      const center = turf.center(feature as any)
      metadata.center = center.geometry.coordinates

      // Get bounding box
      const bbox = turf.bbox(feature as any)
      metadata.bbox = {
        minLng: bbox[0],
        minLat: bbox[1],
        maxLng: bbox[2],
        maxLat: bbox[3],
      }
    } catch (error) {
      console.error('Error calculating geometry metadata:', error)
    }

    return metadata
  }

  const metadata = getGeometryMetadata()

  return (
    <div className="space-y-6">
      {/* Geometry Type */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
          <Box className="h-4 w-4" />
          Geometry Type
        </h3>
        <div className="text-lg font-mono font-bold text-green-900">
          {metadata?.type || 'Unknown'}
        </div>
      </div>

      {/* Measurements */}
      {metadata && (metadata.area || metadata.length || metadata.perimeter) && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Measurements
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            {metadata.area && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Area</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Square Kilometers</span>
                    <span className="font-mono font-medium">
                      {metadata.area.sqkm.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Square Miles</span>
                    <span className="font-mono">{metadata.area.sqmi.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Hectares</span>
                    <span className="font-mono">{metadata.area.hectares.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Acres</span>
                    <span className="font-mono">{metadata.area.acres.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {metadata.length && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Length</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Kilometers</span>
                    <span className="font-mono font-medium">
                      {metadata.length.km.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Miles</span>
                    <span className="font-mono">{metadata.length.mi.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Meters</span>
                    <span className="font-mono">{metadata.length.m.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {metadata.perimeter && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Perimeter</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Kilometers</span>
                    <span className="font-mono font-medium">
                      {metadata.perimeter.km.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Miles</span>
                    <span className="font-mono">{metadata.perimeter.mi.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coordinates */}
      {metadata && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-xs font-mono">
            {metadata.coordinates && (
              <div>
                <div className="text-gray-600 mb-1">Coordinates</div>
                <div className="text-gray-900">
                  Lng: {metadata.coordinates[0].toFixed(6)}°
                </div>
                <div className="text-gray-900">
                  Lat: {metadata.coordinates[1].toFixed(6)}°
                </div>
              </div>
            )}

            {metadata.center && (
              <div className="border-t border-gray-200 pt-2">
                <div className="text-gray-600 mb-1">Center Point</div>
                <div className="text-gray-900">
                  Lng: {metadata.center[0].toFixed(6)}°
                </div>
                <div className="text-gray-900">
                  Lat: {metadata.center[1].toFixed(6)}°
                </div>
              </div>
            )}

            {metadata.bbox && (
              <div className="border-t border-gray-200 pt-2">
                <div className="text-gray-600 mb-1">Bounding Box</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-gray-500 mb-0.5">Southwest</div>
                    <div className="text-gray-900">{metadata.bbox.minLng.toFixed(6)}°</div>
                    <div className="text-gray-900">{metadata.bbox.minLat.toFixed(6)}°</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">Northeast</div>
                    <div className="text-gray-900">{metadata.bbox.maxLng.toFixed(6)}°</div>
                    <div className="text-gray-900">{metadata.bbox.maxLat.toFixed(6)}°</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Properties */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Properties</h3>
        {feature.properties && Object.keys(feature.properties).length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {Object.entries(feature.properties).map(([key, value], idx) => (
              <div
                key={key}
                className={`flex justify-between py-2 px-3 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">{key}</span>
                <span className="text-sm text-gray-900 font-mono text-right max-w-[200px] truncate">
                  {value === null ? (
                    <span className="text-gray-400 italic">null</span>
                  ) : typeof value === 'object' ? (
                    <span className="text-gray-600 italic">Object</span>
                  ) : (
                    String(value)
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-4 text-center">
            No properties available
          </div>
        )}
      </div>
    </div>
  )
}
