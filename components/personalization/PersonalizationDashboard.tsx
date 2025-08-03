// 個人化ダッシュボード - ユーザー別カスタマイズ推薦UI
// セグメント情報、推薦理由、個人化精度をリアルタイム表示

'use client';

import React, { useState, useEffect } from 'react';
import { userSegmentationEngine } from '../../lib/userSegmentation';

interface PersonalizationDashboardProps {
  userId: string;
  className?: string;
}

export const PersonalizationDashboard = ({ userId, className = '' }: PersonalizationDashboardProps) => {
  const [segmentInfo, setSegmentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSegmentInfo = () => {
      setIsLoading(true);
      
      try {
        const userSegment = userSegmentationEngine.getUserSegment(userId);
        
        if (userSegment) {
          const segment = userSegmentationEngine.getSegment(userSegment.segmentId);
          
          if (segment) {
            setSegmentInfo({
              segmentId: userSegment.segmentId,
              segmentName: segment.name,
              confidence: userSegment.confidence,
              reasons: userSegment.reasons,
              characteristics: segment.characteristics
            });
          }
        }
      } catch (error) {
        console.error('セグメント情報の取得に失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadSegmentInfo();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className={`p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded-lg mb-4"></div>
          <div className="h-32 bg-white/20 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎯 個人化ダッシュボード
        </h2>
        <p className="text-white/70">
          あなた専用のAI推薦システムの状況
        </p>
      </div>

      {segmentInfo && (
        <div className="space-y-4">
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              タイプ: {segmentInfo.segmentName}
            </h3>
            <p className="text-white/70 text-sm mb-2">信頼度: {(segmentInfo.confidence * 100).toFixed(1)}%</p>
            <div className="flex-1 bg-white/20 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${segmentInfo.confidence * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <h4 className="text-white font-semibold mb-3">分類理由</h4>
            <div className="space-y-2">
              {segmentInfo.reasons.map((reason: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <p className="text-white/90 text-sm">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 