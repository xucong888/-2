import React from 'react';
import { X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = '出错了',
  message,
  onRetry,
  onRefresh
}) => {
  return (
    <div className="min-h-screen bg-paper-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif text-ink-900">{title}</h2>
        <p className="text-sm text-ink-500">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-6 py-2 bg-ink-900 text-paper-50 rounded-xl text-sm font-bold hover:bg-ink-800 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          )}
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="px-6 py-2 border border-paper-300 text-ink-700 rounded-xl text-sm font-bold hover:bg-paper-100 transition-all"
            >
              刷新页面
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
