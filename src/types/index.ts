import { Feature, FeatureCollection } from 'geojson'

// Re-export GeoJSON types
export type {
  Feature,
  FeatureCollection,
  GeoJSON,
  Geometry,
  Position,
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
  GeometryCollection,
} from 'geojson'

// Validation types
export interface ValidationError {
  message: string
  path?: string
  code: string
}

export interface ValidationWarning {
  message: string
  path?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

// CRS types
export interface CRSInfo {
  name: string
  epsgCode?: string
  isWGS84: boolean
  isValid: boolean
  warnings: string[]
}

export interface CoordinateValidation {
  valid: boolean
  errors: string[]
  outOfBoundsCount: number
}

// Layer types
export interface Layer {
  id: string
  name: string
  data: FeatureCollection
  visible: boolean
  opacity: number
  style: LayerStyle
  zIndex: number
  crsInfo?: CRSInfo
  coordinateValidation?: CoordinateValidation
}

export interface LayerStyle {
  // Polygon and LineString styling
  color?: string
  fillColor?: string
  fillOpacity?: number
  weight?: number
  opacity?: number
  dashArray?: string

  // Marker (Point/MultiPoint) styling
  markerType?: 'circle' | 'icon' | 'divIcon'
  markerRadius?: number
  markerColor?: string
  markerFillColor?: string
  markerFillOpacity?: number
  markerWeight?: number
  markerOpacity?: number
  markerIconUrl?: string
  markerIconSize?: [number, number]
  markerIconAnchor?: [number, number]
  markerHtml?: string
  markerClassName?: string
}

// Analysis types
export interface StatisticsResult {
  featureCount: number
  geometryTypes: Record<string, number>
  bounds: BoundingBox
  properties: PropertyStatistics[]
  totalArea?: number
  totalLength?: number
  crs?: string
}

export interface BoundingBox {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

export interface PropertyStatistics {
  name: string
  type: 'string' | 'number' | 'boolean' | 'null' | 'mixed'
  uniqueValues: number
  nullCount: number
  min?: number
  max?: number
  mean?: number
  median?: number
  topValues?: Array<{ value: string; count: number }>
}

// Measurement types
export interface MeasurementResult {
  type: 'distance' | 'area' | 'perimeter' | 'bearing'
  value: number
  unit: string
  formattedValue: string
}

// Style types
export interface StyleRule {
  property: string
  type: 'categorical' | 'continuous' | 'gradient'
  mapping: Record<string, LayerStyle> | GradientMapping
}

export interface GradientMapping {
  colorScheme: string[]
  breaks: number[]
  method: 'equal-interval' | 'quantile' | 'natural-breaks'
}

// Export types
export interface ExportOptions {
  format: 'geojson' | 'kml' | 'csv' | 'png'
  includeStyles?: boolean
  selectedOnly?: boolean
  prettify?: boolean
}

// UI State types
export interface SelectedFeature {
  feature: Feature
  layerId: string
}

export interface MapState {
  center: [number, number]
  zoom: number
  baseLayer: string
}
