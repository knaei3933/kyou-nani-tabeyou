// アクセシビリティ管理システム
// ARIA属性、キーボードナビゲーション、スクリーンリーダー対応

export interface AccessibilityFeatures {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
  focusIndicators: boolean;
}

export interface AccessibilityState {
  features: AccessibilityFeatures;
  currentFocus: HTMLElement | null;
  focusHistory: HTMLElement[];
  announcements: string[];
  keyboardMode: boolean;
}

export interface FocusOptions {
  preventScroll?: boolean;
  announce?: boolean;
  highlight?: boolean;
}

class AccessibilityManager {
  private state: AccessibilityState = {
    features: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      keyboardNavigation: true,
      screenReader: false,
      focusIndicators: true
    },
    currentFocus: null,
    focusHistory: [],
    announcements: [],
    keyboardMode: false
  };

  private listeners: Map<string, Function[]> = new Map();
  private focusRing: HTMLElement | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.detectSystemPreferences();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAriaLiveRegion();
    this.loadUserPreferences();
  }

  // システム設定検出
  private detectSystemPreferences() {
    // 動作軽減設定
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.state.features.reducedMotion = reducedMotion.matches;
    
    reducedMotion.addEventListener('change', (e) => {
      this.state.features.reducedMotion = e.matches;
      this.updateBodyClasses();
      this.emit('preferenceChange', 'reducedMotion', e.matches);
    });

    // ハイコントラスト設定
    const highContrast = window.matchMedia('(prefers-contrast: high)');
    this.state.features.highContrast = highContrast.matches;
    
    highContrast.addEventListener('change', (e) => {
      this.state.features.highContrast = e.matches;
      this.updateBodyClasses();
      this.emit('preferenceChange', 'highContrast', e.matches);
    });

    // スクリーンリーダー検出（推定）
    this.detectScreenReader();
  }

  // スクリーンリーダー検出
  private detectScreenReader() {
    // 一般的なスクリーンリーダーのユーザーエージェント確認
    const userAgent = navigator.userAgent.toLowerCase();
    const screenReaderIndicators = [
      'nvda', 'jaws', 'windoweyes', 'dragon', 'zoomtext', 'magic', 'supernova'
    ];

    const hasScreenReader = screenReaderIndicators.some(indicator => 
      userAgent.includes(indicator)
    );

    if (hasScreenReader) {
      this.state.features.screenReader = true;
      this.updateBodyClasses();
    }

    // アクセシビリティAPIの検出
    if ('speechSynthesis' in window) {
      this.state.features.screenReader = true;
    }
  }

  // キーボードナビゲーション設定
  private setupKeyboardNavigation() {
    let isTabPressed = false;

    // Tabキー検出
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (!isTabPressed) {
          isTabPressed = true;
          this.state.keyboardMode = true;
          document.body.classList.add('keyboard-navigation');
          this.emit('keyboardModeChange', true);
        }
      }

      // Escapeキーでフォーカス解除
      if (e.key === 'Escape') {
        this.clearFocus();
      }

      // 矢印キーナビゲーション
      this.handleArrowKeyNavigation(e);
    });

    // マウス使用検出
    document.addEventListener('mousedown', () => {
      if (isTabPressed) {
        isTabPressed = false;
        this.state.keyboardMode = false;
        document.body.classList.remove('keyboard-navigation');
        this.emit('keyboardModeChange', false);
      }
    });
  }

  // 矢印キーナビゲーション
  private handleArrowKeyNavigation(e: KeyboardEvent) {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return;

    // 特定の要素グループ内での矢印キーナビゲーション
    const navigationGroups = [
      '[role="tablist"] [role="tab"]',
      '[role="radiogroup"] [role="radio"]',
      '[role="menu"] [role="menuitem"]',
      '.navigation-group > *'
    ];

    for (const selector of navigationGroups) {
      const elements = document.querySelectorAll(selector);
      const currentIndex = Array.from(elements).indexOf(activeElement);
      
      if (currentIndex !== -1) {
        let nextIndex = currentIndex;
        
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            nextIndex = (currentIndex + 1) % elements.length;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            nextIndex = (currentIndex - 1 + elements.length) % elements.length;
            break;
          case 'Home':
            nextIndex = 0;
            break;
          case 'End':
            nextIndex = elements.length - 1;
            break;
          default:
            continue;
        }

        if (nextIndex !== currentIndex) {
          e.preventDefault();
          this.focusElement(elements[nextIndex] as HTMLElement, {
            announce: true,
            highlight: true
          });
        }
        break;
      }
    }
  }

  // フォーカス管理設定
  private setupFocusManagement() {
    // フォーカス追跡
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      this.state.currentFocus = target;
      this.state.focusHistory.push(target);
      
      // 履歴のサイズ制限
      if (this.state.focusHistory.length > 50) {
        this.state.focusHistory = this.state.focusHistory.slice(-25);
      }

      this.updateFocusRing(target);
      this.emit('focusChange', target);
    });

    // フォーカス離脱
    document.addEventListener('focusout', (e) => {
      this.hideFocusRing();
      this.emit('focusLeave', e.target);
    });
  }

  // フォーカスリング作成
  private createFocusRing() {
    if (this.focusRing) return;

    this.focusRing = document.createElement('div');
    this.focusRing.className = 'accessibility-focus-ring';
    this.focusRing.setAttribute('aria-hidden', 'true');
    
    // スタイル設定
    Object.assign(this.focusRing.style, {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: '9999',
      border: '2px solid #0066cc',
      borderRadius: '4px',
      backgroundColor: 'transparent',
      opacity: '0',
      transition: 'all 150ms ease-out'
    });

    document.body.appendChild(this.focusRing);
  }

  // フォーカスリング更新
  private updateFocusRing(element: HTMLElement) {
    if (!this.state.features.focusIndicators || !this.state.keyboardMode) return;
    
    this.createFocusRing();
    if (!this.focusRing) return;

    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    Object.assign(this.focusRing.style, {
      left: `${rect.left + scrollX - 2}px`,
      top: `${rect.top + scrollY - 2}px`,
      width: `${rect.width + 4}px`,
      height: `${rect.height + 4}px`,
      opacity: '1'
    });
  }

  // フォーカスリング非表示
  private hideFocusRing() {
    if (this.focusRing) {
      this.focusRing.style.opacity = '0';
    }
  }

  // ARIA Liveリージョン設定
  private setupAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'accessibility-announcements';
    
    // スクリーンリーダー専用スタイル
    Object.assign(liveRegion.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    });

    document.body.appendChild(liveRegion);
  }

  // 公開メソッド
  
  // 要素にフォーカス
  focusElement(element: HTMLElement, options: FocusOptions = {}) {
    if (!element) return;

    element.focus({ preventScroll: options.preventScroll });

    if (options.announce) {
      this.announce(this.getElementDescription(element));
    }

    if (options.highlight) {
      this.highlightElement(element);
    }
  }

  // フォーカス履歴から戻る
  focusBack(steps: number = 1) {
    const historyIndex = this.state.focusHistory.length - steps - 1;
    if (historyIndex >= 0) {
      const element = this.state.focusHistory[historyIndex];
      if (element && document.contains(element)) {
        this.focusElement(element);
      }
    }
  }

  // フォーカスクリア
  clearFocus() {
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  }

  // 要素の説明取得
  private getElementDescription(element: HTMLElement): string {
    const descriptions: string[] = [];

    // ラベル
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('title') ||
                  element.textContent?.trim();
    if (label) descriptions.push(label);

    // 役割
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    descriptions.push(this.getRoleDescription(role));

    // 状態
    if (element.getAttribute('aria-expanded') === 'true') descriptions.push('展開済み');
    if (element.getAttribute('aria-expanded') === 'false') descriptions.push('折りたたみ済み');
    if (element.getAttribute('aria-selected') === 'true') descriptions.push('選択済み');
    if (element.getAttribute('aria-checked') === 'true') descriptions.push('チェック済み');

    return descriptions.join('、');
  }

  // 役割の説明
  private getRoleDescription(role: string): string {
    const roleDescriptions: Record<string, string> = {
      button: 'ボタン',
      link: 'リンク',
      tab: 'タブ',
      menu: 'メニュー',
      menuitem: 'メニュー項目',
      textbox: 'テキストボックス',
      checkbox: 'チェックボックス',
      radio: 'ラジオボタン',
      heading: '見出し'
    };

    return roleDescriptions[role] || role;
  }

  // 要素をハイライト
  highlightElement(element: HTMLElement, duration: number = 2000) {
    element.style.outline = '3px solid #ff6b35';
    element.style.outlineOffset = '2px';

    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, duration);
  }

  // アナウンス
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const liveRegion = document.getElementById('accessibility-announcements');
    if (!liveRegion) return;

    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;

    // 履歴に追加
    this.state.announcements.push(message);
    if (this.state.announcements.length > 10) {
      this.state.announcements = this.state.announcements.slice(-5);
    }

    this.emit('announcement', message);

    // クリア
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  // 設定更新
  updateFeature(feature: keyof AccessibilityFeatures, enabled: boolean) {
    this.state.features[feature] = enabled;
    this.updateBodyClasses();
    this.saveUserPreferences();
    this.emit('featureChange', feature, enabled);
  }

  // body classの更新
  private updateBodyClasses() {
    const { features } = this.state;
    
    document.body.classList.toggle('high-contrast', features.highContrast);
    document.body.classList.toggle('reduced-motion', features.reducedMotion);
    document.body.classList.toggle('large-text', features.largeText);
    document.body.classList.toggle('screen-reader', features.screenReader);
    document.body.classList.toggle('keyboard-navigation', this.state.keyboardMode);
  }

  // ユーザー設定保存
  private saveUserPreferences() {
    try {
      localStorage.setItem('accessibility_preferences', JSON.stringify(this.state.features));
    } catch (error) {
      console.error('アクセシビリティ設定保存エラー:', error);
    }
  }

  // ユーザー設定読み込み
  private loadUserPreferences() {
    try {
      const stored = localStorage.getItem('accessibility_preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.state.features = { ...this.state.features, ...preferences };
        this.updateBodyClasses();
      }
    } catch (error) {
      console.error('アクセシビリティ設定読み込みエラー:', error);
    }
  }

  // イベントリスナー管理
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`アクセシビリティイベントエラー (${event}):`, error);
        }
      });
    }
  }

  // 状態取得
  getState(): AccessibilityState {
    return { ...this.state };
  }

  getFeatures(): AccessibilityFeatures {
    return { ...this.state.features };
  }

  // クリーンアップ
  destroy() {
    this.listeners.clear();
    if (this.focusRing) {
      this.focusRing.remove();
    }
  }
}

// シングルトンインスタンス
export const accessibilityManager = new AccessibilityManager(); 