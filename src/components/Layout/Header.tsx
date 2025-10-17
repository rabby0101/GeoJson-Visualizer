import { Map, Download, Github } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'

export function Header() {
  const { setExportDialogOpen } = useUIStore()

  return (
    <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Map className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">GeoJSON Visualizer</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setExportDialogOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>
    </header>
  )
}
