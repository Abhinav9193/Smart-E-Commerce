'use client';

import { useState, useEffect } from 'react';
import { orderApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface OrderItem {
  id: number;
  productName: string;
  productImageUrl: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadOrders();
    else setLoading(false);
  }, [user, page]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await orderApi.getMyOrders(user.token, page, 10);
      setOrders(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: number, orderNumber: string) => {
    if (!user) return;
    try {
      const blob = await orderApi.downloadInvoice(user.token, orderId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="classy-card p-12">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Authentication Required</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Access your secure history ledger.</p>
          <Link href="/login" className="btn-primary !px-10 !py-4 text-lg">Access Portal ↗</Link>
        </div>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="space-y-6">
            <div className="h-12 bg-slate-100 rounded-xl w-1/4 mb-10 animate-pulse"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="classy-card h-48 bg-white animate-pulse"></div>
            ))}
          </div>
        </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Order <span className="text-rose-500 italic font-serif">Ledger.</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">A complete record of your transactions.</p>
      </div>

      {(orders?.length || 0) === 0 ? (
        <div className="classy-card p-16 text-center bg-white">
          <div className="text-5xl mb-6 opacity-30">🗂</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Records Found</h2>
          <p className="text-slate-500 mb-8">You haven't made any purchases yet.</p>
          <Link href="/products" className="btn-secondary">Browse Curations ↗</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {(orders || []).map((order) => {
            const isPending = order.status === 'PENDING';
            return (
              <div key={order.id} className="classy-card p-0 overflow-hidden bg-white border border-slate-200">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex flex-wrap gap-8 text-sm">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Date</p>
                      <p className="text-slate-900 font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Total</p>
                      <p className="text-slate-900 font-black font-mono">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Order #</p>
                       <p className="text-slate-900 font-mono text-xs mt-0.5 bg-white px-2 py-0.5 border border-slate-200">{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-badge px-3 py-1 text-[10px] ${
                      isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {order.status}
                    </span>
                    <Link
                      href={`/checkout/${order.id}`}
                      className="text-sm font-bold text-slate-600 hover:text-rose-500 bg-white border border-slate-200 px-4 py-1.5 transition-colors"
                    >
                      View Details ↗
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6">
                  <div className="flex flex-col gap-4">
                    {(order.items || []).map((item, index) => (
                      <div key={item.id} className={`${index !== 0 ? 'border-t border-slate-100 pt-4' : ''} flex items-center gap-4`}>
                        <div className="w-16 h-16 bg-white border border-slate-100 p-2 flex-shrink-0">
                          <img
                            src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={item.productName}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 max-w-2xl line-clamp-1 hover:text-rose-500 transition-colors cursor-pointer">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Qty: <span className="font-bold text-slate-700">{item.quantity}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isPending && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                        className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
                      >
                        <span className="text-xl">⤓</span> Download Original Receipt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="btn-secondary !py-2 !px-5 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm font-bold text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary !py-2 !px-5 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
