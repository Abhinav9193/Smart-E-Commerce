'use client';

import { useState } from 'react';
import { bundleApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { cartApi } from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  rating: number;
}

interface BundleResult {
  detectedIntent: string;
  budget: number | null;
  totalPrice: number;
  products: Product[];
  summary: string;
  detectedKeywords: string[];
}

export default function Home() {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [bundle, setBundle] = useState<BundleResult | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setLoading(true);
    setBundle(null);
    setCartMessage('');

    try {
      const result = await bundleApi.generate(problem);
      setBundle(result);
    } catch (err: any) {
      alert(err.message || 'Failed to generate bundle');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundleToCart = async () => {
    if (!user || !bundle) return;
    setAddingToCart(true);
    try {
      const productIds = bundle.products.map(p => p.id);
      await cartApi.addBundle(user.token, productIds);
      setCartMessage('Bundle added successfully! ✦');
    } catch (err: any) {
      setCartMessage(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const exampleQueries = [
    "Gaming setup under ₹70000",
    "Study desk setup for college",
    "Vlogging and YouTube kit under ₹40000",
    "Ergonomic WFH office setup",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-semibold mb-8">
            <span className="text-rose-500">✦</span> Smart Shopping Assistant
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] text-slate-900 tracking-tight">
            Describe your <span className="italic font-serif text-rose-500">vision.</span>
            <br />
            We build the <span className="underline decoration-4 decoration-rose-200 underline-offset-8">bundle.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium">
            Type out what you need organically. Our intelligent engine analyzes your intent and crafts the perfect curated collection.
          </p>

          {/* Problem Input */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-10 transition-transform focus-within:scale-[1.02]">
            <div className="bg-white p-3 flex flex-col md:flex-row gap-3 border border-slate-200">
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. 'I need a professional podcasting setup under ₹30000...'"
                className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-slate-800 placeholder-slate-400 text-lg md:text-xl font-medium"
                id="problem-input"
              />
              <button
                type="submit"
                disabled={loading || !problem.trim()}
                className="bg-black text-white hover:bg-rose-500 transition-colors text-lg px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                id="generate-bundle-btn"
              >
                {loading ? 'Curating... ✧' : 'Generate ↗'}
              </button>
            </div>
          </form>

          {/* Example Queries */}
          <div className="flex flex-wrap justify-center gap-3">
            {exampleQueries.map((query, i) => (
              <button
                key={i}
                onClick={() => setProblem(query)}
                className="text-sm font-medium px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Results */}
      {bundle && (
        <section className="max-w-7xl mx-auto px-4 pb-32 animate-fade-in-up">
          {/* Summary Card */}
          <div className="classy-card p-10 mb-12 relative overflow-hidden bg-black text-white border-0">
            <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl">✺</div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-4 py-2 bg-white/10 backdrop-blur text-white text-sm font-bold uppercase tracking-wider">
                  {bundle.detectedIntent}
                </span>
                {bundle.budget && (
                  <span className="px-4 py-2 bg-white/5 text-white text-sm font-semibold">
                    Budget: ₹{bundle.budget.toLocaleString()}
                  </span>
                )}
                <span className="px-4 py-2 bg-rose-500 text-white text-sm font-bold">
                  Total: ₹{bundle.totalPrice.toLocaleString()}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Your Curated Collection</h2>
              <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-4xl">{bundle.summary}</p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {(bundle.products || []).map((product, i) => (
              <div key={product.id} className="product-card group" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative h-64 overflow-hidden bg-slate-100 p-6 flex flex-col justify-end">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white shadow-sm text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {product.categoryName}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2 truncate text-lg group-hover:text-rose-500 transition-colors">{product.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                    <Link href={`/products/${product.id}`} className="w-10 h-10 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                      ↗
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Bundle to Cart */}
          {(bundle.products?.length || 0) > 0 && (
            <div className="flex flex-col items-center">
              {user ? (
                <div className="text-center">
                  <button
                    onClick={handleAddBundleToCart}
                    disabled={addingToCart}
                    className="btn-primary text-xl !px-12 !py-5"
                    id="add-bundle-to-cart-btn"
                  >
                     {addingToCart ? 'Adding... ⌚' : `Add Collection (₹${bundle.totalPrice.toLocaleString()})`}
                  </button>
                  {cartMessage && (
                    <p className="mt-4 text-sm font-semibold text-rose-500 bg-rose-50 px-4 py-2 border border-rose-100 inline-block">
                      {cartMessage}
                    </p>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary text-xl !px-12 !py-5">
                  Login to Purchase
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {/* Features Section */}
      {!bundle && (
        <section className="max-w-6xl mx-auto px-4 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⎈',
                title: 'Intelligent Parsing',
                desc: 'Understanding raw intent, budget constraints, and aesthetic preferences dynamically.',
              },
              {
                icon: '⧉',
                title: 'Bespoke Collections',
                desc: 'Products hand-curated and mathematically optimized to fit perfectly within your constraints.',
              },
              {
                icon: '◎',
                title: 'Frictionless',
                desc: 'One click to move your entire curated ecosystem directly into your cart for checkout.',
              },
            ].map((feature, i) => (
              <div key={i} className="classy-card p-10 relative overflow-hidden group">
                <div className="text-4xl text-slate-300 mb-6 group-hover:text-rose-500 transition-colors duration-500">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
