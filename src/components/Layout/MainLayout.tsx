import { useRef } from 'react'
import { MapContainer } from '../Map/MapContainer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { ExportDialog } from '../Export/ExportDialog'
import { CRSInfoPanel } from '../CRS/CRSInfoPanel'
import { useUIStore } from '@/store/ui-store'

export function MainLayout() {
  const { leftSidebarOpen, rightSidebarOpen, exportDialogOpen, setExportDialogOpen } = useUIStore()
  const mapContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {leftSidebarOpen && <Sidebar />}
        <div className="flex-1 relative" ref={mapContainerRef}>
          <MapContainer />
        </div>
        {rightSidebarOpen && <RightPanel />}
      </div>

      {/* CRS Information Footer */}
      <CRSInfoPanel />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        mapContainer={mapContainerRef.current}
      />
    </div>
  )
}
