'use client';

import { useState, useEffect } from 'react';
import { cartApi, orderApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Cart {
  id: number;
  totalPrice: number;
  items: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) loadCart();
    else setLoading(false);
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    try {
      const data = await cartApi.get(user.token);
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;
    try {
      const data = await cartApi.updateItem(user.token, productId, quantity);
      setCart(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const removeItem = async (productId: number) => {
    if (!user) return;
    try {
      const data = await cartApi.removeItem(user.token, productId);
      setCart(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setCheckingOut(true);
    try {
      const order = await orderApi.place(user.token, address || undefined);
      router.push(`/checkout/${order.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="classy-card p-12">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Authentication Required</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Please identify yourself to access your personal collection cart.</p>
          <Link href="/login" className="btn-primary !px-10 !py-4 text-lg">Access Portal ↗</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="classy-card p-8 animate-pulse space-y-6 bg-white border border-slate-100">
          <div className="h-10 bg-slate-100 w-1/4 mb-10"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-6 border-b border-slate-100 pb-6">
              <div className="w-24 h-24 bg-slate-100"></div>
              <div className="flex-1 space-y-4 py-2">
                <div className="h-5 bg-slate-100 w-1/3"></div>
                <div className="h-4 bg-slate-100 w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const gstRate = 18;
  const subtotal = cart?.totalPrice || 0;
  const gstAmount = subtotal * (gstRate / 100);
  const total = subtotal + gstAmount;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Shopping <span className="text-rose-500 italic font-serif">Cart.</span>
        </h1>
      </div>

      {!cart || (cart.items?.length || 0) === 0 ? (
        <div className="classy-card p-16 text-center bg-white border border-slate-200">
          <div className="w-24 h-24 bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <span className="text-5xl text-slate-300">⚑</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-8 text-lg">Build a new ecosystem on our homepage.</p>
          <Link href="/" className="btn-primary !py-4 transition-transform">Browse Curations ↗</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {(cart.items || []).map((item) => (
              <div key={item.id} className="classy-card p-6 flex flex-col sm:flex-row gap-6 bg-white border border-slate-200 relative group overflow-hidden">
                <div className="bg-white p-4 flex-shrink-0 w-32 h-32 flex items-center justify-center border border-slate-100">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={item.productName}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                
                <div className="flex-1 flex flex-col pt-2">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <Link href={`/products/${item.productId}`} className="pr-8">
                      <h3 className="text-lg font-bold text-slate-900 hover:text-rose-500 transition-colors leading-snug">{item.productName}</h3>
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-300 hover:text-rose-500 transition-colors absolute top-6 right-6 p-2 bg-slate-50 border border-slate-100"
                      title="Remove Item"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-500 mb-6 font-mono">₹{item.productPrice.toLocaleString()}</p>

                  <div className="flex items-center justify-between mt-auto border-t border-slate-100 pt-4">
                    <div className="flex items-center bg-white border border-slate-200 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition font-serif"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-slate-900 font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition font-serif"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xl font-black text-slate-900 tracking-tight">₹{item.subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="classy-card p-8 sticky top-28 border border-slate-100 bg-white">
              <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight uppercase text-xs tracking-widest border-b border-slate-100 pb-4">
                Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal <span className="text-slate-400 font-normal">({(cart.items || []).length} items)</span></span>
                  <span className="text-slate-900 font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Estimated Tax <span className="text-slate-400 font-normal">({gstRate}%)</span></span>
                  <span className="text-slate-900 font-bold">₹{gstAmount.toFixed(2)}</span>
                </div>
                
                <div className="border-t-2 border-slate-900 pt-6 mt-6 flex justify-between items-center">
                  <span className="text-slate-900 font-black uppercase text-sm tracking-widest">Total</span>
                  <span className="text-3xl font-black text-rose-500 tracking-tight">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn-primary w-full justify-center !py-4"
                  id="proceed-checkout-btn"
                >
                  Secure Checkout ↗
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in-up bg-white p-6 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Shipping Information</h3>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full delivery address..."
                    className="input-field bg-slate-50 resize-none"
                    rows={3}
                    id="shipping-address"
                  />
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setShowCheckout(false)} className="btn-secondary flex-1 border border-slate-200">Cancel</button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={checkingOut}
                      className="bg-black text-white font-bold flex-1 hover:bg-rose-500 transition-colors disabled:opacity-50 h-12"
                      id="place-order-btn"
                    >
                      {checkingOut ? 'Ordering...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
               <span>🔒</span> Secure 256-bit encryption
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
