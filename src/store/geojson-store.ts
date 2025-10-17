import { create } from 'zustand'
import { Layer, SelectedFeature, StatisticsResult } from '@/types'
import { Feature, Position } from 'geojson'
import { MeasurementResult } from '@/lib/utils/measurements'

export interface FilterCriteria {
  searchText: string
  geometryTypes: string[]
  propertyFilters: Array<{
    property: string
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
    value: string | number
  }>
}

export interface FlyToFeatureRequest {
  feature: Feature
  layerId: string
  timestamp: number
}

export type MeasurementMode = 'distance' | 'area' | 'bearing' | null
export type SelectionMode = 'single' | 'multiple' | 'box' | null

interface GeoJSONState {
  // Data
  layers: Layer[]
  selectedFeature: SelectedFeature | null
  selectedFeatures: SelectedFeature[]
  statistics: StatisticsResult | null

  // Filter state
  filterCriteria: FilterCriteria

  // Map interaction
  flyToFeatureRequest: FlyToFeatureRequest | null

  // Selection state
  selectionMode: SelectionMode
  queryResults: Feature[]

  // Measurement state
  measurementMode: MeasurementMode
  measurements: MeasurementResult[]
  currentMeasurementPoints: Position[]

  // Actions
  addLayer: (layer: Layer) => void
  removeLayer: (layerId: string) => void
  updateLayer: (layerId: string, updates: Partial<Layer>) => void
  setLayerVisibility: (layerId: string, visible: boolean) => void
  setSelectedFeature: (feature: SelectedFeature | null) => void
  setStatistics: (stats: StatisticsResult | null) => void
  setFilterCriteria: (criteria: Partial<FilterCriteria>) => void
  resetFilters: () => void
  flyToFeature: (feature: Feature, layerId: string) => void
  clearAll: () => void

  // Selection actions
  setSelectionMode: (mode: SelectionMode) => void
  addSelectedFeature: (feature: SelectedFeature) => void
  removeSelectedFeature: (featureId: string | number, layerId: string) => void
  toggleSelectedFeature: (feature: SelectedFeature) => void
  clearSelection: () => void
  selectAll: (layerId: string) => void
  setQueryResults: (results: Feature[]) => void

  // Measurement actions
  setMeasurementMode: (mode: MeasurementMode) => void
  addMeasurementPoint: (point: Position) => void
  completeMeasurement: () => void
  clearCurrentMeasurement: () => void
  removeMeasurement: (id: string) => void
  clearAllMeasurements: () => void
}

