// テーマ設定コントロール
// ダークモード切り替え、カラースキーム選択、アクセシビリティ設定

'use client';

import React, { useState } from 'react';
import { themeManager } from '../../lib/themeSystem';
import type { ThemeMode, ColorScheme } from '../../lib/themeSystem';

interface ThemeControlsProps {
  className?: string;
  showAdvanced?: boolean;
}

export const ThemeControls: React.FC<ThemeControlsProps> = ({ 
  className = '',
  showAdvanced = true 
}) => {
  const [currentMode, setCurrentMode] = useState<ThemeMode>('system');
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>('blue');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const handleModeChange = (mode: ThemeMode) => {
    setCurrentMode(mode);
    themeManager.setMode(mode);
  };

  const handleSchemeChange = (scheme: ColorScheme) => {
    setCurrentScheme(scheme);
    themeManager.setScheme(scheme);
  };

  const handleToggleMode = () => {
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    handleModeChange(newMode);
    setIsDark(newMode === 'dark');
    document.body.classList.toggle('dark');
  };

  return (
    <div className={`theme-controls ${className}`}>
      {/* メインテーマトグル */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleToggleMode}
          className="theme-toggle-btn"
          aria-label="テーマを切り替え"
        >
          <span className="theme-icon">
            {isDark ? '🌙' : '☀️'}
          </span>
          <span className="theme-text">
            {isDark ? 'ダークモード' : 'ライトモード'}
          </span>
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-btn"
          aria-label="詳細設定を開く"
        >
          <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* 詳細設定パネル */}
      {isExpanded && showAdvanced && (
        <div className="advanced-panel">
          {/* モード選択 */}
          <div className="control-group">
            <label className="control-label">モード設定</label>
            <div className="mode-buttons">
              {(['light', 'dark', 'system', 'auto'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`mode-btn ${currentMode === mode ? 'active' : ''}`}
                  aria-pressed={currentMode === mode}
                >
                  <span className="mode-icon">
                    {mode === 'light' && '☀️'}
                    {mode === 'dark' && '🌙'}
                    {mode === 'system' && '💻'}
                    {mode === 'auto' && '🕒'}
                  </span>
                  <span className="mode-label">
                    {mode === 'light' && 'ライト'}
                    {mode === 'dark' && 'ダーク'}
                    {mode === 'system' && 'システム'}
                    {mode === 'auto' && '自動'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* カラースキーム選択 */}
          <div className="control-group">
            <label className="control-label">カラーテーマ</label>
            <div className="scheme-selector">
              {(['blue', 'green', 'purple', 'orange', 'pink'] as const).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => handleSchemeChange(scheme)}
                  className={`scheme-btn ${currentScheme === scheme ? 'active' : ''}`}
                  aria-label={`${scheme} テーマを選択`}
                  style={{
                    backgroundColor: getSchemeColor(scheme),
                    borderColor: currentScheme === scheme ? '#fff' : 'transparent'
                  }}
                >
                  <span className="scheme-check">
                    {currentScheme === scheme && '✓'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* アクセシビリティ設定 */}
          <div className="control-group">
            <label className="control-label">アクセシビリティ</label>
            <div className="accessibility-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  onChange={(e) => themeManager.setHighContrast(e.target.checked)}
                  className="checkbox"
                />
                <span className="checkbox-text">ハイコントラスト</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  onChange={(e) => themeManager.setReduceGlass(e.target.checked)}
                  className="checkbox"
                />
                <span className="checkbox-text">透明効果を減らす</span>
              </label>
            </div>
          </div>

          {/* 自動切り替え設定 */}
          {currentMode === 'auto' && (
            <div className="control-group">
              <label className="control-label">自動切り替え時間</label>
              <div className="time-inputs">
                <div className="time-input-group">
                  <label className="time-label">ライトモード開始</label>
                  <input
                    type="time"
                    defaultValue="06:00"
                    className="time-input"
                    onChange={(e) => updateAutoSwitchTime('light', e.target.value)}
                  />
                </div>
                <div className="time-input-group">
                  <label className="time-label">ダークモード開始</label>
                  <input
                    type="time"
                    defaultValue="20:00"
                    className="time-input"
                    onChange={(e) => updateAutoSwitchTime('dark', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .theme-controls {
          background: var(--color-surface, rgba(255, 255, 255, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid var(--color-border, rgba(255, 255, 255, 0.2));
          border-radius: 12px;
          padding: 1rem;
          min-width: 280px;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all var(--duration-normal, 250ms) var(--easing-ease);
        }

        .theme-toggle-btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .theme-icon {
          font-size: 1.2rem;
        }

        .theme-text {
          font-weight: 500;
        }

        .expand-btn {
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          color: var(--color-text);
          transition: all var(--duration-fast, 150ms);
        }

        .expand-btn:hover {
          background: var(--color-surface);
        }

        .arrow {
          display: inline-block;
          transition: transform var(--duration-normal, 250ms) var(--easing-ease);
        }

        .arrow.expanded {
          transform: rotate(180deg);
        }

        .advanced-panel {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        .control-group {
          margin-bottom: 1.5rem;
        }

        .control-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .mode-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .mode-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background: var(--color-surface);
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 0.75rem 0.5rem;
          cursor: pointer;
          transition: all var(--duration-normal, 250ms);
        }

        .mode-btn:hover {
          background: var(--color-primary);
          color: white;
        }

        .mode-btn.active {
          border-color: var(--color-primary);
          background: var(--color-primary);
          color: white;
        }

        .mode-icon {
          font-size: 1.5rem;
        }

        .mode-label {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .scheme-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .scheme-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration-normal, 250ms);
        }

        .scheme-btn:hover {
          transform: scale(1.1);
        }

        .scheme-check {
          color: white;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .accessibility-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox {
          width: 1rem;
          height: 1rem;
          accent-color: var(--color-primary);
        }

        .checkbox-text {
          font-size: 0.875rem;
          color: var(--color-text);
        }

        .time-inputs {
          display: flex;
          gap: 1rem;
        }

        .time-input-group {
          flex: 1;
        }

        .time-label {
          display: block;
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.25rem;
        }

        .time-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: var(--color-surface);
          color: var(--color-text);
          font-size: 0.875rem;
        }

        .time-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary, rgba(59, 130, 246, 0.1));
        }
      `}</style>
    </div>
  );
};

// カラースキームの代表色を取得
function getSchemeColor(scheme: ColorScheme): string {
  const colors = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#8b5cf6',
    orange: '#f97316',
    pink: '#ec4899'
  };
  return colors[scheme];
}

// 自動切り替え時間更新
function updateAutoSwitchTime(type: 'light' | 'dark', time: string) {
  const currentState = themeManager.getState();
  const switchTimes = { ...currentState.userPreferences.switchTime };
  switchTimes[type] = time;
  themeManager.setAutoSwitch(true, switchTimes);
} 