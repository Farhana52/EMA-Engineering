'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, Trash2, LayoutTemplate } from 'lucide-react';
import { Quotation, CompanySettings } from '@/types/invoice';
import ParticularsRenderer from '@/components/ParticularsRenderer';
import { useToast } from '@/components/Toast';

type TemplateId = 'classic' | 'formal';

const TEMPLATES: { id: TemplateId; name: string; desc: string; accent: string }[] = [
  { id: 'classic', name: 'Classic', desc: 'Standard letterhead, clean table', accent: '#dc2626' },
  { id: 'formal',  name: 'Formal',  desc: 'Centered header format',           accent: '#000000' },
];

const LS_KEY = 'quotation_template';

const STATUS_CLS: Record<string, string> = {
  Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Sent:     'bg-blue-50 text-blue-700 border-blue-200',
  Declined: 'bg-rose-50 text-rose-700 border-rose-200',
  Draft:    'bg-slate-100 text-slate-600 border-slate-200',
};

// ── Shared atomic components ──────────────────────────────────────────────────

type TplProps = {
  quotation: Quotation;
  companyName: string;
  companyTagline: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyNameColor?: string;
};

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TableBody({ items, totalQty, totalAmount, bc = 'border-black', isInvoice = false }: {
  items: Quotation['items'];
  totalQty: number;
  totalAmount: number;
  bc?: string;
  isInvoice?: boolean;
}) {
  return (
    <tbody>
      {items.map((item, i) => (
        <tr key={i} className={`border-b ${bc} align-top`} style={{ breakInside: 'avoid' }}>
          <td className={`border-r ${bc} px-2 py-2 text-center font-semibold text-[11px] text-black`}>{item.slNo}</td>
          <td className={`border-r ${bc} px-2.5 py-2 text-left`}><ParticularsRenderer text={item.particulars} /></td>
          {!isInvoice && (
            <td className={`border-r ${bc} px-2 py-2 text-right tabular-nums text-[11px] font-semibold text-black`}>
              {item.listUnitPrice > 0 ? fmt(item.listUnitPrice) : <span className="text-neutral-400">—</span>}
            </td>
          )}
          <td className={`border-r ${bc} px-2 py-2 text-right font-semibold tabular-nums text-[11px] text-black`}>{fmt(item.discountPrice)}</td>
          <td className={`border-r ${bc} px-2 py-2 text-center tabular-nums text-[11px] font-semibold text-black`}>{item.qty.toString().padStart(2,'0')} {item.unit}</td>
          <td className="px-2 py-2 text-right font-bold tabular-nums text-[11px] text-black">{fmt(item.amount)}</td>
        </tr>
      ))}
      <tr className={`border-t ${bc}`}>
        <td colSpan={isInvoice ? 3 : 4} className={`border-r ${bc} px-2.5 py-1.5 text-right font-bold text-[11px] text-black`}>Total Qty.</td>
        <td className={`border-r ${bc} px-2.5 py-1.5 text-center font-bold tabular-nums text-[11px] text-black`}>{totalQty.toString().padStart(2,'0')}</td>
        <td className="px-2.5 py-1.5" />
      </tr>
      <tr className={`border-t ${bc}`}>
        <td colSpan={isInvoice ? 4 : 5} className={`border-r ${bc} px-2.5 py-1.5 text-right font-bold text-xs text-black`}>Total Amount</td>
        <td className="px-2.5 py-1.5 text-right font-bold text-xs tabular-nums text-black">{fmt(totalAmount)}</td>
      </tr>
    </tbody>
  );
}

