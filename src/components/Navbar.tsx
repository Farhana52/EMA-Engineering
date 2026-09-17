'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Package,
  Settings,
  Plus,
  LayoutDashboard,
  Menu,
  X,
  Building2
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [company, setCompany] = useState({
    name: 'EMA Engineering',
    tagline: 'The power you can trust!'
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.name) {
          setCompany({
            name: data.name,
            tagline: data.tagline || 'Commercial Billing'
          });
        }
      }
    } catch (e) {
      console.error('Failed to load settings in navbar:', e);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };

    window.addEventListener('companySettingsUpdated', handleUpdate);
    return () => {
      window.removeEventListener('companySettingsUpdated', handleUpdate);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Derive monogram for logo badge
  const initials = company.name
    ? company.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'EM';

  return (
    <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand / Logo */}
        <div className="flex items-center space-x-6 lg:space-x-8 min-w-0">
          <Link href="/" className="flex items-center space-x-3 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white font-extrabold text-sm tracking-tight flex-shrink-0 group-hover:from-blue-700 group-hover:to-indigo-700 transition-all">
              {initials || <Building2 className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 block leading-tight truncate max-w-[170px] sm:max-w-xs group-hover:text-blue-600 transition-colors">
                {company.name}
              </span>
              <span className="block text-[10px] text-blue-600 font-bold tracking-wider uppercase truncate max-w-[170px] sm:max-w-xs">
                {company.tagline || 'Commercial Billing'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Link
            href="/quotations/new"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Quotation</span>
            <span className="inline sm:hidden">New</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
