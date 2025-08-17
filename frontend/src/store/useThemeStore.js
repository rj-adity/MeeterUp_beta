import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("meeterup-theme") ||"coffee",
  setTheme: (theme) => {
    localStorage.setItem("meeterup-theme", theme);
    set({theme})
  },
}))
