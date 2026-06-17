'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  IndianRupee, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Loader2, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle,
  Clock,
  Search
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/hooks/useWebSocket';

interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  availability_status: string;
  is_specialty: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  order_status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  cancel_reason?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'specialties' | 'analytics'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState({
    today_orders: 0,
    active_orders: 0,
    completed_orders: 0,
    today_revenue: 0
  });

  // Home Specialty Settings
  const [specialtiesTitleInput, setSpecialtiesTitleInput] = useState('');
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<number[]>([]);
  const [titleSaving, setTitleSaving] = useState(false);

  // Specialties Manager states
  const [specSearch, setSpecSearch] = useState('');
  const [specCategoryId, setSpecCategoryId] = useState<number | null>(null);
  const [specIsVeg, setSpecIsVeg] = useState<boolean | null>(null);

  // UI / Form States
  const [loading, setLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // CRUD Modal Form States
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formStatus, setFormStatus] = useState('In Stock');
  const [formIsSpecialty, setFormIsSpecialty] = useState(false);

  // Cancellation Modal Form States
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [isCancellingOrderLoading, setIsCancellingOrderLoading] = useState(false);

  // Menu Search / Filtering States
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategoryId, setMenuFilterCategoryId] = useState<number | null>(null);
  const [menuSuggestions, setMenuSuggestions] = useState<MenuItem[]>([]);
  const [showMenuSuggestions, setShowMenuSuggestions] = useState(false);

  // Verify Admin Permissions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated || useAuthStore.getState().user?.role !== 'admin') {
        router.push('/auth/signin?redirect=admin');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Play synthetic chime when a new order arrives
  const playNewOrderSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.error('Audio synthesizer failed to trigger:', e);
    }
  };

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // 1. Fetch Analytics
      const resAnal = await fetch('http://localhost:8000/api/admin/analytics', { headers });
      if (resAnal.ok) setAnalytics(await resAnal.json());

      // 2. Fetch Orders
      const resOrders = await fetch('http://localhost:8000/api/admin/orders', { headers });
      if (resOrders.ok) {
        const ordersData = await resOrders.json();
        const mappedOrders = ordersData.map((o: any) => ({
          id: o.id,
          user_id: o.user_id,
          user_name: o.user?.full_name || o.user_name || 'Customer name unavailable',
          order_status: o.order_status,
          total_amount: o.total_amount,
          created_at: o.created_at,
          cancel_reason: o.cancel_reason,
          items: o.items.map((i: any) => ({
            name: i.menu_item?.name || 'Item',
            quantity: i.quantity,
            price: i.item_price
          }))
        }));
        setOrders(mappedOrders);
      }

      // 3. Fetch Categories, Menu Items & System Settings
      const resCats = await fetch('http://localhost:8000/api/menu/categories');
      if (resCats.ok) setCategories(await resCats.json());

      const resItems = await fetch('http://localhost:8000/api/menu/items');
      if (resItems.ok) {
        const items = await resItems.json();
        setMenuItems(items);
        setSelectedSpecialtyIds(items.filter((item: MenuItem) => item.is_specialty).map((item: MenuItem) => item.id));
      }

      const resTitle = await fetch('http://localhost:8000/api/menu/settings/specialties_title');
      if (resTitle.ok) {
        const dataTitle = await resTitle.json();
        setSpecialtiesTitleInput(dataTitle.value || 'Menu Specialties');
      }

    } catch (e) {
      setError('Failed to query admin service.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token, fetchAdminData]);

  // Fetch menu suggestions as admin types
  useEffect(() => {
    if (!menuSearch.trim()) {
      setMenuSuggestions([]);
      return;
    }
    const fetchMenuSuggestions = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/menu/items?search=${encodeURIComponent(menuSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setMenuSuggestions(data.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      }
    };
    const delay = setTimeout(fetchMenuSuggestions, 150);
    return () => clearTimeout(delay);
  }, [menuSearch]);

  // WebSocket Handling
  const handleWebSocketMessage = (event: string, data: any) => {
    if (event === 'new_order') {
      console.log('[WebSocket Admin] New order received!', data);
      playNewOrderSound();
      
      const newOrderObj: Order = {
        id: data.id,
        user_id: data.user_id,
        user_name: data.user_name || 'Customer name unavailable',
        order_status: data.order_status,
        total_amount: data.total_amount,
        created_at: data.created_at,
        items: data.items
      };
      
      setOrders((prev) => [newOrderObj, ...prev]);
      
      setAnalytics((prev) => ({
        ...prev,
        today_orders: prev.today_orders + 1,
        active_orders: prev.active_orders + 1
      }));
    } else if (event === 'admin_order_update') {
      setOrders((prev) =>
        prev.map((o) => (o.id === data.order_id ? { ...o, order_status: data.status, cancel_reason: data.cancel_reason } : o))
      );
    }
  };

  useWebSocket({
    clientId: 'admin',
    onMessage: handleWebSocketMessage,
  });

  // Action: Update Order Status
  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: nextStatus } : o))
        );
        const resAnal = await fetch('http://localhost:8000/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resAnal.ok) setAnalytics(await resAnal.json());
      }
    } catch (e) {
      console.error('Failed to update order status', e);
    }
  };

  // Action: Cancel Order (at any stage) with Reason
  const handleCancelOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId || !token) return;
    setIsCancellingOrderLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/orders/${cancellingOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'Rejected',
          cancel_reason: cancelReasonInput.trim() || 'Canteen cancelled order.'
        })
      });
      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === cancellingOrderId ? { ...o, order_status: 'Rejected', cancel_reason: cancelReasonInput } : o))
        );
        setCancellingOrderId(null);
        setCancelReasonInput('');
        
        const resAnal = await fetch('http://localhost:8000/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resAnal.ok) setAnalytics(await resAnal.json());
      }
    } catch (e) {
      console.error('Failed to cancel order:', e);
    } finally {
      setIsCancellingOrderLoading(false);
    }
  };

  // Action: Save Specialties Title System Setting
  const handleSaveSpecialtiesTitle = async () => {
    if (!token) return;
    setTitleSaving(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/settings/specialties_title', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value: specialtiesTitleInput })
      });
      if (response.ok) {
        alert('Specialties section title updated successfully!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTitleSaving(false);
    }
  };

  const handleToggleSpecialty = async (itemId: number, isSpecialty: boolean) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/admin/menu-items/${itemId}/specialty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_specialty: isSpecialty })
      });
      if (response.ok) {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, is_specialty: isSpecialty } : item))
        );
      }
    } catch (e) {
      console.error('Failed to toggle specialty status:', e);
    }
  };

  const handleToggleSelectSpecialty = (itemId: number) => {
    setSelectedSpecialtyIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        if (prev.length >= 3) {
          alert("You can select exactly 3 specialty items. Please deselect one of the current choices first.");
          return prev;
        }
        return [...prev, itemId];
      }
    });
  };

  const handleUpdateSpecialtiesShowcase = async () => {
    if (!token) return;
    if (selectedSpecialtyIds.length !== 3) {
      alert("Please select exactly 3 items for the Specialties Showcase.");
      return;
    }
    setTitleSaving(true);
    try {
      const [resTitle, resBulk] = await Promise.all([
        fetch('http://localhost:8000/api/admin/settings/specialties_title', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ value: specialtiesTitleInput })
        }),
        fetch('http://localhost:8000/api/admin/menu-items/specialties/bulk', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ item_ids: selectedSpecialtyIds })
        })
      ]);

      if (resTitle.ok && resBulk.ok) {
        setMenuItems((prev) =>
          prev.map((item) => ({
            ...item,
            is_specialty: selectedSpecialtyIds.includes(item.id)
          }))
        );
        alert('Specialties showcase and title updated successfully!');
      } else {
        alert('Failed to update specialties showcase settings.');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while updating specialties.');
    } finally {
      setTitleSaving(false);
    }
  };

  // CRUD Actions
  const handleOpenItemModal = (item: MenuItem | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormDesc(item.description || '');
      setFormImage(item.image || '');
      setFormPrice(item.price.toString());
      setFormCategoryId(item.category_id.toString());
      setFormIsVeg(item.is_veg);
      setFormStatus(item.availability_status);
      setFormIsSpecialty(item.is_specialty || false);
    } else {
      setEditingItem(null);
      setFormName('');
      setFormDesc('');
      setFormImage('https://images.unsplash.com/photo-1603133872878-685f588c7a9a?w=400');
      setFormPrice('');
      setFormCategoryId(categories[0]?.id.toString() || '');
      setFormIsVeg(true);
      setFormStatus('In Stock');
      setFormIsSpecialty(false);
    }
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCrudLoading(true);

    const payload = {
      name: formName,
      description: formDesc,
      image: formImage,
      price: parseFloat(formPrice),
      category_id: parseInt(formCategoryId),
      is_veg: formIsVeg,
      is_available: formStatus !== 'Out Of Stock',
      availability_status: formStatus,
      is_specialty: formIsSpecialty
    };

    try {
      let response;
      if (editingItem) {
        response = await fetch(`http://localhost:8000/api/admin/menu-items/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:8000/api/admin/menu-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setShowItemModal(false);
        const resItems = await fetch('http://localhost:8000/api/menu/items');
        if (resItems.ok) setMenuItems(await resItems.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCrudLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!token || !confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/admin/menu-items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMenuItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (isoStr: string) => {
    const dateObj = new Date(isoStr);
    return dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Menu Search Filtering
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));
    const matchesCategory = menuFilterCategoryId === null || item.category_id === menuFilterCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8">
      {/* 1. Header & Tab buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <LayoutDashboard className="text-brand-orange" size={26} />
            <span>Admin Console</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage canteen queue, stock inventory, and review earnings</p>
        </div>

        <div className="flex bg-zinc-900 border border-card-border p-1 rounded-2xl shrink-0">
          {(['orders', 'menu', 'specialties', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-xs font-black capitalize rounded-xl transition-all ${
                activeTab === tab 
                  ? 'bg-brand-orange text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'orders' ? 'Orders Queue' : tab === 'menu' ? 'Menu Editor' : tab === 'specialties' ? 'Specialties Showcase' : 'Revenue'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-orange h-10 w-10" />
        </div>
      ) : (
        <>
          {/* 2. Top Analytics widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-1">
                <Clock size={12} className="text-brand-orange" />
                <span>Today's Orders</span>
              </span>
              <p className="text-3xl font-black text-white">{analytics.today_orders}</p>
            </div>
            
            <div className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-1">
                <ShoppingBag size={12} className="text-brand-yellow" />
                <span>Active Queue</span>
              </span>
              <p className="text-3xl font-black text-brand-yellow">{analytics.active_orders}</p>
            </div>

            <div className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-1">
                <Check size={12} className="text-green-500" />
                <span>Completed Today</span>
              </span>
              <p className="text-3xl font-black text-green-500">{analytics.completed_orders}</p>
            </div>

            <div className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-1">
                <IndianRupee size={12} className="text-emerald-500" />
                <span>Today's Income</span>
              </span>
              <p className="text-3xl font-black text-emerald-500">₹{analytics.today_revenue}</p>
            </div>
          </div>

          {/* TAB 1: ORDERS QUEUE */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Incoming Queue</span>
                <span className="h-2 w-2 rounded-full bg-brand-orange animate-ping" />
              </h2>

              {orders.length === 0 ? (
                <div className="glass-panel border border-white/5 bg-zinc-950/20 py-16 text-center text-zinc-500 rounded-3xl flex flex-col items-center justify-center space-y-2">
                  <AlertCircle size={32} />
                  <p className="text-sm font-semibold text-zinc-400">Order queue is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders.map((order) => {
                    const isCompleted = order.order_status === 'Completed';
                    const isRejected = order.order_status === 'Rejected';
                    
                    return (
                      <div 
                        key={order.id}
                        className={`glass-panel border rounded-3xl p-5 space-y-4 flex flex-col justify-between transition-all ${
                          order.order_status === 'Pending' 
                            ? 'border-brand-orange/40 bg-brand-orange/5' 
                            : 'border-white/5 bg-zinc-950/30'
                        }`}
                      >
                        {/* Header details */}
                        <div className="flex justify-between items-start border-b border-card-border/50 pb-3">
                          <div>
                            <span className="text-xs font-bold text-brand-orange">ID: #{order.id}</span>
                            <h4 className="text-sm font-black text-white">{order.user_name}</h4>
                            <span className="text-[10px] text-zinc-500">Placed at {formatDate(order.created_at)}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">₹{order.total_amount}</p>
                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md mt-1 capitalize text-zinc-950 ${
                              order.order_status === 'Pending' ? 'bg-zinc-400' :
                              order.order_status === 'Accepted' ? 'bg-indigo-400' :
                              order.order_status === 'Preparing' ? 'bg-amber-400' :
                              order.order_status === 'Ready' ? 'bg-green-400' : 
                              order.order_status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {order.order_status === 'Rejected' ? 'Cancelled' : order.order_status}
                            </span>
                          </div>
                        </div>

                        {/* Items listed */}
                        <div className="text-xs space-y-1.5 text-zinc-300">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{it.name} <span className="text-zinc-500 font-bold">x{it.quantity}</span></span>
                              <span className="font-semibold text-zinc-400">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Cancellation reason note if rejected */}
                        {isRejected && order.cancel_reason && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px]">
                            <span className="font-bold">Cancellation Reason:</span> {order.cancel_reason}
                          </div>
                        )}

                        {/* Actions block */}
                        {!isCompleted && !isRejected && (
                          <div className="flex flex-col space-y-2 pt-2 border-t border-card-border/30">
                            <div className="flex space-x-2">
                              {order.order_status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Accepted')}
                                  className="flex-1 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 hover:bg-brand-orange-hover transition-all"
                                >
                                  <Check size={14} /> <span>Accept Order</span>
                                </button>
                              )}

                              {order.order_status === 'Accepted' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                                  className="w-full py-2.5 bg-amber-500 text-zinc-950 text-xs font-black rounded-xl hover:bg-amber-600 transition-all"
                                >
                                  Start Preparing 🍲
                                </button>
                              )}

                              {order.order_status === 'Preparing' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Ready')}
                                  className="w-full py-2.5 bg-green-500 text-zinc-950 text-xs font-black rounded-xl hover:bg-green-600 transition-all animate-pulse"
                                >
                                  Mark Ready for Collection 🔔
                                </button>
                              )}

                              {order.order_status === 'Ready' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Completed')}
                                  className="w-full py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all"
                                >
                                  Order Handed Over / Done ✅
                                </button>
                              )}

                              {/* Cancellation Button available at any stage */}
                              <button
                                onClick={() => {
                                  setCancellingOrderId(order.id);
                                  setCancelReasonInput('');
                                }}
                                className="py-2.5 px-3 bg-red-950/20 border border-red-500/20 text-red-500 hover:bg-red-950/50 text-xs font-bold rounded-xl flex items-center justify-center transition-all gap-1.5"
                                title="Cancel Order at this stage"
                              >
                                <X size={14} />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="space-y-6">


              {/* Menu Header with Action Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white">Menu Editor</h2>

                {/* Filter and Search Bar with Autocomplete Suggestions */}
                <div className="flex items-center space-x-3 w-full md:max-w-xl">
                  {/* Category Dropdown */}
                  <select
                    value={menuFilterCategoryId || ''}
                    onChange={(e) => setMenuFilterCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-zinc-900 border border-card-border text-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-orange transition-colors"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  {/* Search Input with Autocomplete Dropdown */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search items for editing..."
                      value={menuSearch}
                      onFocus={() => setShowMenuSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowMenuSuggestions(false), 200)}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-card-border focus:border-brand-orange rounded-xl pl-9 pr-8 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    {menuSearch && (
                      <button
                        type="button"
                        onClick={() => setMenuSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        title="Clear Search"
                      >
                        <X size={14} />
                      </button>
                    )}

                    {/* Suggestions Dropdown */}
                    {showMenuSuggestions && menuSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-900 border border-card-border rounded-xl shadow-2xl p-2 max-h-48 overflow-y-auto">
                        {menuSuggestions.map((item) => (
                          <button
                            key={item.id}
                            onMouseDown={() => {
                              setMenuSearch(item.name);
                              setShowMenuSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-orange/15 hover:text-brand-orange rounded-lg transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenItemModal(null)}
                    className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg transition-all shrink-0"
                  >
                    <Plus size={14} /> <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Items list table */}
              <div className="glass-panel border border-white/5 bg-zinc-950/30 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-zinc-900/60 border-b border-card-border text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Food Item</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Specialty</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {filteredMenuItems.map((item) => {
                        const cat = categories.find((c) => c.id === item.category_id)?.name || 'Unknown';
                        return (
                          <tr key={item.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-6 py-4 flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                              />
                              <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="text-[10px] text-zinc-500 line-clamp-1">{item.description}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold">{cat}</td>
                            <td className="px-6 py-4 text-xs font-bold text-white">₹{item.price}</td>
                            <td className="px-6 py-4 text-xs">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                item.is_veg ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {item.is_veg ? 'VEG' : 'NON-VEG'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                item.is_specialty ? 'bg-brand-orange/10 text-brand-orange' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {item.is_specialty ? '★ FEATURED' : 'STANDARD'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                item.availability_status === 'In Stock' ? 'bg-green-500/10 text-green-400' :
                                item.availability_status === 'Limited Stock' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-red-500/10 text-red-400'
                              }`}>
                                {item.availability_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenItemModal(item)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-zinc-500 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SPECIALTIES SHOWCASE */}
          {activeTab === 'specialties' && (
            <div className="space-y-6">
              <div className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                    <span>Specialties Showcase Manager</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Customize the specialties showcase title and choose exactly 3 items to show on the landing page.
                  </p>
                </div>

                {/* Title and Save button */}
                <div className="space-y-2 max-w-xl">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Showcase Section Title</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={specialtiesTitleInput}
                      onChange={(e) => setSpecialtiesTitleInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                      placeholder="e.g. Menu Specialties, Chef Specials..."
                    />
                  </div>
                </div>

                {/* Selected Specialties Summary (Visual) */}
                <div className="border-t border-card-border/50 pt-6 space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Currently Selected Specialties ({selectedSpecialtyIds.length} / 3 selected)
                  </h4>
                  {selectedSpecialtyIds.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No specialties selected yet. Please pick 3 items below.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {menuItems.filter(item => selectedSpecialtyIds.includes(item.id)).map(item => (
                        <div key={item.id} className="relative glass-panel border border-brand-orange/20 bg-brand-orange/5 p-3 rounded-2xl flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-zinc-400">₹{item.price}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSelectSpecialty(item.id)}
                            className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selection Catalog */}
                <div className="border-t border-card-border/50 pt-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Select Specialties from Menu Catalog</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Toggle checkboxes to select the dishes. Note: You must select exactly 3 items.</p>
                  </div>

                  {/* Search filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search items by name..."
                        value={specSearch}
                        onChange={(e) => setSpecSearch(e.target.value)}
                        className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl pl-3 pr-8 py-2 text-xs text-white focus:outline-none transition-colors"
                      />
                      {specSearch && (
                        <button
                          type="button"
                          onClick={() => setSpecSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                          title="Clear Search"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <select
                      value={specCategoryId || ''}
                      onChange={(e) => setSpecCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-zinc-950 border border-card-border text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-orange transition-colors"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={specIsVeg === null ? '' : specIsVeg.toString()}
                      onChange={(e) => setSpecIsVeg(e.target.value === '' ? null : e.target.value === 'true')}
                      className="bg-zinc-950 border border-card-border text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-orange transition-colors"
                    >
                      <option value="">All Diets</option>
                      <option value="true">Veg Only</option>
                      <option value="false">Non-Veg Only</option>
                    </select>
                  </div>

                  {/* List of items */}
                  <div className="max-h-72 overflow-y-auto border border-card-border rounded-2xl bg-zinc-950/40 p-4 divide-y divide-card-border/35">
                    {menuItems.filter((item) => {
                      const matchesSearch = item.name.toLowerCase().includes(specSearch.toLowerCase());
                      const matchesCategory = specCategoryId === null || item.category_id === specCategoryId;
                      const matchesDiet = specIsVeg === null || item.is_veg === specIsVeg;
                      return matchesSearch && matchesCategory && matchesDiet;
                    }).map((item) => {
                      const isChecked = selectedSpecialtyIds.includes(item.id);
                      return (
                        <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-900 border border-card-border/50"
                            />
                            <div>
                              <p className="text-xs font-semibold text-white">{item.name}</p>
                              <p className="text-[10px] text-zinc-500">₹{item.price} • {item.is_veg ? 'Veg' : 'Non-Veg'}</p>
                            </div>
                          </div>
                          <label className="relative flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectSpecialty(item.id)}
                              className="accent-brand-orange rounded border-zinc-700 bg-zinc-950 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                            />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isChecked ? 'text-brand-orange' : 'text-zinc-500'}`}>
                              {isChecked ? 'Selected' : 'Select'}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Single Update Button */}
                <div className="border-t border-card-border/50 pt-6 flex justify-end">
                  <button
                    onClick={handleUpdateSpecialtiesShowcase}
                    disabled={titleSaving}
                    className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center space-x-2"
                  >
                    <span>{titleSaving ? 'Saving Updates...' : 'Update Specialties Showcase'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVENUE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Revenue Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Queue status summary</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-400">
                        <span>Completed Orders</span>
                        <span>{analytics.completed_orders} orders</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${analytics.today_orders ? (analytics.completed_orders / analytics.today_orders) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-400">
                        <span>Active Orders in Prep</span>
                        <span>{analytics.active_orders} orders</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-yellow" 
                          style={{ width: `${analytics.today_orders ? (analytics.active_orders / analytics.today_orders) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operational parameters</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    ZEST Canteen Platform utilizes live WebSockets pushing updates seamlessly to student dashboards. Today's average processing cycle metrics and analytical parameters are within optimal ranges.
                  </p>
                  <div className="border-t border-card-border/50 pt-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Avg Preparation Time</span>
                      <p className="text-lg font-extrabold text-white mt-0.5">~12 Mins</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Canteen Load State</span>
                      <p className="text-lg font-extrabold text-brand-orange mt-0.5">Optimal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CANCELLATION DIALOG MODAL */}
      {cancellingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCancellingOrderId(null)} />
          
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-card-border rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h3 className="text-base font-black text-white">Cancel Order #{cancellingOrderId}</h3>
              <button onClick={() => setCancellingOrderId(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="Specify the reason (e.g. Out of ingredients, item unavailable, payment issue)"
                  className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-colors resize-none"
                />
                <p className="text-[10px] text-zinc-500">
                  This explanation will appear directly on the student's dashboard status alert.
                </p>
              </div>

              <div className="flex space-x-3 pt-3 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setCancellingOrderId(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-all"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isCancellingOrderLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-red-600/15"
                >
                  {isCancellingOrderLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <span>Confirm Cancel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowItemModal(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-card-border rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-card-border pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Description</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none animate-none"
                  />
                </div>

                {/* Image URL */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Image URL</label>
                  <input
                    type="text"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Stock Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Stock Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Limited Stock">Limited Stock</option>
                    <option value="Out Of Stock">Out Of Stock</option>
                  </select>
                </div>

                {/* Veg Option */}
                <div className="space-y-1 flex flex-col justify-end pb-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase mb-2">Diet Preference</label>
                  <button
                    type="button"
                    onClick={() => setFormIsVeg(!formIsVeg)}
                    className="flex items-center space-x-2 text-sm font-semibold hover:text-white transition-colors text-left"
                  >
                    {formIsVeg ? (
                      <ToggleRight className="text-green-500 h-8 w-8" />
                    ) : (
                      <ToggleLeft className="text-zinc-600 h-8 w-8" />
                    )}
                    <span>{formIsVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                  </button>
                </div>

                {/* Specialty Option */}
                <div className="col-span-2 space-y-1 flex flex-col pt-2 border-t border-card-border/50">
                  <label className="text-xs font-bold text-zinc-400 uppercase mb-2">Featured Item Specialty</label>
                  <button
                    type="button"
                    onClick={() => setFormIsSpecialty(!formIsSpecialty)}
                    className="flex items-center space-x-2 text-sm font-semibold hover:text-white transition-colors text-left"
                  >
                    {formIsSpecialty ? (
                      <ToggleRight className="text-brand-orange h-8 w-8" />
                    ) : (
                      <ToggleLeft className="text-zinc-600 h-8 w-8" />
                    )}
                    <span>{formIsSpecialty ? 'Featured as Home Specialty' : 'Standard Menu Item'}</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudLoading}
                  className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all"
                >
                  {crudLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <span>Save Item</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
