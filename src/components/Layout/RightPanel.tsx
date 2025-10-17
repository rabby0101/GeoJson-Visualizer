import { Info, BarChart3, Table, List, Search } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { FeaturesView } from '../FeaturePanel/FeaturesView'
import { FeatureDetails } from '../FeaturePanel/FeatureDetails'
import { StatisticsView } from '../AnalysisPanel/StatisticsView'
import { AttributeTable } from '../DataTable/AttributeTable'
import { SelectionToolsPanel } from '../Query/SelectionToolsPanel'
import { SpatialQueryPanel } from '../Query/SpatialQueryPanel'

export function RightPanel() {
  const { activeRightTab, setActiveRightTab } = useUIStore()

  const tabs = [
    { id: 'features' as const, label: 'Features', icon: List },
    { id: 'properties' as const, label: 'Properties', icon: Info },
    { id: 'analysis' as const, label: 'Analysis', icon: BarChart3 },
    { id: 'query' as const, label: 'Query', icon: Search },
    { id: 'table' as const, label: 'Table', icon: Table },
  ]

  return (
    <div className="w-96 border-l bg-white flex flex-col">
      <div className="border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRightTab(tab.id)}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeRightTab === tab.id
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

      <div className="flex-1 overflow-auto">
        {activeRightTab === 'features' && <FeaturesView />}
        {activeRightTab === 'properties' && (
          <div className="p-4">
            <FeatureDetails />
          </div>
        )}
        {activeRightTab === 'analysis' && (
          <div className="p-4">
            <StatisticsView />
          </div>
        )}
        {activeRightTab === 'query' && (
          <div className="p-4 space-y-4">
            <SelectionToolsPanel />
            <SpatialQueryPanel />
          </div>
        )}
        {activeRightTab === 'table' && (
          <div className="p-4">
            <AttributeTable />
          </div>
        )}
      </div>
    </div>
  )
}
