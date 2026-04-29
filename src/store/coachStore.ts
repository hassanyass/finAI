import { create } from 'zustand'
import type { Message } from '../types/coach'

interface CoachStore {
  messages: Message[]
  isTyping: boolean
  addMessage: (msg: Message) => void
  setTyping: (v: boolean) => void
  clearMessages: () => void
}

export const useCoachStore = create<CoachStore>()((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  setTyping: (v) => set({ isTyping: v }),
  clearMessages: () => set({ messages: [] }),
}))
