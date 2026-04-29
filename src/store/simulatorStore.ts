import { create } from 'zustand'

interface SimulatorStore {
  lastRunAt: number | null
  setLastRun: () => void
}

export const useSimulatorStore = create<SimulatorStore>()((set) => ({
  lastRunAt: null,
  setLastRun: () => set({ lastRunAt: Date.now() }),
}))
