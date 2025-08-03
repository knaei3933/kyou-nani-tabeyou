// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

export default function PWAStatus() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swStatus, setSWStatus] = useState('checking');

  useEffect(() => {
    // Check if PWA is installable
    window.addEventListener('beforeinstallprompt', () => {
      setIsInstallable(true);
    });

    // Check if PWA is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check online status
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => setSWStatus('active'))
        .catch(() => setSWStatus('error'));
    } else {
      setSWStatus('not-supported');
    }

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '280px',
      fontSize: '14px'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '16px', 
        color: '#1e293b',
        fontWeight: '600'
      }}>
        🔧 PWA ステータス
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: isOnline ? '#10b981' : '#ef4444' 
          }}></span>
          <span style={{ color: '#6b7280' }}>
            ネットワーク: {isOnline ? 'オンライン' : 'オフライン'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: swStatus === 'active' ? '#10b981' : 
                           swStatus === 'checking' ? '#f59e0b' : '#ef4444'
          }}></span>
          <span style={{ color: '#6b7280' }}>
            SW: {swStatus === 'active' ? 'アクティブ' : 
                 swStatus === 'checking' ? '確認中' : 'エラー'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: isInstalled ? '#10b981' : 
                           isInstallable ? '#f59e0b' : '#6b7280'
          }}></span>
          <span style={{ color: '#6b7280' }}>
            インストール: {isInstalled ? '完了' : 
                  isInstallable ? '可能' : '待機中'}
          </span>
        </div>
      </div>

      {isInstallable && !isInstalled && (
        <button
          onClick={() => {
            const event = (window as any).deferredPrompt;
            if (event) {
              event.prompt();
              event.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  setIsInstalled(true);
                  setIsInstallable(false);
                }
              });
            }
          }}
          style={{
            marginTop: '12px',
            width: '100%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📱 アプリをインストール
        </button>
      )}
    </div>
  );
} 