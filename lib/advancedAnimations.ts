// 高級アニメーションシステム
// 複雑なアニメーション、トランジション、視覚効果管理

export interface AnimationConfig {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'attention' | 'transition' | 'loading';
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  keyframes: Keyframe[];
}

export interface AnimationSequence {
  id: string;
  animations: (string | AnimationConfig)[];
  parallel?: boolean;
  loop?: boolean;
  onComplete?: () => void;
}

export interface PageTransition {
  name: string;
  enter: AnimationConfig;
  exit: AnimationConfig;
  duration: number;
}

export interface AnimationState {
  activeAnimations: Map<string, Animation>;
  queuedAnimations: AnimationConfig[];
  currentSequence: string | null;
  settings: {
    respectReducedMotion: boolean;
    defaultDuration: number;
    defaultEasing: string;
    debugMode: boolean;
  };
}

export class AdvancedAnimationManager {
  private animations: Map<string, AnimationConfig> = new Map();
  private state: AnimationState = {
    activeAnimations: new Map(),
    queuedAnimations: [],
    currentSequence: null,
    settings: {
      respectReducedMotion: true,
      defaultDuration: 300,
      defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      debugMode: false
    }
  };

  private presets: Map<string, AnimationConfig> = new Map();
  private sequences: Map<string, AnimationSequence> = new Map();
  private transitions: Map<string, PageTransition> = new Map();
  private observers: IntersectionObserver[] = [];

  constructor() {
    this.setupDefaultAnimations();
    this.setupIntersectionObservers();
    this.detectSystemPreferences();
  }

  // デフォルトアニメーション設定
  private setupDefaultAnimations() {
    this.registerAnimation({
      id: 'fadeIn',
      name: 'フェードイン',
      type: 'entrance',
      duration: 600,
      easing: 'ease-out',
      keyframes: [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ]
    });

    this.registerAnimation({
      id: 'slideIn',
      name: 'スライドイン',
      type: 'entrance',
      duration: 500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      keyframes: [
        { opacity: 0, transform: 'translateX(-100px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ]
    });

    this.registerAnimation({
      id: 'scaleIn',
      name: 'スケールイン',
      type: 'entrance',
      duration: 400,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      keyframes: [
        { opacity: 0, transform: 'scale(0.3)' },
        { opacity: 1, transform: 'scale(1)' }
      ]
    });

    // エグジットアニメーション
    this.registerAnimation({
      id: 'fadeOut',
      name: 'フェードアウト',
      type: 'exit',
      duration: 300,
      easing: 'ease-in',
      keyframes: [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-20px)' }
      ]
    });

    // アテンションアニメーション
    this.registerAnimation({
      id: 'bounce',
      name: 'バウンス',
      type: 'attention',
      duration: 1000,
      easing: 'ease-in-out',
      iterations: 2,
      keyframes: [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' },
        { transform: 'translateY(-5px)' },
        { transform: 'translateY(0)' }
      ]
    });

    this.registerAnimation({
      id: 'shake',
      name: 'シェイク',
      type: 'attention',
      duration: 500,
      easing: 'ease-in-out',
      keyframes: [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
      ]
    });

    this.registerAnimation({
      id: 'pulse',
      name: 'パルス',
      type: 'attention',
      duration: 1500,
      easing: 'ease-in-out',
      iterations: Infinity,
      keyframes: [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0.7, transform: 'scale(1.05)' },
        { opacity: 1, transform: 'scale(1)' }
      ]
    });

    // ローディングアニメーション
    this.registerAnimation({
      id: 'spin',
      name: 'スピン',
      type: 'loading',
      duration: 1000,
      easing: 'linear',
      iterations: Infinity,
      keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
      ]
    });

    this.registerAnimation({
      id: 'breathe',
      name: 'ブリーズ',
      type: 'loading',
      duration: 2000,
      easing: 'ease-in-out',
      iterations: Infinity,
      keyframes: [
        { opacity: 0.4, transform: 'scale(1)' },
        { opacity: 1, transform: 'scale(1.1)' },
        { opacity: 0.4, transform: 'scale(1)' }
      ]
    });

