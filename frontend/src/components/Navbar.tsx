'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-black flex items-center justify-center transition-transform group-hover:scale-105 border border-black">
              <span className="text-white text-lg">✥</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Smart<span className="text-rose-500">Cart.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold">
              Home
            </Link>
            <Link href="/products" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold">
              Collection
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/cart" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold flex items-center gap-1">
                  ⚑ Cart
                </Link>
                <Link href="/orders" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold">
                  Orders
                </Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-rose-500 hover:text-rose-600 transition-colors text-sm font-semibold">
                ⌘ Admin
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium">
                  Welcome, <span className="text-slate-900 font-bold">{user?.fullName}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors bg-slate-50 border border-slate-200 px-4 py-2"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                  Login
                </Link>
                <Link href="/register" className="btn-primary !px-6 !py-2.5 text-sm">
                  Join Now ↗
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900"
          >
            <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden p-6 bg-white border border-slate-200 mt-2 mb-4 absolute left-4 right-4 z-50">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/products" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Collection</Link>
              {isAuthenticated && (
                <>
                  <Link href="/cart" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Cart</Link>
                  <Link href="/orders" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Orders</Link>
                </>
              )}
              {isAdmin && (
                <Link href="/admin" className="text-rose-500 font-medium" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <hr className="border-slate-100" />
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-slate-500">Logout</button>
              ) : (
                <>
                  <Link href="/login" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link href="/register" className="text-rose-500 font-medium" onClick={() => setMenuOpen(false)}>Join Now</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
