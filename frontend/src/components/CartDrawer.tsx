'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CartDrawer() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCartStore();
  const { isCartOpen, setCartOpen } = useUIStore();
  const { token, isAuthenticated } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [clientItems, setClientItems] = useState(items);

  // Sync cart items on client load to prevent hydration error
  useEffect(() => {
    setClientItems(items);
  }, [items]);

  const handleCheckout = async () => {
    if (!isAuthenticated || !token) {
      setCartOpen(false);
      router.push('/auth/signin?redirect=checkout');
      return;
    }

    if (clientItems.length === 0) return;

    setLoading(true);
    setError(null);

    if (!paymentReference.trim()) {
      setError('Payment verification is required before placing the order.');
      return;
    }

    const orderPayload = {
      payment_method: 'UPI',
      transaction_id: paymentReference.trim(),
      items: clientItems.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to place order. Please try again.');
      }

      // Success: Clear cart, close drawer, redirect to tracking page
      clearCart();
      setPaymentReference('');
      setCartOpen(false);
      router.push('/orders');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-zinc-900 border-l border-card-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-card-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="text-brand-orange" size={22} />
                <h2 className="text-xl font-bold text-white">Your Basket</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
                  {error}
                </div>
              )}

              {clientItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="p-6 bg-zinc-800/50 rounded-full text-zinc-500">
                    <ShoppingBag size={48} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-300">Your cart is empty</h3>
                  <p className="text-sm text-zinc-500 max-w-xs">
                    Browse our premium food menu and add items to satisfy your cravings.
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      router.push('/dashboard');
                    }}
                    className="px-6 py-2.5 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange-hover transition-all"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                clientItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="p-4 bg-zinc-800/40 rounded-2xl border border-card-border flex items-center space-x-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full mt-1 ${
                              item.isVeg ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          />
                        </div>
                        <span className="text-sm font-bold text-white">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold text-white px-3">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        {/* Trash */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-zinc-500 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Billing block */}
            {clientItems.length > 0 && (
              <div className="p-6 border-t border-card-border bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between text-base">
                  <span className="text-zinc-400 font-medium">Subtotal</span>
                  <span className="text-white font-bold text-lg">₹{getCartTotal()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-card-border pb-4">
                  <span>Delivery Charges / Service Fees</span>
                  <span className="text-green-500 font-semibold">FREE</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    UPI / Payment Reference
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Complete payment first, then enter the reference ID for canteen verification.
                  </p>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={loading || !paymentReference.trim()}
                  className="w-full py-3.5 bg-brand-orange text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-hover hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  {loading ? (
                    <span className="border-2 border-white border-t-transparent animate-spin rounded-full h-5 w-5" />
                  ) : (
                    <>
                      <span>{isAuthenticated ? 'Place Order' : 'Sign In & Place Order'}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-zinc-500">
                  By clicking above, you agree to place this order in the canteen queue. Real-time updates will begin immediately.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
