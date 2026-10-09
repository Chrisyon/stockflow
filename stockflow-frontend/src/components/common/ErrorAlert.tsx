import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Terjadi Kesalahan',
  message,
  onDismiss,
}) => {
  return (
    <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 mb-6 text-rose-900 flex items-start gap-3 shadow-xs">
      <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h5 className="text-xs font-bold uppercase tracking-wider text-rose-700">{title}</h5>
        <p className="text-xs text-rose-800 mt-0.5">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-500 hover:text-rose-700 p-1 rounded-md transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
