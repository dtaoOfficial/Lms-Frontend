import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuSun, LuMoon } from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme, accent, setAccent, accentColors } = useTheme();

  // 1. Function to toggle dark/light mode
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // 2. Helper to get the Tailwind class for each accent color bubble
  const getAccentBgClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      emerald: 'bg-emerald-500',
      rose: 'bg-rose-500',
      amber: 'bg-amber-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="flex items-center gap-4">
      
      {/* --- Accent Color Picker --- */}
      <div className="flex items-center gap-1.5 rounded-full bg-secondary p-1">
        {accentColors.map((color) => (
          <button
            key={color}
            onClick={() => setAccent(color)}
            className={`h-5 w-5 rounded-full ${getAccentBgClass(color)} transition-all
              ${accent === color 
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' 
                : 'scale-90 opacity-70 hover:scale-100 hover:opacity-100'
              }
            `}
            aria-label={`Set ${color} theme`}
          />
        ))}
      </div>

      {/* --- Dark/Light Mode Toggle Button --- */}
      <button
        onClick={toggleTheme}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-text-primary transition-colors hover:text-accent"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ y: -20, opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <LuSun className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, scale: 0.5, rotate: 90 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, scale: 0.5, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <LuMoon className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

    </div>
  );
};

export default ThemeToggle;