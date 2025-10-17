import { Upload, Layers, Palette } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { FileUpload } from '../FileLoader/FileUpload'
import { LayerList } from '../LayerManager/LayerList'
import { StylePanel } from '../StyleEditor/StylePanel'

export function Sidebar() {
  const { activeLeftTab, setActiveLeftTab } = useUIStore()

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'layers' as const, label: 'Layers', icon: Layers },
    { id: 'style' as const, label: 'Style', icon: Palette },
  ]

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLeftTab(tab.id)}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeLeftTab === 'upload' && <FileUpload />}
        {activeLeftTab === 'layers' && <LayerList />}
        {activeLeftTab === 'style' && <StylePanel />}
      </div>
    </div>
  )
}
