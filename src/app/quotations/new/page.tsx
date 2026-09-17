'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Plus, Trash2, Save, ArrowLeft, Package,
  Sparkles, ChevronDown, User, MapPin, MessageSquare, Layers,
  Eye, EyeOff, Palette
} from 'lucide-react';
import Link from 'next/link';
import { Product, QuotationItem } from '@/types/invoice';
import { numberToWordsTaka } from '@/lib/number-to-words';
import ParticularsRenderer from '@/components/ParticularsRenderer';
import { useToast } from '@/components/Toast';
import ProductSearchPicker from '@/components/ProductSearchPicker';

interface FormQuotationItem {
  slNo: string;
  particulars: string;
  listUnitPrice: number | string;
  discountPrice: number | string;
  qty: number | string;
  unit: string;
  amount: number;
}

/* ── shared input class ──────────────────────────────────────── */
const INPUT =
  'w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all outline-none';

const LABEL = 'block text-xs font-bold text-slate-700 mb-1.5';

const COLOR_PRESETS = [
  { label: 'Red (Default)', color: '#dc2626' },
  { label: 'Navy', color: '#1e3a8a' },
  { label: 'Blue', color: '#2563eb' },
  { label: 'Emerald', color: '#059669' },
  { label: 'Slate', color: '#0f172a' },
  { label: 'Violet', color: '#7c3aed' },
  { label: 'Amber', color: '#d97706' },
];

