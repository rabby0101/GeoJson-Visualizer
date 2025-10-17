import { useEffect, useMemo } from 'react'
import { MapContainer as LeafletMap, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet'
import { useGeoJSONStore } from '@/store/geojson-store'
import { applyFilters } from '@/lib/utils/filter-helpers'
import { MeasurementControl } from './MeasurementControl'
import { MeasurementLayer } from './MeasurementLayer'
import { MeasurementResults } from './MeasurementResults'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { FeatureCollection } from 'geojson'

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Component to handle auto-zoom to layers
function FitBoundsToLayers() {
  const map = useMap()
  const { layers } = useGeoJSONStore()

  useEffect(() => {
    if (layers.length > 0) {
      // Get all visible layers
      const visibleLayers = layers.filter((layer) => layer.visible)

      if (visibleLayers.length > 0) {
        // Create a feature group from all visible layer data
        const allFeatures: any[] = []
        visibleLayers.forEach((layer) => {
          layer.data.features.forEach((feature) => {
            allFeatures.push(feature)
          })
        })

        if (allFeatures.length > 0) {
          // Create a temporary GeoJSON layer to get bounds
          const tempLayer = L.geoJSON(allFeatures as any)
          const bounds = tempLayer.getBounds()

          if (bounds.isValid()) {
            // Fly to the bounds with animation
            map.flyToBounds(bounds, {
              padding: [50, 50],
              duration: 1.5,
              maxZoom: 16
            })
          }
        }
      }
    }
  }, [layers, map])

  return null
}

// Component to handle fly-to feature requests
function FlyToFeatureHandler() {
  const map = useMap()
  const { flyToFeatureRequest } = useGeoJSONStore()

  useEffect(() => {
    if (flyToFeatureRequest) {
      const { feature } = flyToFeatureRequest

      // Create a temporary layer to get bounds
      const tempLayer = L.geoJSON(feature as any)
      const bounds = tempLayer.getBounds()

      if (bounds.isValid()) {
        // Check if it's a point to use appropriate zoom
        if (feature.geometry?.type === 'Point') {
          const coords = feature.geometry.coordinates
          map.flyTo([coords[1], coords[0]], 15, {
            duration: 1.0,
          })
        } else {
          // For polygons and lines, fly to bounds
          map.flyToBounds(bounds, {
            padding: [100, 100],
            duration: 1.0,
            maxZoom: 15,
          })
        }
      }
    }
  }, [flyToFeatureRequest, map])

  return null
}

export function MapContainer() {
  const {
    layers,
    filterCriteria,
    setSelectedFeature,
    selectionMode,
    selectedFeatures,
    toggleSelectedFeature,
  } = useGeoJSONStore()

  // Apply filters to each layer
  const filteredLayers = useMemo(() => {
    return layers
      .filter((layer) => layer.visible)
      .map((layer) => {
        const filteredFeatures = applyFilters(layer.data.features, filterCriteria)
        return {
          ...layer,
          data: {
            ...layer.data,
            features: filteredFeatures,
          } as FeatureCollection,
        }
      })
  }, [layers, filterCriteria])

  return (
    <div className="h-full w-full relative">
      <LeafletMap
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <FitBoundsToLayers />
        <FlyToFeatureHandler />

        {filteredLayers.map((layer) => (
          <GeoJSON
            key={`${layer.id}-${filterCriteria.searchText}-${filterCriteria.geometryTypes.join(',')}-${filterCriteria.propertyFilters.length}`}
            data={layer.data}
            style={(feature) => {
              // Check if feature is in selected features array
              const isSelected = selectedFeatures.some(
                (sf) =>
                  sf.layerId === layer.id &&
                  (sf.feature.id === feature?.id || sf.feature === feature)
              )

              if (isSelected) {
                return {
                  ...layer.style,
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  weight: 4,
                  fillOpacity: 0.4,
                }
              }

              return layer.style
            }}
            onEachFeature={(feature, leafletLayer) => {
              leafletLayer.on('click', (e) => {
                // Prevent event from propagating to map
                L.DomEvent.stopPropagation(e)

                const selectedFeatureObj = { feature, layerId: layer.id }

                if (selectionMode === 'single') {
                  setSelectedFeature(selectedFeatureObj)
                } else if (selectionMode === 'multiple') {
                  toggleSelectedFeature(selectedFeatureObj)
                } else {
                  // Default behavior for other modes
                  setSelectedFeature(selectedFeatureObj)
                }
              })

              // Add popup with properties
              if (feature.properties) {
                const popupContent = Object.entries(feature.properties)
                  .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                  .join('<br/>')
                leafletLayer.bindPopup(popupContent)
              }
            }}
          />
        ))}

        {/* Measurement Layer */}
        <MeasurementLayer />
      </LeafletMap>

      {/* Measurement Controls (outside map but positioned absolutely) */}
      <MeasurementControl />
      <MeasurementResults />
    </div>
  )
}
