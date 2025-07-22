// src/store/themeStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'light', // Set the default theme to 'light'
            
            // This function toggles the theme between 'light' and 'dark'
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),
        }),
        {
            name: 'hrm-theme-storage', // This is the key that will be used in localStorage
            getStorage: () => localStorage, // Specifies using localStorage for persistence
        }
    )
);