/* ── section card ────────────────────────────────────────────── */
function Card({
  icon: Icon,
  title,
  subtitle,
  badge,
  actions,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{title}</h2>
              {badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex-shrink-0 self-end sm:self-auto">{actions}</div>}
      </div>
      <div className="p-3.5 sm:p-6">{children}</div>
    </div>
  );
}

/* ── field wrapper ───────────────────────────────────────────── */
function Field({ label, required, children, span }: { label: string; required?: boolean; children: React.ReactNode; span?: string }) {
  return (
    <div className={span}>
      <label className={LABEL}>
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function NewQuotationPage() {
  const router = useRouter();
  const { showToast } = useToast();

  /* document metadata */
  const [docType, setDocType] = useState<'Quotation' | 'Invoice'>('Quotation');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  });

  /* client */
  const [clientDesignation, setClientDesignation] = useState('Managing Director');
  const [clientCompany, setClientCompany] = useState('');
  const [boldClientCompany, setBoldClientCompany] = useState(true);
  const [clientAddress, setClientAddress] = useState('');
  const [subject, setSubject] = useState('Price offer for Inverter Service Charge.');
  const [salutation, setSalutation] = useState('Dear Sir,');
  const [openingText, setOpeningText] = useState(
    'Thank you for your requirement. We have the great pleasure to quote you our best prices as follows:'
  );

  /* items */
  const [items, setItems] = useState<FormQuotationItem[]>([
    {
      slNo: '01',
      particulars: `Frequency Inverter\nCapacity: 75Kw, 3phase, 440v\nSpear parts: Change Capacitor, Transistor, SMD, IGBT, Modulebus, Resistor, Terminal, Rectifier, Coupler with control card & power board service.`,
      listUnitPrice: 70000,
      discountPrice: 70000,
      qty: 1,
      unit: 'pc',
      amount: 70000,
    },
  ]);

  /* terms */
  const [terms, setTerms] = useState<string[]>([
    '01) Our offer will remain valid for a period of 15 days from the date of this offer.',
    '02) 100% cash/PO/Cheque as an advance before delivery.',
    '03) VAT encluded the above-mentioned price value and AIT as per Govt. rule.',
  ]);
  const [showTerms, setShowTerms] = useState(true);
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyName, setCompanyName] = useState('EMA Engineering');
  const [companyNameColor, setCompanyNameColor] = useState('#dc2626');
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  /* which item particulars preview is expanded */
  const [expandedPreviews, setExpandedPreviews] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function init() {
      try {
        const [sr, pr] = await Promise.all([fetch('/api/settings'), fetch('/api/products')]);
        if (sr.ok) {
          const s = await sr.json();
          if (s.name) setCompanyName(s.name);
          if (s.companyNameColor) setCompanyNameColor(s.companyNameColor);
          if (s.defaultTerms?.length) setTerms(s.defaultTerms);
          if (s.address) setCompanyAddress(s.address);
        }
        if (pr.ok) setProducts(await pr.json());
      } catch (e) {
        console.error('Init error:', e);
      }
    }
    init();
  }, []);

  const handleItemChange = (idx: number, field: keyof FormQuotationItem, value: string | number) => {
    const updated = [...items];
    const prev = updated[idx];
    const cleanVal = typeof value === 'string' ? value.replace(/^0+(?=\d)/, '') : value;
    const item = { ...prev, [field]: cleanVal };
    if (field === 'listUnitPrice' && (!prev.discountPrice || prev.discountPrice === prev.listUnitPrice)) {
      item.discountPrice = cleanVal;
    }
    item.amount = (Number(item.discountPrice) || 0) * (Number(item.qty) || 0);
    updated[idx] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    const sl = (items.length + 1).toString().padStart(2, '0');
    setItems([...items, { slNo: sl, particulars: '', listUnitPrice: '', discountPrice: '', qty: 1, unit: 'pc', amount: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, slNo: (i + 1).toString().padStart(2, '0') })));
  };

  const handleSelectProduct = (idx: number, productId: string) => {
    const p = products.find((x) => x._id === productId);
    if (!p) return;
    const updated = [...items];
    const price = p.defaultUnitPrice || 0;
    const cleanPrice = price === 0 ? '' : price;
    updated[idx] = {
      ...updated[idx],
      particulars: `${p.name}\n${p.description || ''}`.trim(),
      listUnitPrice: cleanPrice,
      discountPrice: cleanPrice,
      unit: p.unit || 'pc',
      amount: (Number(price) || 0) * (Number(updated[idx].qty) || 1),
    };
    setItems(updated);
  };

  const handleDocTypeChange = (newType: 'Quotation' | 'Invoice') => {
    setDocType(newType);
    if (newType === 'Invoice') {
      if (subject === 'Price offer for Inverter Service Charge.') {
        setSubject('');
      }
      if (terms.length === 3 && terms[0]?.includes('valid for a period of 15 days')) {
        setTerms([
          `01) Payment should be made through Cheque / Pay Order / Bank Transfer in favor of ${companyName || 'EMA Engineering'}.`,
          '02) VAT & Tax as per Bangladesh Govt. rules.',
          '03) Goods/Service received in satisfactory condition.',
        ]);
      }
    } else {
      if (!subject.trim()) {
        setSubject('Price offer for Inverter Service Charge.');
      }
      if (terms.length === 3 && terms[0]?.includes('Cheque / Pay Order')) {
        setTerms([
          '01) Our offer will remain valid for a period of 15 days from the date of this offer.',
          '02) 100% cash/PO/Cheque as an advance before delivery.',
          '03) VAT encluded the above-mentioned price value and AIT as per Govt. rule.',
        ]);
      }
    }
  };

  const togglePreview = (idx: number) => {
    setExpandedPreviews((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const totalQty = items.reduce((s, x) => s + (Number(x.qty) || 0), 0);
  const totalAmount = items.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const inWords = numberToWordsTaka(totalAmount);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!clientCompany.trim()) {
      showToast('Client Company name is required.', 'error');
      return;
    }
    if (docType === 'Quotation' && !subject.trim()) {
      showToast('Subject is required for quotations.', 'error');
      return;
    }

    setSaving(true);
    try {
      const sanitizedItems = items.map((item) => ({
        ...item,
        listUnitPrice: Number(item.listUnitPrice) || 0,
        discountPrice: Number(item.discountPrice) || 0,
        qty: Number(item.qty) || 0,
        amount: (Number(item.discountPrice) || 0) * (Number(item.qty) || 0),
      }));

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType, date, clientDesignation, clientCompany, boldClientCompany, clientAddress,
          subject: subject.trim(),
          salutation: docType === 'Invoice' ? '' : salutation,
          openingText: docType === 'Invoice' ? '' : openingText,
          items: sanitizedItems,
          totalQty, totalAmount, inWords, terms, showTerms, companyAddress,
          companyNameColor,
          status: 'Draft',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Document created successfully!', 'success');
        router.push(`/quotations/${data._id}`);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create document.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Submission error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/quotations"
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 shadow-xs transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              New {docType}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft commercial price offer · EMA Engineering
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-60 whitespace-nowrap"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Creating…' : 'Save & Preview'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Section 1: Document + Client ── */}
        <Card
          icon={FileText}
          title={docType === 'Invoice' ? 'Invoice & Client Details' : 'Document & Recipient'}
          badge="Step 1 of 3"
          subtitle={
            docType === 'Invoice'
              ? 'Set invoice details, payment terms, and client billing info.'
              : 'Set the document type, date, and recipient details.'
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Document Type">
              <div className="relative">
                <select
                  value={docType}
                  onChange={(e) => handleDocTypeChange(e.target.value as 'Quotation' | 'Invoice')}
                  className={`${INPUT} appearance-none pr-9 font-semibold text-blue-700`}
                >
                  <option value="Quotation">Quotation (Price Offer)</option>
                  <option value="Invoice">Invoice (Commercial Bill)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>

            <Field label={docType === 'Invoice' ? 'Invoice Date (DD-MM-YYYY)' : 'Date (DD-MM-YYYY)'}>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="25-08-2026"
                className={`${INPUT} tabular-nums`}
              />
            </Field>

          </div>

          {/* ── Company Header Branding Color ── */}
          <div className="mt-3 pt-3 border-t border-slate-100/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Company Name Color (Letterhead)
                </label>
                <p className="text-[11px] text-slate-400">
                  Select or customize your company name color on the quotation letterhead. Default is Red (#dc2626).
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 self-start sm:self-auto shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preview:</span>
                <span className="text-sm font-black tracking-tight leading-none" style={{ color: companyNameColor }}>
                  {companyName || 'EMA Engineering'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((p) => {
                const isSelected = companyNameColor.toLowerCase() === p.color.toLowerCase();
                return (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setCompanyNameColor(p.color)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/15 shadow-2xs flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.label}</span>
                  </button>
                );
              })}

              {/* Custom Color Input */}
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2 py-1 transition-all">
                <label
                  title="Pick custom color"
                  className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600"
                >
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs flex-shrink-0"
                    style={{ backgroundColor: companyNameColor }}
                  />
                  <input
                    type="color"
                    value={companyNameColor.startsWith('#') && companyNameColor.length === 7 ? companyNameColor : '#dc2626'}
                    onChange={(e) => setCompanyNameColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
                <input
                  type="text"
                  value={companyNameColor}
                  onChange={(e) => setCompanyNameColor(e.target.value)}
                  placeholder="#dc2626"
                  maxLength={7}
                  className="w-18 text-xs font-mono font-semibold text-slate-800 focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>

          <div className="mt-1 h-px bg-slate-100" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Field label={docType === 'Invoice' ? 'Attn / Client Designation' : 'Recipient Designation'}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={clientDesignation}
                  onChange={(e) => setClientDesignation(e.target.value)}
                  placeholder="Managing Director"
                  className={`${INPUT} pl-9`}
                />
              </div>
            </Field>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {docType === 'Invoice' ? 'Bill To (Company Name)' : 'Client Company'} <span className="text-rose-500">*</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-slate-600 hover:text-blue-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={boldClientCompany}
                    onChange={(e) => setBoldClientCompany(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Bold company name</span>
                </label>
              </div>
              <input
                type="text"
                required
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="e.g. NewAge Garments Ltd."
                className={`${INPUT} ${boldClientCompany ? 'font-bold' : 'font-medium'}`}
              />
            </div>

            <Field label="Client Address" span="sm:col-span-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Plot 45, Export Processing Zone, Dhaka (Optional)"
                  className={`${INPUT} pl-9`}
                />
              </div>
            </Field>

            {docType === 'Quotation' ? (
              <>
                <Field label="Subject" required span="sm:col-span-3">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Price offer for Inverter Service Charge."
                      className={`${INPUT} pl-9 font-semibold`}
                    />
                  </div>
                </Field>

                <Field label="Salutation">
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    placeholder="Dear Sir,"
                    className={INPUT}
                  />
                </Field>

                <Field label="Opening Statement" span="sm:col-span-2">
                  <input
                    type="text"
                    value={openingText}
                    onChange={(e) => setOpeningText(e.target.value)}
                    placeholder="Thank you for your requirement…"
                    className={INPUT}
                  />
                </Field>
              </>
            ) : (
              <Field label="Project / Billing Description (Optional)" span="sm:col-span-3">
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Frequency Inverter Repair & Servicing Charge (Optional)"
                    className={`${INPUT} pl-9`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Proposal letter salutation (&quot;Dear Sir,&quot;, quote opening text) is automatically excluded for commercial invoices.
                </p>
              </Field>
            )}
          </div>
        </Card>

        {/* ── Section 2: Line Items ── */}
        <Card
          icon={Package}
          title="Line Items & Specifications"
          badge="Step 2 of 3"
          subtitle="Add products, technical particulars, pricing, and quantities."
          actions={
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          }
        >
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Header bar: Item # + Catalog Picker + Delete */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 bg-slate-50/80 border-b border-slate-100 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold tabular-nums shadow-2xs">
                      {item.slNo}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Item #{item.slNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {products.length > 0 && (
                      <ProductSearchPicker
                        products={products}
                        onSelect={(productId) => handleSelectProduct(idx, productId)}
                      />
                    )}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-100/60 transition-colors flex-shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-3.5 sm:p-5 space-y-4">
                  {/* Particulars & Specifications */}
                  <div>
                    {(() => {
                      const lines = (item.particulars || '').split('\n');
                      const titlePart = lines[0] || '';
                      const specsPart = lines.slice(1).join('\n');

                      return (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-bold text-slate-800">
                                Particulars & Technical Specifications <span className="text-rose-500">*</span>
                              </label>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                Auto-Formatted
                              </span>
                            </div>

                            {/* Live preview toggle button (Auto-hidden by default) */}
                            <button
                              type="button"
                              onClick={() => togglePreview(idx)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                expandedPreviews.has(idx)
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
                              }`}
                            >
                              {expandedPreviews.has(idx) ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Hide Preview</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Show Preview</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Integrated Structured Box: Name is BOLD in real-time while typing */}
                          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                            {/* Line 1: Item / Service Name (Bold Title as you type) */}
                            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-200/80">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 px-1.5 py-0.5 rounded flex-shrink-0 select-none">
                                Bold Title
                              </span>
                              <input
                                type="text"
                                required
                                value={titlePart}
                                onChange={(e) => {
                                  const newTitle = e.target.value;
                                  const full = specsPart ? `${newTitle}\n${specsPart}` : newTitle;
                                  handleItemChange(idx, 'particulars', full);
                                }}
                                onPaste={(e) => {
                                  const pasted = e.clipboardData.getData('text');
                                  if (pasted.includes('\n')) {
                                    e.preventDefault();
                                    const [first, ...rest] = pasted.split('\n');
                                    const newTitle = first.trim();
                                    const remaining = rest.join('\n').trim();
                                    const combinedSpecs = [remaining, specsPart].filter(Boolean).join('\n');
                                    const full = combinedSpecs ? `${newTitle}\n${combinedSpecs}` : newTitle;
                                    handleItemChange(idx, 'particulars', full);
                                  }
                                }}
                                placeholder="Product / Service Name (e.g. Frequency Inverter)"
                                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none"
                              />
                            </div>

                            {/* Lines 2+: Technical Specifications & Particulars */}
                            <div className="px-3.5 pt-2 pb-2.5 bg-white">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  Specifications & Details
                                </span>
                                {/* Quick format snippet chips */}
                                <div className="flex items-center gap-1 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const added = specsPart ? `${specsPart}\nCapacity: ` : 'Capacity: ';
                                      const full = titlePart ? `${titlePart}\n${added}` : added;
                                      handleItemChange(idx, 'particulars', full);
                                    }}
                                    className="text-[10px] font-medium text-slate-700 hover:text-blue-800 bg-slate-100 hover:bg-blue-100/70 px-2 py-0.5 rounded transition-colors"
                                  >
                                    + Capacity:
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const added = specsPart ? `${specsPart}\nSpear parts: ` : 'Spear parts: ';
                                      const full = titlePart ? `${titlePart}\n${added}` : added;
                                      handleItemChange(idx, 'particulars', full);
                                    }}
                                    className="text-[10px] font-medium text-slate-700 hover:text-blue-800 bg-slate-100 hover:bg-blue-100/70 px-2 py-0.5 rounded transition-colors"
                                  >
                                    + Spear parts:
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const added = specsPart ? `${specsPart}\n• ` : '• ';
                                      const full = titlePart ? `${titlePart}\n${added}` : added;
                                      handleItemChange(idx, 'particulars', full);
                                    }}
                                    className="text-[10px] font-medium text-slate-700 hover:text-blue-800 bg-slate-100 hover:bg-blue-100/70 px-2 py-0.5 rounded transition-colors"
                                  >
                                    + Bullet •
                                  </button>
                                </div>
                              </div>
                              <textarea
                                rows={3}
                                value={specsPart}
                                onChange={(e) => {
                                  const newSpecs = e.target.value;
                                  const full = titlePart ? `${titlePart}\n${newSpecs}` : newSpecs;
                                  handleItemChange(idx, 'particulars', full);
                                }}
                                placeholder={`Capacity: 75Kw, 3phase, 440v\nSpear parts: Change Capacitor, Transistor, IGBT…`}
                                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed outline-none resize-y min-h-[72px] font-normal"
                              />
                            </div>
                          </div>

                          {/* Format guide chips */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-400 text-[10px] uppercase">Formatting:</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-100">
                              Title = Auto-Bold
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              <strong className="font-bold text-slate-900 mr-1">Key:</strong> Value (Bold Label in PDF)
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              • Bullet Points
                            </span>
                          </div>

                          {/* Live Formatted Output Preview (Auto-hidden by default, toggled on demand) */}
                          {expandedPreviews.has(idx) && item.particulars.trim() && (
                            <div className="mt-3 rounded-xl border border-blue-200/80 bg-blue-50/30 p-3 sm:p-3.5 transition-all">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                                    Live Preview (Print & PDF Output)
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                                  Bold applied
                                </span>
                              </div>
                              <div className="bg-white rounded-lg p-3 sm:p-3.5 border border-slate-200 shadow-2xs">
                                <ParticularsRenderer text={item.particulars} />
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Pricing strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <label className={LABEL}>List Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={item.listUnitPrice}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(idx, 'listUnitPrice', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-sm tabular-nums text-slate-800 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className={`${LABEL} text-blue-600`}>Final Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={item.discountPrice}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(idx, 'discountPrice', e.target.value)}
                        className="w-full bg-blue-50 border border-blue-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15 rounded-xl px-3 py-2 text-sm font-bold tabular-nums text-blue-800 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Qty</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.qty}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-sm font-bold tabular-nums text-center text-slate-800 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className={`${LABEL} text-slate-600`}>Line Total</label>
                      <div className="h-[38px] flex items-center justify-end px-3 sm:px-4 bg-slate-50 border border-slate-200 rounded-xl tabular-nums">
                        <span className="text-[10px] text-slate-400 font-bold mr-1.5">BDT</span>
                        <span className="text-sm font-bold text-slate-900 tracking-tight">
                          {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Totals banner */}
          <div className="mt-5 bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-4 sm:px-6 sm:py-5 space-y-3">
            <div className="flex items-center justify-between text-sm border-b border-blue-100/50 pb-3">
              <span className="text-slate-500 font-medium">Total Quantity</span>
              <span className="font-bold text-slate-900 tabular-nums">{totalQty.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <span className="text-slate-600 font-bold text-sm">Grand Total (BDT)</span>
              <span className="text-xl sm:text-2xl font-black text-blue-700 tabular-nums">
                ৳ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-start gap-2.5 pt-2 border-t border-blue-100/50">
              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs leading-relaxed">
                <span className="font-bold text-slate-500 uppercase tracking-wider">In Words: </span>
                <span className="font-semibold text-slate-700">{inWords}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* ── Section 3: Terms & Conditions ── */}
        <Card
          icon={FileText}
          title="Terms & Conditions"
          badge="Step 3 of 3"
          actions={
            <div className="flex items-center gap-3">
              {showTerms && (
                <button
                  type="button"
                  onClick={() => {
                    const n = (terms.length + 1).toString().padStart(2, '0');
                    setTerms([...terms, `${n}) `]);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              )}
              {/* Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTerms(!showTerms)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/15 ${
                    showTerms ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      showTerms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold tracking-tight ${showTerms ? 'text-blue-700' : 'text-slate-400'}`}>
                  {showTerms ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          }
        >
          {showTerms ? (
            <div className="space-y-2.5">
              {terms.map((term, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => {
                      const u = [...terms];
                      u[i] = e.target.value;
                      setTerms(u);
                    }}
                    className={`flex-1 ${INPUT} py-2 text-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setTerms(terms.filter((_, j) => j !== i))}
                    className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
              Terms & Conditions are <strong>excluded</strong> — they will not appear on the printed document.
            </p>
          )}
        </Card>

        {/* ── Bottom submit ── */}
        <div className="flex justify-end pb-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-xs transition-all disabled:opacity-60"
          >
            <Save className="w-4.5 h-4.5" />
            {saving ? 'Creating Document…' : 'Generate & Preview Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
