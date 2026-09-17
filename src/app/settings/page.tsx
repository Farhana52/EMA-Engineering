'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, Plus, Trash2, Phone, MapPin, Palette } from 'lucide-react';
import { CompanySettings } from '@/types/invoice';
import { useToast } from '@/components/Toast';

const COLOR_PRESETS = [
  { label: 'Red (Default)', color: '#dc2626' },
  { label: 'Navy', color: '#1e3a8a' },
  { label: 'Blue', color: '#2563eb' },
  { label: 'Emerald', color: '#059669' },
  { label: 'Slate', color: '#0f172a' },
  { label: 'Violet', color: '#7c3aed' },
  { label: 'Amber', color: '#d97706' },
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<CompanySettings>({
    name: 'EMA Engineering',
    tagline: 'The power you can trust!',
    address: 'Dhaka, Bangladesh',
    phone: '+880 1700-000000',
    showPhone: true,
    showAddress: true,
    companyNameColor: '#dc2626',
    defaultTerms: [
      '01) Our offer will remain valid for a period of 15 days from the date of this offer.',
      '02) 100% cash/PO/Cheque as an advance before delivery.',
      '03) VAT encluded the above-mentioned price value and AIT as per Govt. rule.'
    ]
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            ...data,
            showPhone: data.showPhone !== undefined ? data.showPhone : true,
            showAddress: data.showAddress !== undefined ? data.showAddress : true,
          });
        }
      } catch (err: unknown) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleTermChange = (index: number, val: string) => {
    const updated = [...settings.defaultTerms];
    updated[index] = val;
    setSettings({ ...settings, defaultTerms: updated });
  };

  const handleAddTerm = () => {
    const nextIndex = (settings.defaultTerms.length + 1).toString().padStart(2, '0');
    setSettings({
      ...settings,
      defaultTerms: [...settings.defaultTerms, `${nextIndex}) `]
    });
  };

  const handleRemoveTerm = (index: number) => {
    const updated = settings.defaultTerms.filter((_, i) => i !== index);
    setSettings({ ...settings, defaultTerms: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        showToast('Company settings saved successfully!', 'success');
        window.dispatchEvent(new Event('companySettingsUpdated'));
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save settings', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection error';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-medium">Loading company configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex items-center space-x-3.5 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-xs">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Company Profile & Settings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage company branding, contact details, and document visibility options saved in MongoDB.
          </p>
        </div>
      </div>



      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Company Identity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Company Identity & Branding
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear as the prominent letterhead on top of every quotation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="e.g. EMA Engineering"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Appears as the primary bold red header on quotations.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                Company Tagline / Sub-heading
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="e.g. The power you can trust!"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 shadow-xs transition-all outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Sub-heading right under the company name.</p>
            </div>

            <div className="md:col-span-2 pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 tracking-tight">
                    Default Company Name Color (Letterhead)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Default color applied to your company letterhead header on quotations.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 self-start sm:self-auto shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preview:</span>
                  <span className="text-sm font-black tracking-tight leading-none" style={{ color: settings.companyNameColor || '#dc2626' }}>
                    {settings.name || 'EMA Engineering'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((p) => {
                  const isSelected = (settings.companyNameColor || '#dc2626').toLowerCase() === p.color.toLowerCase();
                  return (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setSettings({ ...settings, companyNameColor: p.color })}
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

                <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2 py-1 transition-all">
                  <label
                    title="Pick custom color"
                    className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600"
                  >
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs flex-shrink-0"
                      style={{ backgroundColor: settings.companyNameColor || '#dc2626' }}
                    />
                    <input
                      type="color"
                      value={(settings.companyNameColor?.startsWith('#') && settings.companyNameColor.length === 7) ? settings.companyNameColor : '#dc2626'}
                      onChange={(e) => setSettings({ ...settings, companyNameColor: e.target.value })}
                      className="sr-only"
                    />
                  </label>
                  <input
                    type="text"
                    value={settings.companyNameColor || '#dc2626'}
                    onChange={(e) => setSettings({ ...settings, companyNameColor: e.target.value })}
                    placeholder="#dc2626"
                    maxLength={7}
                    className="w-18 text-xs font-mono font-semibold text-slate-800 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information & Document Visibility Controls */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Contact Details & Document Footer Visibility
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control whether Phone or Office Address are printed on your quotation documents. Toggle ON/OFF as needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone Number Field + Toggle */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-bold text-slate-800 tracking-tight">
                    Phone Number
                  </label>
                </div>
                {/* Toggle Button */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Show on PDF:</span>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, showPhone: !settings.showPhone })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      settings.showPhone !== false ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    title={settings.showPhone !== false ? 'Phone is visible on PDF' : 'Phone is hidden from PDF'}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                        settings.showPhone !== false ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${settings.showPhone !== false ? 'text-blue-700' : 'text-slate-400'}`}>
                    {settings.showPhone !== false ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="e.g. +880 1700-000000"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 shadow-xs transition-all outline-none"
              />
            </div>

            {/* Office Address Field + Toggle */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-bold text-slate-800 tracking-tight">
                    Office Address
                  </label>
                </div>
                {/* Toggle Button */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Show on PDF:</span>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, showAddress: !settings.showAddress })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      settings.showAddress !== false ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    title={settings.showAddress !== false ? 'Address is visible on PDF' : 'Address is hidden from PDF'}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                        settings.showAddress !== false ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${settings.showAddress !== false ? 'text-blue-700' : 'text-slate-400'}`}>
                    {settings.showAddress !== false ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="e.g. House 12, Road 4, Sector 7, Uttara, Dhaka"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 shadow-xs transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Default Terms & Conditions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Default Terms & Conditions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These clauses will be loaded automatically into every newly drafted quotation.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddTerm}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Clause</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {settings.defaultTerms.map((term, index) => (
              <div key={index} className="flex items-center space-x-2.5">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => handleTermChange(index, e.target.value)}
                  className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium shadow-xs transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(index)}
                  className="p-2 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove Clause"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
