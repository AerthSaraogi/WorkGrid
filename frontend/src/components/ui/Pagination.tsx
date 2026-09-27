import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (pageIndex - 1) * pageSize + 1;
  const endItem = Math.min(pageIndex * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 sm:px-6">
      <div className="text-xs text-slate-400">
        Showing <span className="font-semibold text-slate-200">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-200">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalCount}</span> results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pageIndex <= 1}
          onClick={() => onPageChange(pageIndex - 1)}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        <span className="text-xs font-medium text-slate-300 px-2">
          Page {pageIndex} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={pageIndex >= totalPages}
          onClick={() => onPageChange(pageIndex + 1)}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
