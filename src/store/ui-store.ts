import { create } from 'zustand'

interface UIState {
  // Sidebar
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  activeLeftTab: 'upload' | 'layers' | 'style'
  activeRightTab: 'features' | 'properties' | 'analysis' | 'table' | 'query'

  // Modals
  exportDialogOpen: boolean

  // Actions
  setLeftSidebarOpen: (open: boolean) => void
  setRightSidebarOpen: (open: boolean) => void
  setActiveLeftTab: (tab: 'upload' | 'layers' | 'style') => void
  setActiveRightTab: (tab: 'features' | 'properties' | 'analysis' | 'table' | 'query') => void
  setExportDialogOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  activeLeftTab: 'upload',
  activeRightTab: 'features',
  exportDialogOpen: false,

  // Actions
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
}))
