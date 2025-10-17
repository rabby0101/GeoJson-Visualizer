import { Feature, FeatureCollection } from 'geojson'
import Papa from 'papaparse'

export interface CSVOptions {
  includeGeometry?: boolean
  delimiter?: string
  selectedProperties?: string[]
}

export class CSVExporter {
  /**
   * Convert GeoJSON features to CSV string
   */
  static toCSV(geojson: FeatureCollection, options: CSVOptions = {}): string {
    const {
      includeGeometry = true,
      delimiter = ',',
      selectedProperties,
    } = options

    if (geojson.features.length === 0) {
      return ''
    }

    // Get all unique property names
    const allProperties = new Set<string>()
    geojson.features.forEach((feature) => {
      if (feature.properties) {
        Object.keys(feature.properties).forEach((key) => allProperties.add(key))
      }
    })

    // Filter properties if specified
    const properties = selectedProperties || Array.from(allProperties)

    // Build rows
    const rows = geojson.features.map((feature) => {
      const row: Record<string, any> = {}

      // Add properties
      properties.forEach((prop) => {
        row[prop] = feature.properties?.[prop] ?? ''
      })

      // Add geometry information
      if (includeGeometry && feature.geometry) {
        row['geometry_type'] = feature.geometry.type

        // Add coordinates based on geometry type
        if (feature.geometry.type === 'Point') {
          const [lng, lat] = feature.geometry.coordinates as [number, number]
          row['longitude'] = lng
          row['latitude'] = lat
        } else {
          // For complex geometries, store as WKT or JSON
          row['geometry'] = JSON.stringify(feature.geometry.coordinates)
        }
      }

      return row
    })

    // Convert to CSV using Papa Parse
    return Papa.unparse(rows, {
      delimiter,
      header: true,
    })
  }

  /**
   * Download CSV file
   */
  static download(
    geojson: FeatureCollection,
    filename: string = 'export.csv',
    options: CSVOptions = {}
  ): void {
    const content = this.toCSV(geojson, options)
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Get all property names from features
   */
  static getAllProperties(geojson: FeatureCollection): string[] {
    const properties = new Set<string>()
    geojson.features.forEach((feature) => {
      if (feature.properties) {
        Object.keys(feature.properties).forEach((key) => properties.add(key))
      }
    })
    return Array.from(properties).sort()
  }

  /**
   * Get preview of CSV data (first few rows)
   */
  static getPreview(geojson: FeatureCollection, rows: number = 5): string {
    const previewData: FeatureCollection = {
      type: 'FeatureCollection',
      features: geojson.features.slice(0, rows),
    }
    return this.toCSV(previewData)
  }
}
