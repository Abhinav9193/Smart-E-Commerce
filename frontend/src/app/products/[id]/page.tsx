'use client';

import { useState, useEffect, use } from 'react';
import { productApi, cartApi } from '@/lib/api';
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
  categoryId: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productApi.getById(Number(id));
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user || !product) return;
    setAdding(true);
    try {
      await cartApi.addItem(user.token, product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="classy-card p-4 animate-pulse !bg-white">
          <div className="grid md:grid-cols-2 gap-12 p-8">
            <div className="h-[500px] bg-slate-100"></div>
            <div className="space-y-6 pt-8">
              <div className="h-6 bg-slate-100 w-1/4"></div>
              <div className="h-10 bg-slate-100 w-3/4"></div>
              <div className="h-24 bg-slate-100 w-full"></div>
              <div className="h-12 bg-slate-100 w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-4xl font-black text-slate-900 mb-6">Item Unavailable</h1>
        <Link href="/products" className="btn-primary !px-8">Browse Collection</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm mb-8 bg-white border border-slate-200 px-4 py-2">
        ← Back to Catalog
      </Link>

      <div className="classy-card p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative overflow-hidden bg-white border border-slate-100 p-8 flex items-center justify-center min-h-[400px]">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center py-6 pr-4">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                {product.categoryName}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xl ${i < Math.round(product.rating) ? 'text-amber-500' : 'text-slate-200'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1">{product.rating.toFixed(1)} / 5</span>
              </div>
            )}

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-10">
              <div className="text-5xl font-black text-slate-900 tracking-tight mb-3">
                ₹{product.price.toLocaleString()}
              </div>
              <div>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                    <span className="w-2 h-2 bg-emerald-500"></span>
                    Available ({product.stock} units left)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-sm font-semibold border border-rose-200">
                    <span className="w-2 h-2 bg-rose-500"></span>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {user && product.stock > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto border-t border-slate-100 pt-8">
                <div className="flex items-center bg-white border border-slate-200 p-1 w-full sm:w-auto h-14">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition text-xl"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-slate-900 font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition text-xl"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`flex-1 w-full h-14 !rounded-none text-lg font-bold transition-all ${
                    added ? 'bg-emerald-500 text-white border-none' : 'bg-black text-white hover:bg-rose-500 border-none'
                  }`}
                  id="add-to-cart-btn"
                >
                  {adding ? 'Processing...' : added ? '✓ Secured in Cart' : 'Add to Cart 🛒'}
                </button>
              </div>
            )}

            {!user && (
              <div className="mt-8 border-t border-slate-100 pt-8">
                <Link href="/login" className="btn-primary w-full !py-4 text-lg justify-center shadow-md">
                  Verify Identity to Purchase ↗
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
