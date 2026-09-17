'use client';

import { useState, useRef, useEffect } from 'react';
import { Package, ChevronDown, Search } from 'lucide-react';
import { Product } from '@/types/invoice';

interface ProductSearchPickerProps {
  products: Product[];
  onSelect: (productId: string) => void;
}

export default function ProductSearchPicker({ products, onSelect }: ProductSearchPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      inputRef.current?.focus({ preventScroll: true });
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative flex-1 max-w-[220px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="w-full flex items-center justify-between text-xs bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-600 rounded-lg pl-2.5 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium transition-colors shadow-2xs"
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate font-semibold">Load from catalog...</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+4px)] right-0 w-[290px] max-w-[calc(100vw-36px)] bg-white border border-slate-200/80 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col transform opacity-100 scale-100 origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400 shadow-xs"
              />
            </div>
          </div>
          <div className="max-h-[260px] overflow-y-auto p-1.5">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    if (p._id) onSelect(p._id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 focus:bg-blue-50 outline-none transition-colors group flex flex-col gap-0.5"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{p.name}</span>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-medium text-slate-500 truncate pr-2 flex-1">{p.description || 'No description'}</span>
                    <span className="text-[10px] font-bold text-slate-700 tabular-nums bg-white px-1.5 py-0.5 rounded shadow-2xs border border-slate-100 flex-shrink-0">
                      ৳{p.defaultUnitPrice?.toLocaleString('en-IN') ?? 0}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-xs text-slate-500 font-medium">
                No products found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
