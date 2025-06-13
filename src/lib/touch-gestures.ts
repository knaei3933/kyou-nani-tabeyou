// タッチジェスチャーとハプティックフィードバック管理
export interface TouchGesture {
  type: 'tap' | 'longpress' | 'swipe' | 'pinch';
  target: Element;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
}

// ハプティックフィードバック
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 10]);
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  },
  
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }
};

// タッチイベント管理
export class TouchGestureManager {
  private element: Element;
  private handlers: Map<string, Function> = new Map();
  
  constructor(element: Element) {
    this.element = element;
    this.setupListeners();
  }
  
  private setupListeners() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    
    this.element.addEventListener('touchstart', (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    });
    
    this.element.addEventListener('touchend', (e: Event) => {
      const touch = (e as TouchEvent).changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const duration = endTime - startTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // スワイプ判定
      if (distance > 50 && duration < 300) {
        const direction = Math.abs(deltaX) > Math.abs(deltaY) 
          ? (deltaX > 0 ? 'right' : 'left')
          : (deltaY > 0 ? 'down' : 'up');
          
        this.trigger('swipe', { direction, distance, duration });
      }
      
      // ロングプレス判定
      if (duration > 500 && distance < 10) {
        this.trigger('longpress', { duration });
      }
      
      // タップ判定
      if (duration < 200 && distance < 10) {
        this.trigger('tap', {});
      }
    });
  }
  
  on(event: string, handler: Function) {
    this.handlers.set(event, handler);
  }
  
  private trigger(event: string, data: any) {
    const handler = this.handlers.get(event);
    if (handler) {
      handler(data);
    }
  }
  
  destroy() {
    this.handlers.clear();
  }
}

// スワイプナビゲーション
export const swipeNavigation = {
  init: (element: Element, onSwipe: (direction: string) => void) => {
    const manager = new TouchGestureManager(element);
    manager.on('swipe', ({ direction }: { direction: string }) => {
      hapticFeedback.light();
      onSwipe(direction);
    });
    return manager;
  }
};

// タッチ最適化ユーティリティ
export const touchUtils = {
  // タッチターゲットサイズ最適化
  optimizeTouchTarget: (element: Element, minSize = 44) => {
    const style = (element as HTMLElement).style;
    style.minWidth = `${minSize}px`;
    style.minHeight = `${minSize}px`;
  },
  
  // タッチイベントパッシブ化
  addPassiveListener: (element: Element, event: string, handler: Function) => {
    element.addEventListener(event, handler as EventListener, { passive: true });
  },
  
  // スクロール防止
  preventScroll: (element: Element) => {
    element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }
}; 