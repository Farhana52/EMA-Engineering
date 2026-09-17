'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Eye, Trash2, X } from 'lucide-react';
import { Quotation } from '@/types/invoice';
import Pagination from '@/components/Pagination';
import { useToast } from '@/components/Toast';

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { showToast } = useToast();

  const loadQuotations = useCallback(async () => {
    try {
      let url = '/api/quotations';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch (err: unknown) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    let ignore = false;
    async function fetchQuotes() {
      try {
        let url = '/api/quotations';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (statusFilter) params.append('status', statusFilter);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setQuotations(data);
        }
      } catch (err: unknown) {
        console.error('Failed to load quotations:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchQuotes();
    return () => {
      ignore = true;
    };
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuotations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Quotation deleted successfully', 'success');
        loadQuotations();
      } else {
        showToast('Failed to delete quotation', 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const paginatedQuotations = quotations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Quotations & Invoices
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review, edit, and print official commercial quotation documents.
            </p>
          </div>
        </div>

        <Link
          href="/quotations/new"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quote #, client company, or subject..."
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all outline-none font-normal"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['', 'Draft', 'Sent', 'Accepted'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* List / Table */}
      {loading ? (
        <div className="py-24 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm font-medium">Loading quotations from database...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No quotations found</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            {search || statusFilter
              ? 'No quotations match your active filter criteria. Try resetting filters.'
              : 'Create your first quotation to generate a print-ready document.'}
          </p>
          {search || statusFilter ? (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
              }}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              href="/quotations/new"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Quote #</th>
                  <th className="px-6 py-3.5">Client Company</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedQuotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 tabular-nums">
                      <Link href={`/quotations/${q._id}`} className="hover:text-blue-600 transition-colors">
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {q.clientCompany}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate text-xs font-normal">
                      {q.subject}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs tabular-nums">
                      {q.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                      ৳ {q.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          q.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : q.status === 'Sent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          href={`/quotations/${q._id}`}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors"
                          title="View & Print"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => q._id && handleDelete(q._id)}
                          className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/40">
            <Pagination
              currentPage={currentPage}
              totalItems={quotations.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50]}
              itemName="quotations"
            />
          </div>
        </div>
      )}
    </div>
  );
}
