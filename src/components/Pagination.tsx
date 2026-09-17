'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 16, 24, 48],
  itemName = 'items'
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100 text-xs">
      {/* Summary and Page Size */}
      <div className="flex flex-wrap items-center gap-2 text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-900 font-bold">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
            <span className="text-slate-400">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2 py-1 text-slate-700 font-semibold outline-none focus:border-blue-500 transition-colors shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs flex items-center gap-1"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Desktop numbered buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1 text-slate-400 select-none">
                  …
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(Number(p))}
                  className={`w-8 h-8 rounded-xl font-bold transition-all ${
                    currentPage === p
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Mobile Current / Total indicator */}
          <div className="sm:hidden px-3 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 shadow-2xs">
            {currentPage} / {totalPages}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs flex items-center gap-1"
            title="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
