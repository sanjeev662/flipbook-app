import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '../themes/themes';

/**
 * Theme selector dropdown - top right corner.
 * Persists selection in localStorage.
 */
export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeEntries = Object.values(themes);
  const activeTheme = themes[currentTheme] || themes.minimalLight;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300"
        style={{
          background: activeTheme.styles.controlsBg,
          color: activeTheme.styles.text,
          border: `1px solid ${activeTheme.styles.controlsBorder}`,
          boxShadow: activeTheme.styles.shadow,
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: activeTheme.styles.shadowHover,
        }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{activeTheme.icon}</span>
        <span>{activeTheme.name}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute right-0 mt-2 py-2 rounded-xl overflow-hidden z-50"
            style={{
              background: activeTheme.styles.controlsBg,
              border: `1px solid ${activeTheme.styles.controlsBorder}`,
              boxShadow: activeTheme.styles.shadowHover,
              minWidth: '180px',
            }}
          >
            {themeEntries.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                style={{
                  color: theme.styles.text,
                  background:
                    currentTheme === theme.id
                      ? `${activeTheme.styles.primary}20`
                      : 'transparent',
                }}
              >
                <span className="text-xl">{theme.icon}</span>
                <span className="font-medium">{theme.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
