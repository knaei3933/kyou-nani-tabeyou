// マイクロインタラクション管理システム
export interface MicroInteraction {
  type: 'click' | 'hover' | 'focus' | 'success' | 'error';
  element: Element;
  animation?: string;
  duration?: number;
  sound?: boolean;
}

// 기본 마이크로인터랙션
export const microInteractions = {
  // 클릭 애니메이션
  click: (element: Element) => {
    element.classList.add('animate-pulse');
    setTimeout(() => {
      element.classList.remove('animate-pulse');
    }, 150);
  },
  
  // 성공 피드백
  success: (element: Element) => {
    element.classList.add('animate-bounce');
    setTimeout(() => {
      element.classList.remove('animate-bounce');
    }, 500);
  },
  
  // 에러 피드백
  error: (element: Element) => {
    element.classList.add('animate-shake');
    setTimeout(() => {
      element.classList.remove('animate-shake');
    }, 300);
  }
};

export default microInteractions;
