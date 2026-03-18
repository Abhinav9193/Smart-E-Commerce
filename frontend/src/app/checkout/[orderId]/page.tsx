'use client';

import { useState, useEffect, use } from 'react';
import { orderApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadOrder();
  }, [user]);

  const loadOrder = async () => {
    if (!user) return;
    try {
      const data = await orderApi.getById(user.token, Number(orderId));
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!user || !order) return;
    setConfirming(true);
    try {
      const updated = await orderApi.confirmPayment(user.token, order.id);
      setOrder(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!user || !order) return;
    try {
      const blob = await orderApi.downloadInvoice(user.token, order.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="classy-card p-12 animate-pulse space-y-6 bg-white shrink !rounded-none">
          <div className="h-10 bg-slate-100 w-1/3 mb-10"></div>
          <div className="h-64 bg-slate-50 w-full"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Invoice Not Found</h1>
        <Link href="/orders" className="btn-primary">Return to Orders</Link>
      </div>
    );
  }

  const isPending = order.status === 'PENDING';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {isPending ? 'Action Required' : 'Order Authorized'}
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          {isPending ? 'Please finalize your transaction.' : 'Your invoice has been generated.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Details Column */}
        <div className="classy-card p-8 md:p-10 border border-slate-200 bg-white order-2 md:order-1 relative overflow-hidden !rounded-none shadow-none">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 border-l border-b border-slate-100/50 -z-0"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10 border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice Reference</p>
              <h2 className="text-2xl font-black text-slate-900">#{order.orderNumber}</h2>
            </div>
            <span className={`status-badge px-4 py-2 text-xs font-bold tracking-widest uppercase border !rounded-none ${
              isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="space-y-6 mb-8 relative z-10">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="w-16 h-16 bg-white border border-slate-200 flex items-center justify-center p-2 flex-shrink-0 transition-all">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={item.productName}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-rose-500 transition-colors line-clamp-1">{item.productName}</p>
                  <p className="text-xs font-medium text-slate-500 font-mono mt-1">₹{item.priceAtPurchase.toLocaleString()} × {item.quantity}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 font-mono">₹{item.subtotal.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3 relative z-10 bg-slate-50/50 p-6">
            <div className="flex justify-between text-slate-600 text-sm font-medium">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900">₹{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-sm font-medium">
              <span>Tax ({order.gstRate}%)</span>
              <span className="font-mono text-slate-900">₹{order.gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-2">
              <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Final Total</span>
              <span className="text-2xl font-black text-rose-500 tracking-tight font-mono">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="order-1 md:order-2 flex flex-col gap-6">
          {/* Payment Section */}
          {isPending && (
             <div className="classy-card p-10 text-center bg-black text-white relative overflow-hidden border-none flex-1 flex flex-col justify-center !rounded-none">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl pointer-events-none">◎</div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-black mb-2 tracking-tight">Scan to Complete</h2>
                 <p className="text-slate-400 font-medium mb-8">Secure encrypted payment gateway</p>

                 <div className="inline-block p-4 bg-white border border-slate-200 mb-8 transform transition-transform hover:scale-105">
                   <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-90">
                     <rect width="200" height="200" fill="white"/>
                     <g fill="#0f172a">
                       <rect x="20" y="20" width="50" height="50"/>
                       <rect x="25" y="25" width="40" height="40" fill="white"/>
                       <rect x="30" y="30" width="30" height="30"/>
                       <rect x="130" y="20" width="50" height="50"/>
                       <rect x="135" y="25" width="40" height="40" fill="white"/>
                       <rect x="140" y="30" width="30" height="30"/>
                       <rect x="20" y="130" width="50" height="50"/>
                       <rect x="25" y="135" width="40" height="40" fill="white"/>
                       <rect x="30" y="140" width="30" height="30"/>
                       {/* Pattern noise */}
                       <rect x="90" y="20" width="10" height="10"/>
                       <rect x="110" y="20" width="10" height="10"/>
                       <rect x="90" y="40" width="10" height="10"/>
                       <rect x="110" y="40" width="10" height="10"/>
                       <rect x="90" y="60" width="30" height="10"/>
                       <rect x="90" y="90" width="40" height="10"/>
                       <rect x="20" y="90" width="10" height="10"/>
                       <rect x="40" y="90" width="10" height="10"/>
                       <rect x="60" y="90" width="10" height="10"/>
                       <rect x="140" y="90" width="10" height="10"/>
                       <rect x="160" y="90" width="10" height="10"/>
                       <rect x="90" y="110" width="10" height="10"/>
                       <rect x="110" y="110" width="10" height="10"/>
                       <rect x="130" y="110" width="10" height="10"/>
                       <rect x="150" y="110" width="30" height="10"/>
                       <rect x="90" y="130" width="30" height="10"/>
                       <rect x="130" y="140" width="50" height="40"/>
                       <rect x="135" y="145" width="40" height="30" fill="white"/>
                       <rect x="140" y="150" width="30" height="20"/>
                       <rect x="90" y="150" width="10" height="10"/>
                       <rect x="90" y="170" width="10" height="10"/>
                       <rect x="110" y="160" width="10" height="10"/>
                       <rect x="110" y="180" width="10" height="10"/>
                     </g>
                   </svg>
                 </div>

                 <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs font-bold">
                   Payable Amount <br/>
                   <span className="text-white font-black text-2xl tracking-normal font-mono mt-1 block">₹{order.totalAmount.toLocaleString()}</span>
                 </p>

                 <button
                   onClick={handleConfirmPayment}
                   disabled={confirming}
                   className="w-full bg-white text-black py-5 text-lg font-bold hover:bg-rose-500 hover:text-white transition-all transform hover:-translate-y-1 border-none !rounded-none"
                   id="confirm-payment-btn"
                 >
                   {confirming ? 'Authenticating...' : 'Confirm Transaction ↗'}
                 </button>
               </div>
             </div>
          )}

          {/* Confirmed State */}
          {!isPending && (
            <div className="classy-card p-10 text-center bg-emerald-50 border border-emerald-100 flex-1 flex flex-col justify-center !rounded-none">
              <div className="w-24 h-24 bg-white flex items-center justify-center mx-auto mb-6 text-4xl border border-emerald-100">
                ❖
              </div>
              <h2 className="text-3xl font-black text-emerald-800 mb-3 tracking-tight">Success!</h2>
              <p className="text-emerald-600 font-medium mb-10">Your transaction has been securely processed.</p>

              <div className="flex flex-col gap-3">
                <button onClick={handleDownloadInvoice} className="bg-emerald-600 text-white py-4 font-bold hover:bg-emerald-700 transition !rounded-none" id="download-invoice-btn">
                  Download Official Receipt ⤓
                </button>
                <Link href="/orders" className="bg-white text-emerald-700 border border-emerald-200 py-4 font-bold hover:bg-emerald-100 transition !rounded-none">
                  View Order Database
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
