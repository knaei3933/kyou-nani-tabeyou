'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 등록 성공:', registration);
          setSwRegistered(true);
        })
        .catch((error) => {
          console.error('Service Worker 등록 실패:', error);
        });
    }

    // PWA 설치 프롬프트 감지
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // PWA 설치 완료 감지
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('PWA 설치 완료!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 이미 설치되었는지 확인
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 허용했습니다');
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다');
      }
      setInstallPrompt(null);
    }
  };

  // 이미 설치되었거나 설치 프롬프트가 없으면 표시하지 않음
  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '90vw'
    }}>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          📱 앱으로 설치하기
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          홈 화면에 추가하여 더 편리하게 사용하세요
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleInstall}
          style={{
            backgroundColor: 'white',
            color: '#3b82f6',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          설치
        </button>
        
        <button
          onClick={() => setInstallPrompt(null)}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          나중에
        </button>
      </div>
    </div>
  );
} 