export const useGeoJSONStore = create<GeoJSONState>((set, get) => ({
  // Initial state
  layers: [],
  selectedFeature: null,
  selectedFeatures: [],
  statistics: null,
  filterCriteria: {
    searchText: '',
    geometryTypes: [],
    propertyFilters: [],
  },
  flyToFeatureRequest: null,
  selectionMode: 'single',
  queryResults: [],
  measurementMode: null,
  measurements: [],
  currentMeasurementPoints: [],

  // Actions
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),

  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== layerId),
      selectedFeature:
        state.selectedFeature?.layerId === layerId
          ? null
          : state.selectedFeature,
    })),

  updateLayer: (layerId, updates) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, ...updates } : l
      ),
    })),

  setLayerVisibility: (layerId, visible) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, visible } : l
      ),
    })),

  setSelectedFeature: (feature) =>
    set({ selectedFeature: feature }),

  setStatistics: (stats) =>
    set({ statistics: stats }),

  setFilterCriteria: (criteria) =>
    set((state) => ({
      filterCriteria: {
        ...state.filterCriteria,
        ...criteria,
      },
    })),

  resetFilters: () =>
    set({
      filterCriteria: {
        searchText: '',
        geometryTypes: [],
        propertyFilters: [],
      },
    }),

  flyToFeature: (feature, layerId) =>
    set({
      flyToFeatureRequest: {
        feature,
        layerId,
        timestamp: Date.now(),
      },
      selectedFeature: {
        feature,
        layerId,
      },
    }),

  clearAll: () =>
    set({
      layers: [],
      selectedFeature: null,
      selectedFeatures: [],
      statistics: null,
      filterCriteria: {
        searchText: '',
        geometryTypes: [],
        propertyFilters: [],
      },
      flyToFeatureRequest: null,
      queryResults: [],
    }),

  // Selection actions
  setSelectionMode: (mode) =>
    set({
      selectionMode: mode,
      selectedFeatures: mode === 'single' ? [] : get().selectedFeatures,
    }),

  addSelectedFeature: (feature) =>
    set((state) => {
      const exists = state.selectedFeatures.some(
        (f) => f.feature.id === feature.feature.id && f.layerId === feature.layerId
      )

      if (exists) return state

      return {
        selectedFeatures: [...state.selectedFeatures, feature],
        selectedFeature: feature,
      }
    }),

  removeSelectedFeature: (featureId, layerId) =>
    set((state) => ({
      selectedFeatures: state.selectedFeatures.filter(
        (f) => !(f.feature.id === featureId && f.layerId === layerId)
      ),
    })),

  toggleSelectedFeature: (feature) =>
    set((state) => {
      const exists = state.selectedFeatures.some(
        (f) => f.feature.id === feature.feature.id && f.layerId === feature.layerId
      )

      if (exists) {
        return {
          selectedFeatures: state.selectedFeatures.filter(
            (f) => !(f.feature.id === feature.feature.id && f.layerId === feature.layerId)
          ),
          selectedFeature:
            state.selectedFeature?.feature.id === feature.feature.id &&
            state.selectedFeature?.layerId === feature.layerId
              ? null
              : state.selectedFeature,
        }
      } else {
        return {
          selectedFeatures: [...state.selectedFeatures, feature],
          selectedFeature: feature,
        }
      }
    }),

  clearSelection: () =>
    set({
      selectedFeature: null,
      selectedFeatures: [],
    }),

  selectAll: (layerId) =>
    set((state) => {
      const layer = state.layers.find((l) => l.id === layerId)
      if (!layer) return state

      const selectedFeatures = layer.data.features.map((feature) => ({
        feature,
        layerId,
      }))

      return {
        selectedFeatures,
        selectedFeature: selectedFeatures[0] || null,
      }
    }),

  setQueryResults: (results) =>
    set({
      queryResults: results,
    }),

  // Measurement actions
  setMeasurementMode: (mode) =>
    set({
      measurementMode: mode,
      currentMeasurementPoints: [],
    }),

  addMeasurementPoint: (point) =>
    set((state) => ({
      currentMeasurementPoints: [...state.currentMeasurementPoints, point],
    })),

  completeMeasurement: () => {
    const state = get()
    const { measurementMode, currentMeasurementPoints } = state

    if (!measurementMode || currentMeasurementPoints.length === 0) return

    const { MeasurementTools } = require('@/lib/utils/measurements')

    let value: number
    let label: string

    try {
      switch (measurementMode) {
        case 'distance':
          if (currentMeasurementPoints.length < 2) return
          // Calculate total distance for multi-point line
          value = 0
          for (let i = 0; i < currentMeasurementPoints.length - 1; i++) {
            value += MeasurementTools.calculateDistance(
              currentMeasurementPoints[i],
              currentMeasurementPoints[i + 1]
            )
          }
          label = MeasurementTools.formatDistance(value)
          break

        case 'area':
          if (currentMeasurementPoints.length < 3) return
          value = MeasurementTools.calculateArea(currentMeasurementPoints)
          label = MeasurementTools.formatArea(value)
          break

        case 'bearing':
          if (currentMeasurementPoints.length !== 2) return
          value = MeasurementTools.calculateBearing(
            currentMeasurementPoints[0],
            currentMeasurementPoints[1]
          )
          label = MeasurementTools.formatBearing(value)
          break

        default:
          return
      }

      const measurement: MeasurementResult = {
        id: `${measurementMode}-${Date.now()}`,
        type: measurementMode,
        value,
        coordinates: [...currentMeasurementPoints],
        label,
        timestamp: Date.now(),
      }

      set((state) => ({
        measurements: [...state.measurements, measurement],
        currentMeasurementPoints: [],
      }))
    } catch (error) {
      console.error('Error completing measurement:', error)
    }
  },

  clearCurrentMeasurement: () =>
    set({
      currentMeasurementPoints: [],
    }),

  removeMeasurement: (id) =>
    set((state) => ({
      measurements: state.measurements.filter((m) => m.id !== id),
    })),

  clearAllMeasurements: () =>
    set({
      measurements: [],
      currentMeasurementPoints: [],
      measurementMode: null,
    }),
}))
