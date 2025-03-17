import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export const ConnectionLoading = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
    <h2 className="text-xl font-semibold text-gray-800 mb-2">接続中...</h2>
    <p className="text-gray-600">WebSocket接続を確立しています。しばらくお待ちください。</p>
  </div>
);

export const ConnectionError = ({ onRetry }) => (
  <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-red-50">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h2 className="text-xl font-semibold text-red-800 mb-2">接続エラー</h2>
    <p className="text-red-600 mb-4">WebSocket接続に失敗しました。ネットワーク接続を確認してください。</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      再接続する
    </button>
  </div>
);