    // トランジションアニメーション
    this.registerAnimation({
      id: 'morphIn',
      name: 'モーフイン',
      type: 'transition',
      duration: 800,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      keyframes: [
        { 
          opacity: 0, 
          transform: 'scale(0.6) rotate(-5deg)',
          filter: 'blur(10px)'
        },
        { 
          opacity: 1, 
          transform: 'scale(1) rotate(0deg)',
          filter: 'blur(0px)'
        }
      ]
    });
  }

  // システム設定検出
  private detectSystemPreferences() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (reducedMotion.matches && this.state.settings.respectReducedMotion) {
      this.state.settings.defaultDuration = 0;
    }

    reducedMotion.addEventListener('change', (e) => {
      if (e.matches && this.state.settings.respectReducedMotion) {
        this.state.settings.defaultDuration = 0;
        this.pauseAllAnimations();
      } else {
        this.state.settings.defaultDuration = 300;
        this.resumeAllAnimations();
      }
    });
  }

  // Intersection Observer設定
  private setupIntersectionObservers() {
    // 画面に入った要素にアニメーション適用
    const entranceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const animationId = element.dataset.animateIn;
          
          if (animationId) {
            this.animateElement(element, animationId);
            entranceObserver.unobserve(element);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    this.observers.push(entranceObserver);

    // data-animate-in属性を持つ要素を監視
    const elementsToAnimate = document.querySelectorAll('[data-animate-in]');
    elementsToAnimate.forEach(element => {
      entranceObserver.observe(element);
    });
  }

  // アニメーション登録
  registerAnimation(config: AnimationConfig) {
    this.presets.set(config.id, config);
    this.animations.set(config.id, config);
  }

  // シーケンス登録
  registerSequence(sequence: AnimationSequence) {
    this.sequences.set(sequence.id, sequence);
  }

  // ページトランジション登録
  registerPageTransition(transition: PageTransition) {
    this.transitions.set(transition.name, transition);
  }

  // 要素アニメーション実行
  async animateElement(
    element: HTMLElement, 
    animationId: string,
    options?: Partial<AnimationConfig>
  ): Promise<void> {
    const config = this.animations.get(animationId);
    if (!config) {
      console.warn(`アニメーション ${animationId} が見つかりません`);
      return;
    }

    // 設定をマージ
    const finalConfig = { ...config, ...options };

    // 動作軽減設定の確認
    if (this.state.settings.respectReducedMotion && this.state.settings.defaultDuration === 0) {
      // 即座に最終状態に設定
      const lastKeyframe = finalConfig.keyframes[finalConfig.keyframes.length - 1];
      Object.assign(element.style, lastKeyframe);
      return;
    }

    // アニメーション実行
    return new Promise((resolve) => {
      const animation = element.animate(finalConfig.keyframes, {
        duration: finalConfig.duration,
        easing: finalConfig.easing,
        delay: finalConfig.delay || 0,
        iterations: finalConfig.iterations || 1,
        direction: finalConfig.direction || 'normal',
        fill: finalConfig.fillMode || 'both'
      });

      // アクティブなアニメーションとして追跡
      const trackingId = `${element.id || 'element'}-${Date.now()}`;
      this.state.activeAnimations.set(trackingId, animation);

      animation.addEventListener('finish', () => {
        this.state.activeAnimations.delete(trackingId);
        resolve();
      });

      animation.addEventListener('cancel', () => {
        this.state.activeAnimations.delete(trackingId);
        resolve();
      });

      if (this.state.settings.debugMode) {
        console.log(`アニメーション開始: ${finalConfig.name} (${trackingId})`);
      }
    });
  }

  // シーケンス実行
  async playSequence(sequenceId: string, elements: HTMLElement[]): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      console.warn(`シーケンス ${sequenceId} が見つかりません`);
      return;
    }

    this.state.currentSequence = sequenceId;

    try {
      if (sequence.parallel) {
        // 並列実行
        const promises = sequence.animations.map((animConfig, index) => {
          const element = elements[index % elements.length];
          const animationId = typeof animConfig === 'string' ? animConfig : animConfig.id;
          const options = typeof animConfig === 'object' ? animConfig : undefined;
          
          return this.animateElement(element, animationId, options);
        });

        await Promise.all(promises);
      } else {
        // 順次実行
        for (let i = 0; i < sequence.animations.length; i++) {
          const animConfig = sequence.animations[i];
          const element = elements[i % elements.length];
          const animationId = typeof animConfig === 'string' ? animConfig : animConfig.id;
          const options = typeof animConfig === 'object' ? animConfig : undefined;
          
          await this.animateElement(element, animationId, options);
        }
      }

      if (sequence.onComplete) {
        sequence.onComplete();
      }

      if (sequence.loop) {
        // ループ実行
        setTimeout(() => {
          this.playSequence(sequenceId, elements);
        }, 1000);
      }
    } finally {
      this.state.currentSequence = null;
    }
  }

  // ページトランジション実行
  async executePageTransition(
    transitionName: string,
    outgoingElement: HTMLElement,
    incomingElement: HTMLElement
  ): Promise<void> {
    const transition = this.transitions.get(transitionName);
    if (!transition) {
      console.warn(`トランジション ${transitionName} が見つかりません`);
      return;
    }

    // 退出アニメーション
    await this.animateElement(outgoingElement, transition.exit.id);
    
    // 要素を非表示
    outgoingElement.style.display = 'none';
    incomingElement.style.display = 'block';
    
    // 入場アニメーション
    await this.animateElement(incomingElement, transition.enter.id);
  }

  // スタガー（時差）アニメーション
  async staggerAnimation(
    elements: HTMLElement[],
    animationId: string,
    staggerDelay: number = 100
  ): Promise<void> {
    const promises = elements.map((element, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          await this.animateElement(element, animationId);
          resolve();
        }, index * staggerDelay);
      });
    });

    await Promise.all(promises);
  }

  // 高級エフェクト

  // パーティクルエフェクト
  createParticleEffect(element: HTMLElement, options: {
    count?: number;
    colors?: string[];
    duration?: number;
    spread?: number;
  } = {}) {
    const {
      count = 20,
      colors = ['#ff6b35', '#f7931e', '#ffd23f'],
      duration = 1000,
      spread = 100
    } = options;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle-effect';
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 50 + Math.random() * spread;
      const size = 4 + Math.random() * 6;

      Object.assign(particle.style, {
        position: 'fixed',
        left: `${centerX}px`,
        top: `${centerY}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '9999'
      });

      document.body.appendChild(particle);

      const endX = centerX + Math.cos(angle) * velocity;
      const endY = centerY + Math.sin(angle) * velocity;

      particle.animate([
        {
          transform: `translate(0, 0) scale(1)`,
          opacity: 1
        },
        {
          transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      }).addEventListener('finish', () => {
        particle.remove();
      });
    }
  }

  // リップルエフェクト
  createRippleEffect(element: HTMLElement, event: MouseEvent) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    
    Object.assign(ripple.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'scale(0)',
      pointerEvents: 'none'
    });

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    ripple.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).addEventListener('finish', () => {
      ripple.remove();
    });
  }

  // アニメーション制御
  pauseAllAnimations() {
    this.state.activeAnimations.forEach(animation => {
      animation.pause();
    });
  }

  resumeAllAnimations() {
    this.state.activeAnimations.forEach(animation => {
      animation.play();
    });
  }

  cancelAllAnimations() {
    this.state.activeAnimations.forEach(animation => {
      animation.cancel();
    });
    this.state.activeAnimations.clear();
  }

  // ユーティリティメソッド
  isAnimating(element?: HTMLElement): boolean {
    if (element) {
      return Array.from(this.state.activeAnimations.values()).some(
        animation => animation.effect?.target === element
      );
    }
    return this.state.activeAnimations.size > 0;
  }

  getActiveAnimationCount(): number {
    return this.state.activeAnimations.size;
  }

  // 設定管理
  updateSettings(settings: Partial<typeof this.state.settings>) {
    this.state.settings = { ...this.state.settings, ...settings };
  }

  getSettings() {
    return { ...this.state.settings };
  }

  // クリーンアップ
  destroy() {
    this.cancelAllAnimations();
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// シングルトンインスタンス
export const animationManager = new AdvancedAnimationManager(); 