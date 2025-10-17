import { FeatureCollection } from 'geojson'

export interface ExportOptions {
  pretty?: boolean
  indent?: number
}

export class GeoJSONExporter {
  /**
   * Convert FeatureCollection to GeoJSON string
   */
  static export(data: FeatureCollection, options: ExportOptions = {}): string {
    const { pretty = true, indent = 2 } = options

    if (pretty) {
      return JSON.stringify(data, null, indent)
    }
    return JSON.stringify(data)
  }

  /**
   * Download GeoJSON file
   */
  static download(data: FeatureCollection, filename: string = 'export.geojson'): void {
    const content = this.export(data, { pretty: true })
    const blob = new Blob([content], { type: 'application/geo+json' })
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
   * Get file size estimate
   */
  static getSize(data: FeatureCollection): number {
    const content = this.export(data, { pretty: false })
    return new Blob([content]).size
  }

  /**
   * Format file size for display
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}
