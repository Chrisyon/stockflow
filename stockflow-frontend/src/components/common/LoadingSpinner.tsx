import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Memuat data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-3 border-brand-200 border-t-brand-600 mb-3"></div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};
