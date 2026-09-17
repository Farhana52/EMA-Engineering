'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit3, Search, X, Tag } from 'lucide-react';
import { Product } from '@/types/invoice';
import ParticularsRenderer from '@/components/ParticularsRenderer';
import Pagination from '@/components/Pagination';
import { useToast } from '@/components/Toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const { showToast } = useToast();

  // Unit defaults to 'pc' behind the scenes without prompting the user
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    defaultUnitPrice: number | string;
    unit: string;
  }>({
    name: '',
    description: '',
    defaultUnitPrice: '',
    unit: 'pc'
  });

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function initFetch() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    initFetch();
    return () => {
      ignore = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      defaultUnitPrice: '',
      unit: 'pc'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p._id || null);
    setFormData({
      name: p.name,
      description: p.description || '',
      defaultUnitPrice: p.defaultUnitPrice === 0 ? '' : p.defaultUnitPrice,
      unit: p.unit || 'pc'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        defaultUnitPrice: Number(formData.defaultUnitPrice) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(
          editingId ? 'Product updated successfully!' : 'Product added successfully!',
          'success'
        );
        setIsModalOpen(false);
        loadProducts();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save product', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product deleted successfully', 'success');
        loadProducts();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      showToast(msg, 'error');
    }
  };

  // Seed reference sample product if catalog is empty
  const seedSampleProduct = async () => {
    const sample = {
      name: 'Frequency Inverter Service Charge',
      description: `Capacity: 75Kw, 3phase, 440v\nSpear parts: Change Capacitor, Transistor, SMD, IGBT, Modulebus, Resistor, Terminal, Rectifier, Coupler with control card & power board service.`,
      defaultUnitPrice: 70000,
      unit: 'pc'
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });
      if (res.ok) {
        showToast('Sample product loaded from reference document!', 'success');
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Products & Services
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage items and multi-line technical particulars for quick quotation drafting.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {products.length === 0 && !loading && (
            <button
              onClick={seedSampleProduct}
              className="text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all border border-slate-200 shadow-xs"
            >
              Load Sample Item
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product / Service</span>
          </button>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name or technical specs..."
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end space-x-3 text-xs text-slate-500">
          <span className="font-medium">
            Showing <strong className="text-slate-900 font-semibold">{filteredProducts.length}</strong> of {products.length} items
          </span>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm font-medium">Loading catalog items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {searchTerm ? 'No matching products found' : 'No products in catalog'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {searchTerm
              ? 'Try changing your search terms or clear the search filter to see all items.'
              : 'Add products and technical specifications to easily insert them into quotations with one click.'}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Clear Search Filter
            </button>
          ) : (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Item</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-slate-200/80 hover:border-slate-300/90 rounded-2xl p-5.5 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <span className="px-3 py-1 rounded-xl bg-blue-50/90 border border-blue-200/70 text-blue-700 text-xs font-bold tabular-nums whitespace-nowrap shadow-2xs">
                      ৳ {product.defaultUnitPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {product.description ? (
                    <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 my-3">
                      <ParticularsRenderer text={product.description} />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic my-2">No specifications provided.</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
                  <div className="flex items-center text-[11px] text-slate-400 font-medium">
                    <Tag className="w-3 h-3 mr-1 text-slate-400" />
                    <span>Ready for Quotations</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(product)}
                      className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 rounded-lg transition-colors text-xs font-medium inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => product._id && handleDelete(product._id)}
                      className="px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium inline-flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 8, 12, 24]}
            itemName="products"
          />
        </div>
      )}

      {/* Modal for Add / Edit (Unit field removed per user requirement) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Product / Service' : 'Add New Product / Service'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                  Product / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Frequency Inverter Service"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                  Technical Specifications / Particulars
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Capacity: 75Kw, 3phase, 440v&#10;Spear parts: Change Capacitor, Transistor, IGBT..."
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed shadow-xs transition-all outline-none font-normal"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Line breaks will appear neatly inside the quotation particulars column.
                </p>
              </div>

              {/* Default Unit Price taking clean full width (Unit input removed) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight">
                  Default Unit Price (BDT ৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={formData.defaultUnitPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, defaultUnitPrice: val });
                    }}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 font-semibold tabular-nums shadow-xs transition-all outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default price can be overridden or discounted when preparing specific quotations.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
                >
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
