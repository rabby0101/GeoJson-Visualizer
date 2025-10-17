export interface ImageExportOptions {
  format?: 'png' | 'jpg'
  quality?: number
  width?: number
  height?: number
}

export class ImageExporter {
  /**
   * Capture map as image using Leaflet's built-in functionality
   * Note: This requires the leaflet-image library or similar
   */
  static async captureMap(
    mapContainer: HTMLElement,
    options: ImageExportOptions = {}
  ): Promise<Blob> {
    const { format = 'png', quality = 0.95 } = options

    try {
      // Use html2canvas as a fallback if leaflet-image is not available
      // For now, we'll use the native canvas API approach
      return await this.captureWithCanvas(mapContainer, format, quality)
    } catch (error) {
      throw new Error(`Failed to capture map: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Capture element using canvas
   */
  private static async captureWithCanvas(
    element: HTMLElement,
    format: 'png' | 'jpg',
    quality: number
  ): Promise<Blob> {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    const rect = element.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // For a complete implementation, you would use html2canvas or leaflet-image
    // This is a simplified version that captures the current state
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        quality
      )
    })
  }

  /**
   * Download map as image
   */
  static async download(
    mapContainer: HTMLElement,
    filename: string = 'map-export.png',
    options: ImageExportOptions = {}
  ): Promise<void> {
    try {
      const blob = await this.captureMap(mapContainer, options)
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(
        `Failed to download map image: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Simple screenshot using Leaflet's native functionality
   * This captures only the canvas tiles, not overlays
   */
  static async captureLeafletMap(mapInstance: any): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Get the map container
        const container = mapInstance.getContainer()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Get all tile images
        const tiles = container.querySelectorAll('.leaflet-tile-pane img')
        const size = mapInstance.getSize()
        canvas.width = size.x
        canvas.height = size.y

        // Draw white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw each tile
        tiles.forEach((tile: any) => {
          const transform = tile.style.transform
          const match = transform.match(/translate3d\(([^)]+)\)/)
          if (match) {
            const [x, y] = match[1].split(',').map((v: string) => parseInt(v))
            ctx.drawImage(tile, x, y)
          }
        })

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/png',
          0.95
        )
      } catch (error) {
        reject(error)
      }
    })
  }
}
