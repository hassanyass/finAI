import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FinancialProfile } from '../types/financial'

interface FinancialProfileStore {
  profile: FinancialProfile | null
  setProfile: (p: FinancialProfile) => void
  clearProfile: () => void
}

export const useFinancialProfileStore = create<FinancialProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    { name: 'finsight-profile' }
  )
)
