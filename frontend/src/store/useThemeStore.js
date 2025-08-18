import { create } from 'zustand'

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("meeterup-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("meeterup-theme", theme);
    // Apply theme to document element for global effect
    document.documentElement.setAttribute('data-theme', theme);
    set({theme})
  },
  initializeTheme: () => {
    const savedTheme = localStorage.getItem("meeterup-theme") || "coffee";
    document.documentElement.setAttribute('data-theme', savedTheme);
    set({theme: savedTheme});
  }
}))
