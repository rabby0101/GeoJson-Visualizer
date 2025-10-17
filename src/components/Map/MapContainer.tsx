import { useEffect, useMemo } from 'react'
import { MapContainer as LeafletMap, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useGeoJSONStore } from '@/store/geojson-store'
import { applyFilters } from '@/lib/utils/filter-helpers'
import { MeasurementLayer } from './MeasurementLayer'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
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
    selectedFeature,
    selectionMode,
    selectedFeatures,
    toggleSelectedFeature,
  } = useGeoJSONStore()

  // Apply filters to each layer and separate points from other geometries
  const filteredLayers = useMemo(() => {
    return layers
      .filter((layer) => layer.visible)
      .map((layer) => {
        const filteredFeatures = applyFilters(layer.data.features, filterCriteria)

        // Separate points from other geometry types for clustering
        const pointFeatures = filteredFeatures.filter(
          (f) => f.geometry?.type === 'Point' || f.geometry?.type === 'MultiPoint'
        )
        const nonPointFeatures = filteredFeatures.filter(
          (f) => f.geometry?.type !== 'Point' && f.geometry?.type !== 'MultiPoint'
        )

        return {
          ...layer,
          data: {
            ...layer.data,
            features: filteredFeatures,
          } as FeatureCollection,
          pointData: {
            type: 'FeatureCollection' as const,
            features: pointFeatures,
          },
          nonPointData: {
            type: 'FeatureCollection' as const,
            features: nonPointFeatures,
          },
          shouldCluster: pointFeatures.length > 100, // Auto-enable clustering for >100 points
          useCanvas: filteredFeatures.length > 1000, // Use canvas renderer for >1000 features
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

        {filteredLayers.map((layer) => {
          const getFeatureStyle = (feature: any) => {
            // Check if feature is in selected features array (multiple selection)
            const isInMultiSelection = selectedFeatures.some(
              (sf) =>
                sf.layerId === layer.id &&
                (sf.feature.id === feature?.id || sf.feature === feature)
            )

            // Check if this is the single selected feature
            const isSingleSelected =
              selectedFeature?.layerId === layer.id &&
              (selectedFeature?.feature.id === feature?.id ||
                selectedFeature?.feature === feature)

            const isSelected = isInMultiSelection || isSingleSelected

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
          }

          const pointToLayer = (feature: any, latlng: L.LatLng) => {
            const style = getFeatureStyle(feature)
            const markerType = style.markerType || 'circle'

            // Check if selected for styling
            const isInMultiSelection = selectedFeatures.some(
              (sf) =>
                sf.layerId === layer.id &&
                (sf.feature.id === feature?.id || sf.feature === feature)
            )
            const isSingleSelected =
              selectedFeature?.layerId === layer.id &&
              (selectedFeature?.feature.id === feature?.id ||
                selectedFeature?.feature === feature)
            const isSelected = isInMultiSelection || isSingleSelected

            if (markerType === 'circle') {
              return L.circleMarker(latlng, {
                radius: isSelected ? (style.markerRadius || 8) + 2 : (style.markerRadius || 8),
                color: isSelected ? '#2563eb' : (style.markerColor || style.color || '#1e40af'),
                fillColor: isSelected ? '#3b82f6' : (style.markerFillColor || style.fillColor || '#3b82f6'),
                fillOpacity: style.markerFillOpacity ?? style.fillOpacity ?? 0.6,
                weight: isSelected ? 3 : (style.markerWeight || style.weight || 2),
                opacity: style.markerOpacity ?? style.opacity ?? 1,
              })
            } else if (markerType === 'icon' && style.markerIconUrl) {
              const icon = L.icon({
                iconUrl: style.markerIconUrl,
                iconSize: style.markerIconSize || [25, 41],
                iconAnchor: style.markerIconAnchor || [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                shadowSize: [41, 41],
              })
              return L.marker(latlng, { icon })
            } else if (markerType === 'divIcon') {
              const icon = L.divIcon({
                html: style.markerHtml || '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                className: style.markerClassName || 'custom-marker',
                iconSize: style.markerIconSize || [12, 12],
                iconAnchor: style.markerIconAnchor || [6, 6],
              })
              return L.marker(latlng, { icon })
            }

            // Default to circle marker
            return L.circleMarker(latlng, {
              radius: 8,
              color: '#1e40af',
              fillColor: '#3b82f6',
              fillOpacity: 0.6,
              weight: 2,
            })
          }

          const handleFeatureClick = (feature: any, leafletLayer: L.Layer) => {
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
          }

          return (
            <>
              {/* Render non-point geometries (lines, polygons) with standard rendering */}
              {layer.nonPointData.features.length > 0 && (
                <GeoJSON
                  key={`${layer.id}-nonpoint-${filterCriteria.searchText}-${filterCriteria.geometryTypes.join(',')}-${filterCriteria.propertyFilters.length}-${selectedFeature?.layerId === layer.id ? selectedFeature?.feature.id || 'selected' : 'none'}-${JSON.stringify(layer.style)}`}
                  data={layer.nonPointData}
                  style={getFeatureStyle}
                  onEachFeature={handleFeatureClick}
                />
              )}

              {/* Render point geometries with clustering for large datasets */}
              {layer.pointData.features.length > 0 && (
                <>
                  {layer.shouldCluster ? (
                    <MarkerClusterGroup
                      key={`${layer.id}-points-clustered`}
                      chunkedLoading
                      showCoverageOnHover={false}
                    >
                      <GeoJSON
                        data={layer.pointData}
                        pointToLayer={pointToLayer}
                        onEachFeature={handleFeatureClick}
                      />
                    </MarkerClusterGroup>
                  ) : (
                    <GeoJSON
                      key={`${layer.id}-points-${filterCriteria.searchText}-${JSON.stringify(layer.style)}-${selectedFeature?.layerId === layer.id ? selectedFeature?.feature.id || 'selected' : 'none'}`}
                      data={layer.pointData}
                      pointToLayer={pointToLayer}
                      onEachFeature={handleFeatureClick}
                    />
                  )}
                </>
              )}
            </>
          )
        })}

        {/* Measurement Layer */}
        <MeasurementLayer />
      </LeafletMap>
    </div>
  )
}
