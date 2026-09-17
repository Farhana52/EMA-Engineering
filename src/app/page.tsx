'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  TrendingUp,
  Package,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';
import { Quotation } from '@/types/invoice';

export default function DashboardPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [qRes, pRes] = await Promise.all([
        fetch('/api/quotations'),
        fetch('/api/products')
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQuotations(qData);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setProductCount(pData.length);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSeedSample = async () => {
    setSeeding(true);
    try {
      const sampleQuotation = {
        quoteNumber: 'QT-2026-001',
        docType: 'Quotation',
        date: '25-08-2026',
        clientDesignation: 'Managing Director',
        clientCompany: 'NEWAGE GARMENTS LTD.',
        subject: 'Price offer for Inverter Service Charge.',
        salutation: 'Dear Sir,',
        openingText:
          'Thank you for your requirement. We have the great pleasure to quote you our best prices as follows:',
        items: [
          {
            slNo: '01',
            particulars: `Frequency Inverter\nCapacity: 75Kw, 3phase, 440v\nSpear parts: Change Capacitor, Transistor, SMD, IGBT, Modulebus, Resistor, Terminal, Rectifier, Coupler with control card & power board service.`,
            listUnitPrice: 70000,
            discountPrice: 70000,
            qty: 1,
            unit: 'pc',
            amount: 70000
          }
        ],
        terms: [
          '01) Our offer will remain valid for a period of 15 days from the date of this offer.',
          '02) 100% cash/PO/Cheque as an advance before delivery.',
          '03) VAT encluded the above-mentioned price value and AIT as per Govt. rule.'
        ],
        showTerms: true,
        status: 'Sent'
      };

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleQuotation)
      });

      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const totalValue = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const acceptedQuotes = quotations.filter((q) => q.status === 'Accepted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Dashboard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-xs">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Overview of quotations, billing totals, and active commercial offers.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {quotations.length === 0 && !loading && (
            <button
              onClick={handleSeedSample}
              disabled={seeding}
              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{seeding ? 'Generating...' : 'Load Sample'}</span>
            </button>
          )}
          <Link
            href="/quotations/new"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Quotations
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">{quotations.length}</div>
          <p className="text-xs text-slate-500 mt-1">Saved in database</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Quoted Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            ৳ {totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across all quotes</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Accepted Deals
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">{acceptedQuotes}</div>
          <p className="text-xs text-slate-500 mt-1">Approved by clients</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">{productCount}</div>
          <p className="text-xs text-slate-500 mt-1">Available products/services</p>
        </div>
      </div>

      {/* Recent Quotations Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Recent Quotations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest commercial price offers and invoices.</p>
          </div>
          <Link
            href="/quotations"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All ({quotations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm font-medium">Loading recent records...</p>
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No quotations created yet</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Draft your first quotation to generate a print-ready document or load the EMA Engineering sample.
            </p>
            <div className="flex justify-center space-x-3">
              <Link
                href="/quotations/new"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Quotation</span>
              </Link>
              <button
                onClick={handleSeedSample}
                disabled={seeding}
                className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Quote #</th>
                  <th className="px-6 py-3.5">Client Company</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.slice(0, 5).map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <Link href={`/quotations/${q._id}`} className="hover:text-blue-600 transition-colors">
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {q.clientCompany}
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
                      <Link
                        href={`/quotations/${q._id}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
