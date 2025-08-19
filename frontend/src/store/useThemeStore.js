import { create } from 'zustand'

const darkThemes = new Set([
  'dark',
  'forest',
  'synthwave',
  'dracula',
  'night',
  'coffee',
  'dim',
  'nord',
  'black'
]);

function applyThemeAttributes(themeName){
  const isDark = darkThemes.has(themeName);
  document.documentElement.setAttribute('data-theme', themeName);
  document.documentElement.setAttribute('data-color-mode', isDark ? 'dark' : 'light');
}

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("meeterup-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("meeterup-theme", theme);
    applyThemeAttributes(theme);
    set({theme})
  },
  initializeTheme: () => {
    const savedTheme = localStorage.getItem("meeterup-theme") || "coffee";
    applyThemeAttributes(savedTheme);
    set({theme: savedTheme});
  }
}))
