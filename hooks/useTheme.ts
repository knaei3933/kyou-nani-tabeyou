// テーマ管理フック
// ダークモード/ライトモード切り替えとカスタムテーマ

'use client';

import { useState, useEffect, useCallback } from 'react';
import { themeManager, Theme, ThemeMode, ColorScheme, ThemeState } from '../lib/themeSystem';

// メインテーマフック
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => themeManager.getCurrentTheme());
  const [state, setState] = useState<ThemeState>(() => themeManager.getState());

  useEffect(() => {
    const handleThemeChange = (newTheme: Theme) => {
      setTheme(newTheme);
      setState(themeManager.getState());
    };

    themeManager.addListener(handleThemeChange);

    return () => {
      themeManager.removeListener(handleThemeChange);
    };
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    themeManager.setMode(mode);
  }, []);

  const setScheme = useCallback((scheme: ColorScheme) => {
    themeManager.setScheme(scheme);
  }, []);

  const toggleMode = useCallback(() => {
    const currentMode = theme.mode;
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    themeManager.setMode(newMode);
  }, [theme.mode]);

  const setAutoSwitch = useCallback((enabled: boolean, times?: { light: string; dark: string }) => {
    themeManager.setAutoSwitch(enabled, times);
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    themeManager.setHighContrast(enabled);
  }, []);

  const setReduceGlass = useCallback((enabled: boolean) => {
    themeManager.setReduceGlass(enabled);
  }, []);

  return {
    // 현재 상태
    theme,
    state,
    isDark: theme.mode === 'dark',
    isSystem: state.currentMode === 'system',
    isAuto: state.currentMode === 'auto',
    
    // 테마 변경
    setMode,
    setScheme,
    toggleMode,
    
    // 고급 설정
    setAutoSwitch,
    setHighContrast,
    setReduceGlass,
    
    // 유틸리티
    availableSchemes: themeManager.getAvailableSchemes()
  };
};

// 色のみのフック（軽量版）
export const useThemeColors = () => {
  const [colors, setColors] = useState(themeManager.getCurrentTheme().colors);

  useEffect(() => {
    const handleThemeChange = (newTheme: Theme) => {
      setColors(newTheme.colors);
    };

    themeManager.addListener(handleThemeChange);

    return () => {
      themeManager.removeListener(handleThemeChange);
    };
  }, []);

  return colors;
};

// システム設定検出フック
export const useSystemTheme = () => {
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return systemPreference;
};

// アクセシビリティ設定フック
export const useAccessibilityTheme = () => {
  const { state, setHighContrast, setReduceGlass } = useTheme();
  
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    highContrast: state.userPreferences.highContrast,
    reduceGlass: state.userPreferences.reduceGlass,
    reducedMotion,
    setHighContrast,
    setReduceGlass
  };
};

// 自動切り替えフック
export const useAutoTheme = () => {
  const { state, setAutoSwitch } = useTheme();
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setCurrentTime(time);
    }, 60000); // 1分ごと更新

    return () => clearInterval(interval);
  }, []);

  const updateSwitchTimes = useCallback((light: string, dark: string) => {
    setAutoSwitch(state.userPreferences.autoSwitch, { light, dark });
  }, [state.userPreferences.autoSwitch, setAutoSwitch]);

  return {
    isEnabled: state.userPreferences.autoSwitch,
    switchTimes: state.userPreferences.switchTime,
    currentTime,
    setEnabled: (enabled: boolean) => setAutoSwitch(enabled),
    updateSwitchTimes
  };
};

// CSS変数アクセスフック
export const useCSSVariables = () => {
  const theme = useTheme().theme;

  const getCSSVariable = useCallback((variable: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }, []);

  const setCSSVariable = useCallback((variable: string, value: string) => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(variable, value);
  }, []);

  // よく使用される CSS 変数のショートカット
  const colors = {
    primary: getCSSVariable('--color-primary'),
    background: getCSSVariable('--color-background'),
    text: getCSSVariable('--color-text'),
    surface: getCSSVariable('--color-surface')
  };

  return {
    getCSSVariable,
    setCSSVariable,
    colors,
    theme
  };
};

// テーマプリセットフック
export const useThemePresets = () => {
  const { setMode, setScheme } = useTheme();

  const presets = [
    { name: 'ライトブルー', mode: 'light' as const, scheme: 'blue' as const },
    { name: 'ダークブルー', mode: 'dark' as const, scheme: 'blue' as const },
    { name: 'ライトグリーン', mode: 'light' as const, scheme: 'green' as const },
    { name: 'ダークパープル', mode: 'dark' as const, scheme: 'purple' as const },
    { name: 'ライトオレンジ', mode: 'light' as const, scheme: 'orange' as const },
    { name: 'ダークピンク', mode: 'dark' as const, scheme: 'pink' as const }
  ];

  const applyPreset = useCallback((preset: typeof presets[0]) => {
    setMode(preset.mode);
    setScheme(preset.scheme);
  }, [setMode, setScheme]);

  return {
    presets,
    applyPreset
  };
}; 