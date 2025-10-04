class ColorPickerService {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'default-light';
    this.customColors = {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981',
    };
    this.presets = this.initializePresets();
    this.history = [];
    this.maxHistorySize = 10;
  }

  // Initialize theme presets
  initializePresets() {
    return {
      'default-light': {
        name: 'Default Light',
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
        },
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280',
      },
      'default-dark': {
        name: 'Default Dark',
        colors: {
          primary: '#60a5fa',
          secondary: '#a78bfa',
          accent: '#34d399',
        },
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#d1d5db',
      },
      'blue-theme': {
        name: 'Blue Theme',
        colors: {
          primary: '#2563eb',
          secondary: '#7c3aed',
          accent: '#059669',
        },
        background: '#f0f9ff',
        surface: '#e0f2fe',
        text: '#0c4a6e',
        textSecondary: '#0369a1',
      },
      'purple-theme': {
        name: 'Purple Theme',
        colors: {
          primary: '#7c3aed',
          secondary: '#ec4899',
          accent: '#f59e0b',
        },
        background: '#faf5ff',
        surface: '#f3e8ff',
        text: '#581c87',
        textSecondary: '#a21caf',
      },
      'green-theme': {
        name: 'Green Theme',
        colors: {
          primary: '#059669',
          secondary: '#dc2626',
          accent: '#2563eb',
        },
        background: '#f0fdf4',
        surface: '#dcfce7',
        text: '#14532d',
        textSecondary: '#166534',
      },
      'warm-theme': {
        name: 'Warm Theme',
        colors: {
          primary: '#ea580c',
          secondary: '#dc2626',
          accent: '#f59e0b',
        },
        background: '#fff7ed',
        surface: '#fed7aa',
        text: '#9a3412',
        textSecondary: '#c2410c',
      },
      'cool-theme': {
        name: 'Cool Theme',
        colors: {
          primary: '#0891b2',
          secondary: '#7c3aed',
          accent: '#10b981',
        },
        background: '#f0f9ff',
        surface: '#e0f2fe',
        text: '#0c4a6e',
        textSecondary: '#0369a1',
      },
      'monochrome-theme': {
        name: 'Monochrome Theme',
        colors: {
          primary: '#374151',
          secondary: '#6b7280',
          accent: '#9ca3af',
        },
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
      },
    };
  }

  // Apply theme
  applyTheme(themeName) {
    const theme = this.presets.get(themeName) || this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme ${themeName} not found`);
    }

    this.currentTheme = themeName;
    this.applyColorsToDocument(theme);
    this.saveToHistory(theme);
    this.saveToStorage();
    
    return theme;
  }

  // Apply colors to document
  applyColorsToDocument(theme) {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);

    // Apply Tailwind classes if available
    if (window.tailwind) {
      this.applyTailwindTheme(theme);
    }
  }

  // Apply Tailwind theme
  applyTailwindTheme(theme) {
    // This would integrate with Tailwind's theme system
    // Implementation depends on how Tailwind is configured
    console.log('Applying Tailwind theme:', theme);
  }

  // Generate theme from colors
  generateTheme(colors, name = 'Custom Theme') {
    const theme = {
      name,
      colors: {
        primary: colors.primary || this.customColors.primary,
        secondary: colors.secondary || this.customColors.secondary,
        accent: colors.accent || this.customColors.accent,
      },
      background: this.generateBackgroundColor(colors.primary),
      surface: this.generateSurfaceColor(colors.primary),
      text: this.generateTextColor(colors.primary),
      textSecondary: this.generateSecondaryTextColor(colors.primary),
    };

    this.themes.set(name.toLowerCase().replace(/\s+/g, '-'), theme);
    return theme;
  }

  // Generate background color based on primary color
  generateBackgroundColor(primaryColor) {
    const hsl = this.hexToHsl(primaryColor);
    return `hsl(${hsl.h}, ${Math.max(0, hsl.s - 80)}%, ${Math.min(100, hsl.l + 40)}%)`;
  }

  // Generate surface color based on primary color
  generateSurfaceColor(primaryColor) {
    const hsl = this.hexToHsl(primaryColor);
    return `hsl(${hsl.h}, ${Math.max(0, hsl.s - 60)}%, ${Math.min(100, hsl.l + 20)}%)`;
  }

  // Generate text color based on primary color
  generateTextColor(primaryColor) {
    const hsl = this.hexToHsl(primaryColor);
    return `hsl(${hsl.h}, ${Math.min(100, hsl.s + 20)}%, ${Math.max(0, hsl.l - 60)}%)`;
  }

  // Generate secondary text color
  generateSecondaryTextColor(primaryColor) {
    const hsl = this.hexToHsl(primaryColor);
    return `hsl(${hsl.h}, ${Math.max(0, hsl.s - 40)}%, ${Math.max(0, hsl.l - 40)}%)`;
  }

  // Convert hex to HSL
  hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  // Convert HSL to hex
  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Get all available themes
  getAllThemes() {
    return {
      presets: Array.from(this.presets.entries()).map(([key, theme]) => ({
        key,
        ...theme,
      })),
      custom: Array.from(this.themes.entries()).map(([key, theme]) => ({
        key,
        ...theme,
      })),
    };
  }

  // Get current theme
  getCurrentTheme() {
    return this.presets.get(this.currentTheme) || this.themes.get(this.currentTheme);
  }

  // Export theme
  exportTheme(themeName) {
    const theme = this.presets.get(themeName) || this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme ${themeName} not found`);
    }

    return {
      name: theme.name,
      colors: theme.colors,
      background: theme.background,
      surface: theme.surface,
      text: theme.text,
      textSecondary: theme.textSecondary,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
  }

  // Import theme
  importTheme(themeData) {
    const theme = {
      name: themeData.name,
      colors: themeData.colors,
      background: themeData.background,
      surface: themeData.surface,
      text: themeData.text,
      textSecondary: themeData.textSecondary,
    };

    const key = theme.name.toLowerCase().replace(/\s+/g, '-');
    this.themes.set(key, theme);
    this.saveToStorage();
    
    return theme;
  }

  // Reset to default theme
  resetToDefault() {
    this.currentTheme = 'default-light';
    const theme = this.presets.get('default-light');
    this.applyColorsToDocument(theme);
    this.saveToStorage();
    return theme;
  }

  // Save to history
  saveToHistory(theme) {
    this.history.unshift({
      theme: theme.name,
      timestamp: Date.now(),
    });

    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  // Get history
  getHistory() {
    return this.history;
  }

  // Clear history
  clearHistory() {
    this.history = [];
  }

  // Save to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('homeHub_colorPicker', JSON.stringify({
        currentTheme: this.currentTheme,
        customThemes: Array.from(this.themes.entries()),
        history: this.history,
      }));
    } catch (error) {
      console.warn('Failed to save color picker data:', error);
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const data = localStorage.getItem('homeHub_colorPicker');
      if (data) {
        const parsed = JSON.parse(data);
        this.currentTheme = parsed.currentTheme || 'default-light';
        this.themes = new Map(parsed.customThemes || []);
        this.history = parsed.history || [];
      }
    } catch (error) {
      console.warn('Failed to load color picker data:', error);
    }
  }

  // Generate color palette
  generateColorPalette(baseColor) {
    const hsl = this.hexToHsl(baseColor);
    const palette = [];

    // Generate shades
    for (let i = 0; i < 9; i++) {
      const lightness = 10 + (i * 10);
      palette.push({
        name: `${i + 1}00`,
        hex: this.hslToHex(hsl.h, hsl.s, lightness),
        hsl: { h: hsl.h, s: hsl.s, l: lightness },
      });
    }

    return palette;
  }

  // Get complementary colors
  getComplementaryColors(baseColor) {
    const hsl = this.hexToHsl(baseColor);
    const complementary = {
      primary: baseColor,
      complementary: this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
      triadic1: this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      triadic2: this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
      analogous1: this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      analogous2: this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    };

    return complementary;
  }

  // Validate color
  validateColor(color) {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(color);
  }

  // Get service status
  getStatus() {
    return {
      currentTheme: this.currentTheme,
      totalThemes: this.presets.size + this.themes.size,
      customThemes: this.themes.size,
      historySize: this.history.length,
    };
  }
}

export default new ColorPickerService();



