'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Clock, HelpCircle, RefreshCw, Star, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/hooks/useWebSocket';

interface MenuItem {
  name: string;
  price: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  item_price: number;
  menu_item: MenuItem;
}

interface Order {
  id: number;
  order_status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  cancel_reason?: string;
}

const statusStages = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];

const statusMeta: Record<string, { color: string; label: string; progress: number }> = {
  'Pending': { color: 'bg-zinc-600', label: 'In Queue', progress: 10 },
  'Accepted': { color: 'bg-indigo-500', label: 'Order Accepted', progress: 30 },
  'Preparing': { color: 'bg-amber-500', label: 'Kitchen Preparing', progress: 60 },
  'Ready': { color: 'bg-green-500', label: 'Ready to Collect', progress: 90 },
  'Completed': { color: 'bg-emerald-600', label: 'Completed', progress: 100 },
  'Rejected': { color: 'bg-red-600', label: 'Cancelled / Rejected', progress: 100 }
};

export default function OrderTrackingPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customer receipt confirmation and rating states
  const [receiveConfirmId, setReceiveConfirmId] = useState<number | null>(null);
  const [ratingModalId, setRatingModalId] = useState<number | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const handleOpenReceiveModal = (orderId: number) => {
    setReceiveConfirmId(orderId);
  };

  const handleConfirmReceived = () => {
    if (!receiveConfirmId) return;
    const targetId = receiveConfirmId;
    setReceiveConfirmId(null);
    setRatingModalId(targetId);
    setRatingVal(5); // default
  };

  const handleFeedbackSubmit = async () => {
    if (!ratingModalId || !token) return;
    setFeedbackSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${ratingModalId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingVal })
      });
      if (response.ok) {
        // Update local order status
        setOrders(prev => prev.map(o => o.id === ratingModalId ? { ...o, order_status: 'Completed' } : o));
        setRatingModalId(null);
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to complete order.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating order.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Re-route unauthorized traffic
  useEffect(() => {
    // If not authenticated, let's wait a second for client providers initialization
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        router.push('/auth/signin?redirect=orders');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Load orders history
  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/orders/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load orders history.');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Handle WebSocket updates
  const handleWebSocketMessage = (event: string, data: any) => {
    if (event === 'order_update') {
      console.log(`[WebSocket Update] Order ${data.order_id} status updated to: ${data.status}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === data.order_id 
            ? { ...order, order_status: data.status, cancel_reason: data.cancel_reason } 
            : order
        )
      );
    }
  };

  // Find user ID from client storage / auth store
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('zest_user') : null;
  let parsedUser = user;
  if (!user && storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (e) {}
  }
  // If user is admin, they don't track client orders here (they connect to 'admin' channel)
  const clientWsId = parsedUser && parsedUser.role !== 'admin' ? parsedUser.email : null; // Connect via user details
  
  // Custom WebSocket Hook
  // Get token user payload check or fallback
  const finalUserId = typeof window !== 'undefined' ? localStorage.getItem('zest_user') ? JSON.parse(localStorage.getItem('zest_user')!).id : null : null;
  
  useWebSocket({
    clientId: finalUserId || 'guest',
    onMessage: handleWebSocketMessage,
  });

  const formatDate = (isoStr: string) => {
    const dateObj = new Date(isoStr);
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <ClipboardList className="text-brand-orange" size={26} />
            <span>Track Orders</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Real-time status of your active and past canteen orders</p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-zinc-900 border border-card-border text-zinc-400 hover:text-white rounded-xl flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs font-semibold">Refresh</span>
        </button>
      </div>

      {/* Main content */}
      {loading && orders.length === 0 ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-zinc-800 rounded w-1/4" />
                <div className="h-4 bg-zinc-800 rounded w-1/6" />
              </div>
              <div className="h-2 bg-zinc-800 rounded w-full" />
              <div className="h-10 bg-zinc-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-center">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-zinc-950/20 py-20">
          <div className="p-4 bg-zinc-900 rounded-full text-zinc-500">
            <Clock size={40} />
          </div>
          <h3 className="text-lg font-bold text-zinc-300">No orders placed yet</h3>
          <p className="text-sm text-zinc-500 max-w-xs">
            It looks like you haven't placed any food orders today. Go to the dashboard to start!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange-hover transition-all"
          >
            Go to Menu
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = statusMeta[order.order_status] || { color: 'bg-zinc-600', label: order.order_status, progress: 10 };
            const isCompletedOrRejected = order.order_status === 'Completed' || order.order_status === 'Rejected';
            
            return (
              <div
                key={order.id}
                className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-6 hover:border-white/10 transition-all"
              >
                {/* Top metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/50 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Order ID: #{order.id}</h3>
                    <p className="text-xs text-zinc-500">Placed on {formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-black text-white">₹{order.total_amount}</span>
                    <span className={`px-3 py-1.5 text-xs font-black text-white rounded-xl shadow-md ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Cancellation Reason Alert */}
                {order.order_status === 'Rejected' && order.cancel_reason && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm rounded-2xl flex items-center space-x-2.5">
                    <span className="text-lg animate-bounce">⚠️</span>
                    <div>
                      <span className="font-extrabold block">Cancellation Reason:</span>
                      <span className="text-white font-medium">{order.cancel_reason}</span>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                {!isCompletedOrRejected && (
                  <div className="space-y-3.5">
                    {/* Visual Stages Progress Line */}
                    <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-brand-orange transition-all duration-1000 ease-out"
                        style={{ width: `${statusInfo.progress}%` }}
                      />
                    </div>

                    {/* Step Labels */}
                    <div className="grid grid-cols-5 text-center text-[10px] sm:text-xs font-bold text-zinc-500">
                      {statusStages.map((stage) => {
                        const stageIndex = statusStages.indexOf(stage);
                        const currentIndex = statusStages.indexOf(order.order_status);
                        const isActive = stageIndex <= currentIndex;
                        const isCurrent = stage === order.order_status;
                        
                        return (
                          <span
                            key={stage}
                            className={`transition-colors duration-300 ${
                              isCurrent ? 'text-brand-orange font-black' : isActive ? 'text-white' : 'text-zinc-600'
                            }`}
                          >
                            {stage}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* List items */}
                <div className="bg-zinc-900/40 rounded-2xl border border-card-border/50 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pb-1 border-b border-card-border/30 mb-2">
                    Items ordered
                  </h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300 font-medium">
                        {item.menu_item?.name || 'Item'} <span className="text-zinc-500 font-bold">x{item.quantity}</span>
                      </span>
                      <span className="text-white font-bold">
                        ₹{item.item_price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Receive Order Button (for user confirmation at status "Ready") */}
                {order.order_status === 'Ready' && (
                  <div className="pt-4 border-t border-card-border/30">
                    <button
                      onClick={() => handleOpenReceiveModal(order.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      <span>Receive Order 🍽️</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 1. CONFIRMATION DIALOG MODAL */}
      {receiveConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReceiveConfirmId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-card-border rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 shadow-lg shadow-emerald-600/5">
                🍔
              </div>
              <h3 className="text-lg font-black text-white">Receive Order #{receiveConfirmId}?</h3>
              <p className="text-xs text-zinc-400">Please confirm that you have collected your food item from the canteen counter.</p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setReceiveConfirmId(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmReceived}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/15"
              >
                Confirm Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FEEDBACK / STAR RATING MODAL */}
      {ratingModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRatingModalId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-card-border rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-lg shadow-brand-orange/5">
                ★
              </div>
              <h3 className="text-lg font-black text-white">Rate your Food Experience</h3>
              <p className="text-xs text-zinc-400">Help us improve the menu! Please rate your meal out of 5 stars.</p>
            </div>

            {/* Star Rating Select controls */}
            <div className="flex items-center justify-center space-x-3 py-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isSelected = starVal <= ratingVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRatingVal(starVal)}
                    className="p-1 text-brand-yellow hover:scale-110 transition-transform"
                    title={`Rate {starVal} stars`}
                  >
                    <Star
                      size={28}
                      fill={isSelected ? '#eab308' : 'none'}
                      stroke="#eab308"
                      className="text-brand-orange"
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setRatingModalId(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-all"
                disabled={feedbackSubmitting}
              >
                Skip Feedback
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={feedbackSubmitting}
                className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-brand-orange/15 flex items-center justify-center space-x-1"
              >
                {feedbackSubmitting ? (
                  <span className="border-2 border-white border-t-transparent animate-spin rounded-full h-4 w-4" />
                ) : (
                  <span>Submit Rating</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