function Sigs({ companyName, cls = 'border-t border-black', isInvoice = false }: { companyName?: string; cls?: string; isInvoice?: boolean }) {
  return (
    <div className="mt-20 sm:mt-24 pt-2 break-inside-avoid text-black">
      <div className="flex justify-between items-end">
        <div className="text-center w-[150px]">
          <div className={`${cls} pt-2`}>
            <p className="font-bold text-[10px] sm:text-[10.5px] uppercase tracking-wider text-black whitespace-nowrap">
              {isInvoice ? "Customer's Signature" : "Received Signature"}
            </p>
          </div>
        </div>
        <div className="text-center w-[150px]">
          <div className={`${cls} pt-2`}>
            <p className="font-bold text-[10px] sm:text-[10.5px] uppercase tracking-wider text-black whitespace-nowrap">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRight({ a, p, e, w, cls = '' }: { a: string; p: string; e?: string; w?: string; cls?: string }) {
  if (!a && !p && !e && !w) return null;
  return (
    <div className={`text-right text-[11px] leading-[1.6] flex-shrink-0 max-w-[280px] text-black ${cls}`}>
      {a && <p className="font-bold text-black leading-snug mb-1">{a}</p>}
      <div className="space-y-0.5 text-black font-medium">
        {p && <p><span className="font-bold text-black">Phone:</span> {p}</p>}
        {e && <p><span className="font-bold text-black">Email:</span> {e}</p>}
        {w && <p><span className="font-bold text-black">Web:</span> {w}</p>}
      </div>
    </div>
  );
}

function ToBlock({ q, cls = '' }: { q: Quotation; cls?: string }) {
  const isInvoice = q.docType === 'Invoice';
  const isCompanyBold = q.boldClientCompany !== false;
  return (
    <div className={`space-y-0.5 text-black ${cls}`}>
      <p className="font-bold text-black text-xs">{isInvoice ? 'Bill To :' : 'To,'}</p>
      {q.clientDesignation && (
        <p className="text-xs text-black font-medium">
          {isInvoice ? `Attn: ${q.clientDesignation}` : q.clientDesignation}
        </p>
      )}
      <p className={`text-xs tracking-wide text-black ${isCompanyBold ? 'font-bold' : 'font-medium'}`}>{q.clientCompany}</p>
      {q.clientAddress && <p className="text-xs text-black font-medium">{q.clientAddress}</p>}
    </div>
  );
}

function DateRef({ q, cls = '' }: { q: Quotation; cls?: string }) {
  return (
    <div className={`text-right flex-shrink-0 text-xs text-black ${cls}`}>
      <p><span className="font-bold text-black">Date :</span> <span className="tabular-nums font-semibold text-black">{q.date}</span></p>
    </div>
  );
}

function Terms({ q }: { q: Quotation }) {
  if (q.showTerms === false || !q.terms?.length) return null;
  const isInvoice = q.docType === 'Invoice';
  return (
    <div className="text-[11px] mt-4 mb-2 break-inside-avoid text-black">
      <p className="font-bold underline underline-offset-2 mb-1.5 text-xs text-black">
        {isInvoice ? 'Payment Terms & Notes:' : 'Terms & Condition:'}
      </p>
      <div className="space-y-1 leading-relaxed text-black font-medium">{q.terms.map((t, i) => <p key={i}>{t}</p>)}</div>
    </div>
  );
}

// ── Template 1: Classic (Default) ─────────────────────────────────────────────
function TplClassic({ quotation: q, companyName, companyTagline, companyAddress, companyPhone, companyEmail, companyWebsite, companyNameColor }: TplProps) {
  const brandColor = q.companyNameColor || companyNameColor || '#dc2626';
  const isInvoice = q.docType === 'Invoice';
  const displaySubject = q.subject?.replace(/^[-–—]\s*/, '').trim();
  const showProjectDesc = isInvoice && displaySubject && !displaySubject.toLowerCase().includes('price offer');

  return (
    <div className="px-8 pt-7 pb-8 sm:px-12 sm:pt-10 sm:pb-10 print:p-0 print:w-full text-[11px] text-black w-full box-border">
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[26px] font-black tracking-tight leading-none mb-1" style={{ color: brandColor }}>{companyName}</h1>
          <p className="text-[11px] font-medium italic text-black">{companyTagline}</p>
        </div>
        <ContactRight a={companyAddress} p={companyPhone} e={companyEmail} w={companyWebsite} />
      </div>
      <div className="text-center mb-5">
        <h2 className="text-lg sm:text-[19px] font-bold text-black tracking-wider uppercase underline underline-offset-4 decoration-1 decoration-neutral-400">{q.docType}</h2>
      </div>
      <div className="flex justify-between items-start gap-4 mb-4"><ToBlock q={q} /><DateRef q={q} /></div>

      {!isInvoice ? (
        <>
          {displaySubject && (
            <div className="mb-4"><p className="font-bold text-xs text-black">Sub: {displaySubject}</p></div>
          )}
          {q.salutation && (
            <div className="mb-5">
              <p className="font-bold text-xs text-black mb-1">{q.salutation}</p>
              {q.openingText && <p className="text-left text-xs leading-relaxed text-black font-medium">{q.openingText}</p>}
            </div>
          )}
        </>
      ) : showProjectDesc ? (
        <div className="mb-4">
          <p className="text-xs text-black font-medium"><span className="font-bold text-black">Project / Description:</span> {displaySubject}</p>
        </div>
      ) : null}

      <div className="mb-5">
        <table className="w-full border-collapse border border-black text-[10.5px]">
          <thead>
            {isInvoice ? (
              <tr className="border-b border-black text-black font-bold text-[11px]">
                <th className="border-r border-black px-2 py-2 w-10 text-center">SL.</th>
                <th className="border-r border-black px-2.5 py-2 text-left">Description of Goods / Services</th>
                <th className="border-r border-black px-2 py-2 w-[86px] text-right leading-snug">Unit Price<br/>(BDT)</th>
                <th className="border-r border-black px-2 py-2 w-16 text-center">Qty</th>
                <th className="px-2 py-2 w-[90px] text-right leading-snug">Amount<br/>(BDT)</th>
              </tr>
            ) : (
              <tr className="border-b border-black text-black font-bold text-[11px]">
                <th className="border-r border-black px-2 py-2 w-10 text-center">SL.</th>
                <th className="border-r border-black px-2.5 py-2 text-left">Particulars</th>
                <th className="border-r border-black px-2 py-2 w-[76px] text-right leading-snug">List Unit<br/>Price</th>
                <th className="border-r border-black px-2 py-2 w-[80px] text-right leading-snug">After<br/>Discount<br/>Price</th>
                <th className="border-r border-black px-2 py-2 w-14 text-center">Qty</th>
                <th className="px-2 py-2 w-[84px] text-right leading-snug">Amount<br/>(BDT)</th>
              </tr>
            )}
          </thead>
          <TableBody items={q.items} totalQty={q.totalQty} totalAmount={q.totalAmount} isInvoice={isInvoice} />
        </table>
      </div>
      <div className="mb-5 text-xs text-black"><p><span className="font-bold text-black">In Word Taka : </span><span className="font-semibold text-black">{q.inWords}</span></p></div>
      <Terms q={q} />
      <Sigs companyName={companyName} isInvoice={isInvoice} />
    </div>
  );
}

// ── Template 2: Formal ────────────────────────────────────────────────────────
function TplFormal({ quotation: q, companyName, companyTagline, companyAddress, companyPhone, companyEmail, companyWebsite, companyNameColor }: TplProps) {
  const brandColor = q.companyNameColor || companyNameColor || '#dc2626';
  const isInvoice = q.docType === 'Invoice';
  const displaySubject = q.subject?.replace(/^[-–—]\s*/, '').trim();
  const showProjectDesc = isInvoice && displaySubject && !displaySubject.toLowerCase().includes('price offer');

  return (
    <div className="px-8 pt-7 pb-8 sm:px-12 sm:pt-10 sm:pb-10 print:p-0 print:w-full text-[11px] text-black w-full box-border">
      <div className="text-center mb-4 pb-3 border-b border-black">
        <h1 className="text-[26px] font-black tracking-tight leading-none mb-1" style={{ color: brandColor }}>{companyName}</h1>
        <p className="text-xs font-semibold text-black mt-0.5">{companyTagline}</p>
        {companyAddress && (
          <p className="text-[11px] font-bold text-black mt-1.5">{companyAddress}</p>
        )}
        {(companyPhone || companyEmail || companyWebsite) && (
          <p className="text-[10.5px] text-black mt-0.5 font-semibold">
            {[companyPhone && `Phone: ${companyPhone}`, companyEmail && `Email: ${companyEmail}`, companyWebsite && `Web: ${companyWebsite}`].filter(Boolean).join('  |  ')}
          </p>
        )}
      </div>
      <div className="text-center my-4">
        <h2 className="text-lg sm:text-[19px] font-bold text-black tracking-wider uppercase underline underline-offset-4 decoration-1 decoration-neutral-400">{q.docType}</h2>
      </div>
      <div className="flex justify-between items-start mb-4"><ToBlock q={q} /><DateRef q={q} /></div>

      {!isInvoice ? (
        <>
          {displaySubject && (
            <div className="mb-3"><p className="font-bold text-xs text-black">Sub: {displaySubject}</p></div>
          )}
          {q.salutation && (
            <div className="mb-4">
              <p className="font-bold text-xs text-black mb-1">{q.salutation}</p>
              {q.openingText && <p className="text-left text-xs leading-relaxed text-black font-medium">{q.openingText}</p>}
            </div>
          )}
        </>
      ) : showProjectDesc ? (
        <div className="mb-3">
          <p className="text-xs text-black font-medium"><span className="font-bold text-black">Project / Description:</span> {displaySubject}</p>
        </div>
      ) : null}

      <div className="mb-4">
        <table className="w-full border-collapse border border-black text-[10.5px]">
          <thead>
            {isInvoice ? (
              <tr className="border-b border-black text-black font-bold text-[11px]">
                <th className="border-r border-black px-2 py-2 w-10 text-center">SL.No</th>
                <th className="border-r border-black px-2.5 py-2 text-left">Description of Goods / Services</th>
                <th className="border-r border-black px-2 py-2 w-[86px] text-right leading-snug">Unit Price<br/>(BDT)</th>
                <th className="border-r border-black px-2 py-2 w-16 text-center">Qty</th>
                <th className="px-2 py-2 w-[90px] text-right leading-snug">Amount<br/>(BDT)</th>
              </tr>
            ) : (
              <tr className="border-b border-black text-black font-bold text-[11px]">
                <th className="border-r border-black px-2 py-2 w-10 text-center">SL.No</th>
                <th className="border-r border-black px-2.5 py-2 text-left">Particulars</th>
                <th className="border-r border-black px-2 py-2 w-[76px] text-right leading-snug">List Unit<br/>Price</th>
                <th className="border-r border-black px-2 py-2 w-[80px] text-right leading-snug">After<br/>Discount<br/>Price</th>
                <th className="border-r border-black px-2 py-2 w-14 text-center">Qty</th>
                <th className="px-2 py-2 w-[84px] text-right leading-snug">Amount<br/>(BDT)</th>
              </tr>
            )}
          </thead>
          <TableBody items={q.items} totalQty={q.totalQty} totalAmount={q.totalAmount} isInvoice={isInvoice} />
        </table>
      </div>
      <div className="mb-4 text-xs text-black"><p><span className="font-bold text-black">In Word Taka : </span><span className="font-semibold text-black">{q.inWords}</span></p></div>
      <Terms q={q} />
      <Sigs companyName={companyName} isInvoice={isInvoice} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuotationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<TemplateId>('classic');
  const [showPicker, setShowPicker] = useState(false);

  // Restore saved template preference
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as TemplateId | null;
    if (saved && TEMPLATES.some(t => t.id === saved)) {
      setTemplate(saved);
    } else {
      setTemplate('classic');
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [qRes, sRes] = await Promise.all([
          fetch(`/api/quotations/${resolvedParams.id}`),
          fetch('/api/settings'),
        ]);
        if (qRes.ok) setQuotation(await qRes.json());
        if (sRes.ok) setSettings(await sRes.json());
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  const pickTemplate = (id: TemplateId) => {
    setTemplate(id);
    localStorage.setItem(LS_KEY, id);
    setShowPicker(false);
  };

  const handlePrint = () => window.print();

  const handleDelete = async () => {
    if (!confirm('Delete this quotation?')) return;
    try {
      const res = await fetch(`/api/quotations/${resolvedParams.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/quotations');
    } catch {
      showToast('Failed to delete.', 'error');
    }
  };

  const handleUpdateStatus = async (newStatus: Quotation['status']) => {
    if (!quotation) return;
    try {
      const res = await fetch(`/api/quotations/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quotation, status: newStatus }),
      });
      if (res.ok) setQuotation({ ...quotation, status: newStatus });
    } catch (err) { console.error(err); }
  };

  const handleToggleTerms = async () => {
    if (!quotation) return;
    const updated: Quotation = { ...quotation, showTerms: quotation.showTerms === false };
    setQuotation(updated);
    try {
      await fetch(`/api/quotations/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) { console.error(err); }
  };

  const handleToggleBoldCompany = async () => {
    if (!quotation) return;
    const updated: Quotation = { ...quotation, boldClientCompany: quotation.boldClientCompany === false };
    setQuotation(updated);
    try {
      await fetch(`/api/quotations/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-medium">Loading document...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Quotation Not Found</h2>
        <Link href="/quotations" className="text-blue-600 hover:underline text-sm font-medium">Return to List</Link>
      </div>
    );
  }

  const companyName    = settings?.name    || 'EMA Engineering';
  const companyTagline = settings?.tagline || 'The power you can trust!';
  const companyAddress = quotation.companyAddress || settings?.address || '';
  const companyPhone   = settings?.showPhone   !== false ? (settings?.phone   || '') : '';
  const companyEmail   = settings?.showEmail   !== false ? (settings?.email   || '') : '';
  const companyWebsite = settings?.showWebsite !== false ? (settings?.website || '') : '';
  const companyNameColor = quotation.companyNameColor || settings?.companyNameColor || '#dc2626';

  const tplProps: TplProps = { quotation, companyName, companyTagline, companyAddress, companyPhone, companyEmail, companyWebsite, companyNameColor };
  const activeTpl = TEMPLATES.find(t => t.id === template)!;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 print:min-h-0 print:py-0 print:px-0 print:bg-white print:m-0 print:w-full">

      {/* Action Bar — screen only ────────────────────────────────────────── */}
      <div className="no-print max-w-[210mm] mx-auto mb-5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">

        {/* Main row */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:px-5">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Link href="/quotations" className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm tabular-nums">{quotation.quoteNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${STATUS_CLS[quotation.status] || STATUS_CLS.Draft}`}>
                  {quotation.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{quotation.date}</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Terms toggle */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <span className="text-xs font-semibold text-slate-600">Terms</span>
              <button
                type="button"
                onClick={handleToggleTerms}
                className={`relative inline-flex h-5 w-8 items-center rounded-full transition-colors focus:outline-none ${
                  quotation.showTerms !== false ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  quotation.showTerms !== false ? 'translate-x-3.5' : 'translate-x-0.5'
                }`} />
              </button>
              <span className={`text-[11px] font-bold ${quotation.showTerms !== false ? 'text-blue-700' : 'text-slate-400'}`}>
                {quotation.showTerms !== false ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Bold Client Company toggle */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <span className="text-xs font-semibold text-slate-600">Bold Company</span>
              <button
                type="button"
                onClick={handleToggleBoldCompany}
                className={`relative inline-flex h-5 w-8 items-center rounded-full transition-colors focus:outline-none ${
                  quotation.boldClientCompany !== false ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  quotation.boldClientCompany !== false ? 'translate-x-3.5' : 'translate-x-0.5'
                }`} />
              </button>
              <span className={`text-[11px] font-bold ${quotation.boldClientCompany !== false ? 'text-blue-700' : 'text-slate-400'}`}>
                {quotation.boldClientCompany !== false ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Status */}
            <select
              value={quotation.status}
              onChange={e => handleUpdateStatus(e.target.value as Quotation['status'])}
              className="text-xs bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>

            {/* Template selector toggle */}
            <button
              onClick={() => setShowPicker(p => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showPicker
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{activeTpl.name}</span>
            </button>

            <button onClick={handleDelete} className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>

            <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-xs transition-all">
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Template picker panel */}
        {showPicker && (
          <div className="border-t border-slate-100 px-4 py-3 sm:px-5 bg-slate-50/70">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Choose Template</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => pickTemplate(t.id)}
                  className={`flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all ${
                    template === t.id ? 'border-violet-500 bg-violet-50 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{background: t.accent}} />
                    <span className={`text-xs font-bold ${template === t.id ? 'text-violet-700' : 'text-slate-800'}`}>{t.name}</span>
                    {template === t.id && <span className="text-[9px] font-black text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">Active</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile scroll hint - screen only */}
      <div className="no-print sm:hidden flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2">
        <span className="inline-block px-2.5 py-1 bg-white border border-slate-200/80 rounded-full shadow-2xs">
          ↔ Swipe sideways to view full A4 document
        </span>
      </div>

      {/* Printable A4 document with mobile horizontal scroll wrapper */}
      <div className="w-full overflow-x-auto pb-6 -mx-3 sm:mx-auto px-3 sm:px-0 print:overflow-visible print:p-0 print:m-0 print:w-full">
        <div className="print-area min-w-[680px] sm:min-w-0 max-w-[210mm] mx-auto bg-white text-black shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-slate-200/60 rounded-sm font-sans print:border-none print:shadow-none print:rounded-none print:overflow-visible print:max-w-none print:w-full print:m-0 print:min-w-0">
          {template === 'classic' && <TplClassic {...tplProps} />}
          {template === 'formal'  && <TplFormal  {...tplProps} />}
        </div>
      </div>

    </div>
  );
}
