'use client';

import { useState, useEffect } from 'react';
import { adminApi, categoryApi, productApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryName: string;
  imageUrl: string;
  rating: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user, isAdmin } = useAuth();

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', rating: '', imageUrl: '', categoryId: '' });

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', imageUrl: '' });

  useEffect(() => {
    if (user && isAdmin) {
      loadCategories();
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) loadData();
  }, [activeTab, page]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err) { console.error(err); }
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const data = await productApi.getAll(page, 20, 'id', 'desc');
        setProducts(data.content);
        setTotalPages(data.totalPages);
      } else if (activeTab === 'orders') {
        const data = await adminApi.getAllOrders(user.token, page, 20);
        setOrders(data.content);
        setTotalPages(data.totalPages);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSaveProduct = async () => {
    if (!user) return;
    try {
      const data = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        rating: parseFloat(productForm.rating) || 4.0,
        imageUrl: productForm.imageUrl,
        categoryId: parseInt(productForm.categoryId),
      };

      if (editingProduct) {
        await adminApi.updateProduct(user.token, editingProduct.id, data);
      } else {
        await adminApi.createProduct(user.token, data);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', rating: '', imageUrl: '', categoryId: '' });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!user || !confirm('Delete this product?')) return;
    try {
      await adminApi.deleteProduct(user.token, id);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleSaveCategory = async () => {
    if (!user) return;
    try {
      await adminApi.createCategory(user.token, catForm);
      setShowCatForm(false);
      setCatForm({ name: '', description: '', imageUrl: '' });
      loadCategories();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!user || !confirm('Delete this category?')) return;
    try {
      await adminApi.deleteCategory(user.token, id);
      loadCategories();
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    if (!user) return;
    try {
      await adminApi.updateOrderStatus(user.token, orderId, status);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
        <p className="text-slate-400 mb-6">Please login with an admin account.</p>
        <Link href="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Admin <span className="gradient-text">Panel</span>
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(['products', 'categories', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Products ({products.length})</h2>
            <button onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', stock: '', rating: '', imageUrl: '', categoryId: '' }); }} className="btn-primary">
              + Add Product
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">{editingProduct ? 'Edit' : 'Add'} Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="Product Name" className="input-field" />
                <select value={productForm.categoryId} onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})} className="input-field">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} placeholder="Price" type="number" className="input-field" />
                <input value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} placeholder="Stock" type="number" className="input-field" />
                <input value={productForm.rating} onChange={(e) => setProductForm({...productForm, rating: e.target.value})} placeholder="Rating (1-5)" type="number" step="0.1" className="input-field" />
                <input value={productForm.imageUrl} onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})} placeholder="Image URL" className="input-field" />
                <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} placeholder="Description" className="input-field md:col-span-2" rows={3}></textarea>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveProduct} className="btn-primary">Save</button>
                <button onClick={() => setShowProductForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Product</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Category</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Price</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Stock</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Rating</th>
                  <th className="text-left p-4 text-sm text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-sm text-white font-medium line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{product.categoryName}</td>
                    <td className="p-4 text-sm text-indigo-400 font-medium">₹{product.price.toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-300">{product.stock}</td>
                    <td className="p-4 text-sm text-amber-400">{product.rating}⭐</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name,
                              description: '',
                              price: String(product.price),
                              stock: String(product.stock),
                              rating: String(product.rating),
                              imageUrl: product.imageUrl || '',
                              categoryId: '',
                            });
                            setShowProductForm(true);
                          }}
                          className="text-xs px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/30"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-xs px-3 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 disabled:opacity-30">← Prev</button>
              <span className="text-slate-400 text-sm px-4">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-secondary !py-2 !px-4 disabled:opacity-30">Next →</button>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Categories ({categories.length})</h2>
            <button onClick={() => setShowCatForm(true)} className="btn-primary">+ Add Category</button>
          </div>

          {showCatForm && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Add Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={catForm.name} onChange={(e) => setCatForm({...catForm, name: e.target.value})} placeholder="Category Name" className="input-field" />
                <input value={catForm.description} onChange={(e) => setCatForm({...catForm, description: e.target.value})} placeholder="Description" className="input-field" />
                <input value={catForm.imageUrl} onChange={(e) => setCatForm({...catForm, imageUrl: e.target.value})} placeholder="Image URL" className="input-field" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveCategory} className="btn-primary">Save</button>
                <button onClick={() => setShowCatForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{cat.name}</h3>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                </div>
                <p className="text-sm text-slate-400 mb-2">{cat.description}</p>
                <span className="text-xs text-indigo-400">{cat.productCount} products</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">All Orders</h2>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">#{order.orderNumber}</h3>
                    <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-slate-500">{order.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="input-field !w-auto !py-1 text-sm"
                    >
                      {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="text-lg font-bold text-indigo-400">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 disabled:opacity-30">← Prev</button>
              <span className="text-slate-400 text-sm px-4">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-secondary !py-2 !px-4 disabled:opacity-30">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
