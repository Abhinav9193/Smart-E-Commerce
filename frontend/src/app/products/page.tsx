'use client';

import { useState, useEffect } from 'react';
import { productApi, categoryApi, cartApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  rating: number;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  productCount: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const { user } = useAuth();
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, sortBy, sortDir]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      let data;
      if (selectedCategory) {
        data = await productApi.getByCategory(selectedCategory, page, 20);
      } else {
        data = await productApi.getAll(page, 20, sortBy, sortDir);
      }
      setProducts(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }
    setLoading(true);
    try {
      const data = await productApi.search(searchQuery, 0, 20);
      setProducts(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) return;
    try {
      await cartApi.addItem(user.token, productId, 1);
      setAddedProducts(prev => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedProducts(prev => {
          const s = new Set(prev);
          s.delete(productId);
          return s;
        });
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          The <span className="italic font-serif text-rose-500">Collection.</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-xl">
          Explore our hand-picked ecosystem of professional equipment, accessories, and tools.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="classy-card p-6 mb-12">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[250px] flex gap-3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by keywords..."
              className="input-field !rounded-none !pl-12 !py-3 w-full"
              id="product-search"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">⌕</div>
            <button onClick={handleSearch} className="bg-black text-white px-8 font-semibold hover:bg-rose-500 transition-colors hidden sm:block">
              Search
            </button>
          </div>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split('-');
              setSortBy(by);
              setSortDir(dir);
              setPage(0);
            }}
            className="input-field !w-auto !rounded-none font-medium"
          >
            <option value="id-asc">Sorted by Featured</option>
            <option value="price-asc">Price: Ascending</option>
            <option value="price-desc">Price: Descending</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="name-asc">Alphabetical</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => { setSelectedCategory(null); setPage(0); }}
            className={`text-sm font-semibold px-6 py-2 transition-all ${
              !selectedCategory
                ? 'bg-black text-white'
                : 'bg-white border text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          {(categories || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
              className={`text-sm font-semibold px-5 py-2 transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-white border text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.name} 
              <span className={`text-[10px] px-2 py-0.5 rounded-none ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {cat.productCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="classy-card overflow-hidden animate-pulse">
              <div className="h-64 bg-slate-100"></div>
              <div className="p-6 space-y-4">
                <div className="h-5 bg-slate-100 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
                <div className="h-8 bg-slate-100 rounded-lg w-1/3 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {(products || []).map((product) => (
            <div key={product.id} className="product-card group">
              <Link href={`/products/${product.id}`}>
                <div className="relative h-64 overflow-hidden bg-slate-50 p-6 flex items-center justify-center">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white shadow-sm text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {product.categoryName}
                    </span>
                  </div>
                  {product.rating && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white shadow-sm">
                      <span className="text-amber-500 text-xs">★</span>
                      <span className="text-xs text-slate-800 font-bold">{product.rating}</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-6">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-1 text-lg group-hover:text-rose-500 transition-colors w-full">{product.name}</h3>
                </Link>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">₹{product.price.toLocaleString()}</span>
                  {user && (
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className={`font-semibold text-sm px-6 py-2.5 transition-all outline-none ${
                        addedProducts.has(product.id)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-black text-white hover:bg-rose-500'
                      }`}
                    >
                      {addedProducts.has(product.id) ? '✓ Added' : 'Add 🛒'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-16 pb-8">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="btn-secondary !py-3 !px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <div className="px-6 py-2 bg-white border border-slate-200 text-sm font-semibold text-slate-600">
            {page + 1} <span className="text-slate-400 font-normal">of</span> {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary !py-3 !px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
