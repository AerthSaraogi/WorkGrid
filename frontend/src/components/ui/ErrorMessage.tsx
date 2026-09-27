import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorMessageProps {
  message?: string | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-rose-300 flex items-start justify-between gap-3 shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-rose-200">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          className="border-rose-800 text-rose-300 hover:bg-rose-900/40 shrink-0"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
