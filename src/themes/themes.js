/**
 * Theme definitions for the PDF Flipbook app.
 * Each theme provides colors, gradients, and styling for the entire app.
 */

export const themes = {
  minimalLight: {
    id: 'minimalLight',
    name: 'Minimal Light',
    icon: '🌞',
    styles: {
      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      text: '#1e293b',
      textMuted: '#64748b',
      controlsBg: 'rgba(255, 255, 255, 0.85)',
      controlsBorder: 'rgba(148, 163, 184, 0.3)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      flipbookBg: '#ffffff',
    },
  },
  darkElegant: {
    id: 'darkElegant',
    name: 'Dark Elegant',
    icon: '🌙',
    styles: {
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      primary: '#6366f1',
      primaryHover: '#818cf8',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      controlsBg: 'rgba(30, 41, 59, 0.9)',
      controlsBorder: 'rgba(99, 102, 241, 0.3)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
      shadowHover: '0 0 20px rgba(99, 102, 241, 0.3)',
      flipbookBg: '#1e293b',
    },
  },
  neonModern: {
    id: 'neonModern',
    name: 'Neon Modern',
    icon: '🎨',
    styles: {
      background: 'linear-gradient(135deg, #0a0a0f, #000000)',
      primary: '#00f5ff',
      accent: '#ff00c8',
      primaryHover: '#5eead4',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      controlsBg: 'rgba(10, 10, 15, 0.95)',
      controlsBorder: 'rgba(0, 245, 255, 0.5)',
      shadow: '0 0 20px rgba(0, 245, 255, 0.2)',
      shadowHover: '0 0 30px rgba(0, 245, 255, 0.5), 0 0 60px rgba(255, 0, 200, 0.2)',
      flipbookBg: '#0a0a0f',
    },
  },
  vintagePaper: {
    id: 'vintagePaper',
    name: 'Vintage Paper',
    icon: '🏛',
    styles: {
      background: 'linear-gradient(135deg, #f5e6ca, #e8d3b0)',
      primary: '#7c4a03',
      primaryHover: '#92400e',
      text: '#422006',
      textMuted: '#78350f',
      controlsBg: 'rgba(245, 230, 202, 0.9)',
      controlsBorder: 'rgba(124, 74, 3, 0.3)',
      shadow: '0 4px 6px -1px rgba(124, 74, 3, 0.2), 0 2px 4px -2px rgba(124, 74, 3, 0.15)',
      shadowHover: '0 10px 15px -3px rgba(124, 74, 3, 0.2)',
      flipbookBg: '#faf3e6',
    },
  },
};

export const getThemeById = (id) => themes[id] || themes.minimalLight;
