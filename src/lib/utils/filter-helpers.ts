import { Feature } from 'geojson'
import { FilterCriteria } from '@/store/geojson-store'

export function applyFilters(features: Feature[], criteria: FilterCriteria): Feature[] {
  let filtered = features

  // Apply search text filter
  if (criteria.searchText.trim() !== '') {
    const searchLower = criteria.searchText.toLowerCase()
    filtered = filtered.filter((feature) => {
      // Search in properties
      if (feature.properties) {
        const propsString = JSON.stringify(feature.properties).toLowerCase()
        if (propsString.includes(searchLower)) return true
      }

      // Search in geometry type
      if (feature.geometry?.type.toLowerCase().includes(searchLower)) return true

      return false
    })
  }

  // Apply geometry type filter
  if (criteria.geometryTypes.length > 0) {
    filtered = filtered.filter((feature) => {
      return feature.geometry && criteria.geometryTypes.includes(feature.geometry.type)
    })
  }

  // Apply property filters
  criteria.propertyFilters.forEach((filter) => {
    filtered = filtered.filter((feature) => {
      if (!feature.properties || !(filter.property in feature.properties)) {
        return false
      }

      const value = feature.properties[filter.property]
      const filterValue = filter.value

      switch (filter.operator) {
        case 'equals':
          return String(value).toLowerCase() === String(filterValue).toLowerCase()
        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
        case 'gt':
          return typeof value === 'number' && typeof filterValue === 'number' && value > filterValue
        case 'lt':
          return typeof value === 'number' && typeof filterValue === 'number' && value < filterValue
        case 'gte':
          return typeof value === 'number' && typeof filterValue === 'number' && value >= filterValue
        case 'lte':
          return typeof value === 'number' && typeof filterValue === 'number' && value <= filterValue
        default:
          return true
      }
    })
  })

  return filtered
}

export function getUniquePropertyNames(features: Feature[]): string[] {
  const propertyNames = new Set<string>()

  features.forEach((feature) => {
    if (feature.properties) {
      Object.keys(feature.properties).forEach((key) => {
        propertyNames.add(key)
      })
    }
  })

  return Array.from(propertyNames).sort()
}

export function getUniqueGeometryTypes(features: Feature[]): string[] {
  const types = new Set<string>()

  features.forEach((feature) => {
    if (feature.geometry) {
      types.add(feature.geometry.type)
    }
  })

  return Array.from(types).sort()
}
