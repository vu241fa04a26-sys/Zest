'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Plus, 
  Minus,
  CheckCircle,
  HelpCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { API_BASE_URL } from '@/config';

interface Category {
  id: number;
  name: string;
  image: string;
}

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
}

const categoryIcons: Record<string, string> = {
  "Breakfast": "🥞",
  "Rice": "🍚",
  "Noodles": "🍝",
  "Biryani": "🍛",
  "Burgers": "🍔",
  "Pizza": "🍕",
  "Sandwiches": "🥪",
  "Shawarma": "🌯",
  "Starters": "🍟",
  "Juices": "🥤",
  "Milkshakes": "🥛",
  "Mocktails": "🍹"
};

export default function DashboardPage() {
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartTotal = useCartStore((state) => state.getCartTotal());
  const cartCount = useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0));
  
  const { toggleCart } = useUIStore();
  const { isAuthenticated, user, token } = useAuthStore();
  const canOrder = isAuthenticated && user?.role !== 'admin';

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isVeg, setIsVeg] = useState<boolean | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null); // "price_asc", "price_desc"
  
  // Feedback / Animation states
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<MenuItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [latestOrder, setLatestOrder] = useState<any | null>(null);
  const [showLatestOrderAlert, setShowLatestOrderAlert] = useState(true);

  // Local card quantities (for items not yet in cart)
  const [cardQuantities, setCardQuantities] = useState<Record<number, number>>({});

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/menu/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    fetchCategories();
  }, []);

  // Load latest orders to check for cancellation
  const fetchLatestOrders = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setLatestOrder(data[0]); // first is latest
        }
      }
    } catch (e) {
      console.error('Failed to load orders for status bar', e);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchLatestOrders();
      const interval = setInterval(fetchLatestOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token, fetchLatestOrders]);

  // WebSocket handling for real-time order cancellation alerts
  const handleWebSocketMessage = (event: string, data: any) => {
    if (event === 'order_update') {
      if (latestOrder && latestOrder.id === data.order_id) {
        setLatestOrder((prev: any) => prev ? { ...prev, order_status: data.status, cancel_reason: data.cancel_reason } : null);
        setShowLatestOrderAlert(true);
      }
    }
  };

  useWebSocket({
    clientId: user ? user.id : 'guest',
    onMessage: handleWebSocketMessage,
  });

  // Fetch search suggestions
  useEffect(() => {
    if (!search.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/menu/items?search=${encodeURIComponent(search)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchSuggestions(data.slice(0, 5));
        }
      } catch (e) {
        console.error('Suggestions fetch failed', e);
      }
    };
    const delay = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(delay);
  }, [search]);

  // Fetch Items based on filters
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId !== null) params.append('category_id', selectedCategoryId.toString());
      if (isVeg !== null) params.append('is_veg', isVeg.toString());
      if (availableOnly) params.append('is_available', 'true');
      if (search) params.append('search', search);
      if (sortBy) params.append('sort_by', sortBy);

      const res = await fetch(`${API_BASE_URL}/api/menu/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error('Failed to load menu items', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, isVeg, availableOnly, search, sortBy]);

  // Trigger fetching on filter change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchItems]);

  const handleAddToCart = (item: MenuItem, qty: number) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.is_veg
    }, qty);
    
    // Reset local quantity count
    setCardQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
  };

  const resetFilters = () => {
    setIsVeg(null);
    setAvailableOnly(false);
    setSortBy(null);
    setSearch('');
    setSelectedCategoryId(null);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8 pb-32">
      {/* 0. Cancellation Banner Alert */}
      {latestOrder && latestOrder.order_status === 'Rejected' && showLatestOrderAlert && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="h-9 w-9 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-sm font-bold animate-pulse">
              ⚠️
            </div>
            <div>
              <p className="text-xs font-extrabold text-red-400">Order #{latestOrder.id} has been cancelled by the admin.</p>
              <p className="text-sm font-black text-white mt-1">Reason: {latestOrder.cancel_reason || 'No cancellation reason provided.'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLatestOrderAlert(false)}
            className="p-1.5 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
            title="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <span>Canteen Menu</span>
            <Sparkles className="text-brand-orange animate-pulse" size={20} />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {canOrder
              ? 'Select from our premium freshly cooked items below'
              : 'Browse the full menu. Sign in when you are ready to add items and place an order.'}
          </p>
        </div>

        {/* Search & Filter Toggles */}
        <div className="flex items-center space-x-3 w-full max-w-lg">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search for biryani, burger, drinks..."
              value={search}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-card-border focus:border-brand-orange rounded-2xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                title="Clear Search"
              >
                <X size={16} />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-900 border border-card-border rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto">
                <p className="text-[10px] font-bold text-zinc-500 px-3 py-1 uppercase tracking-wider">Suggestions</p>
                {searchSuggestions.map((item) => (
                  <button
                    key={item.id}
                    onMouseDown={() => {
                      setSearch(item.name);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-white hover:bg-brand-orange/15 hover:text-brand-orange rounded-xl transition-all flex justify-between items-center"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-lg border border-card-border capitalize">{item.availability_status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
              showFilters 
                ? 'bg-brand-orange border-brand-orange text-white shadow-lg' 
                : 'bg-zinc-900 border-card-border text-zinc-400 hover:text-white'
            }`}
            title="Toggle Filters"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* 2. Horizontal Categories Bar */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-4 no-scrollbar border-b border-card-border/60">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`flex items-center space-x-2 shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
            selectedCategoryId === null
              ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20 scale-[1.02]'
              : 'bg-zinc-900 border border-card-border text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <span>🍽️</span>
          <span>All Items</span>
        </button>

        {categories.map((cat) => {
          const icon = categoryIcons[cat.name] || "🍴";
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex items-center space-x-2 shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20 scale-[1.02]'
                  : 'bg-zinc-900 border border-card-border text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span>{icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Dashboard Layout (Filters Sidebar + Food Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar Column */}
        {showFilters && (
          <aside className="lg:col-span-3 glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <SlidersHorizontal size={14} className="text-brand-orange" />
                <span>Advanced Filters</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-brand-orange hover:underline font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Food Type (Veg / Non-Veg) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Diet preference</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsVeg(isVeg === true ? null : true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    isVeg === true
                      ? 'bg-green-500/10 border-green-500 text-green-500'
                      : 'bg-zinc-900 border-card-border text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  🟩 Veg
                </button>
                <button
                  onClick={() => setIsVeg(isVeg === false ? null : false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    isVeg === false
                      ? 'bg-red-500/10 border-red-500 text-red-500'
                      : 'bg-zinc-900 border-card-border text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  🟥 Non-Veg
                </button>
              </div>
            </div>

            {/* Availability status */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Availability</h4>
              <label className="flex items-center space-x-2.5 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="accent-brand-orange rounded border-zinc-700 bg-zinc-900 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</h4>
              <div className="flex flex-col space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    selectedCategoryId === null
                      ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                      : 'bg-zinc-900 border-card-border text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  🍽️ All Items
                </button>
                {categories.map((cat) => {
                  const icon = categoryIcons[cat.name] || "🍴";
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        selectedCategoryId === cat.id
                          ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                          : 'bg-zinc-900 border-card-border text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{icon} {cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing sorting */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sort by price</h4>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setSortBy(sortBy === 'price_asc' ? null : 'price_asc')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                    sortBy === 'price_asc'
                      ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                      : 'bg-zinc-900 border-card-border text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  📉 Price: Low To High
                </button>
                <button
                  onClick={() => setSortBy(sortBy === 'price_desc' ? null : 'price_desc')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                    sortBy === 'price_desc'
                      ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                      : 'bg-zinc-900 border-card-border text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  📈 Price: High To Low
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Food Items list Column */}
        <div className={showFilters ? 'lg:col-span-9' : 'lg:col-span-12'}>
          {loading ? (
            /* Loading Skeleton States */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-panel border border-white/5 bg-zinc-950/20 rounded-3xl p-5 flex flex-row justify-between animate-pulse gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-3 bg-zinc-800 rounded w-1/4" />
                    <div className="h-5 bg-zinc-800 rounded w-2/3" />
                    <div className="h-3 bg-zinc-800 rounded w-1/5" />
                    <div className="h-3 bg-zinc-800 rounded w-4/5" />
                  </div>
                  <div className="w-24 h-24 bg-zinc-800 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* No Results */
            <div className="glass-panel border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-zinc-950/20 py-20">
              <div className="p-4 bg-zinc-900 rounded-full text-zinc-500">
                <HelpCircle size={40} />
              </div>
              <h3 className="text-lg font-bold text-zinc-300">No menu items found</h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                Try widening your filters or resetting the search text to explore matching options.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange-hover transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Food list using Compact Row Design */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => {
                const cartItem = cartItems.find((i) => i.id === item.id);
                const isInCart = !!cartItem;
                const isOutOfStock = !item.is_available || item.availability_status === 'Out Of Stock';
                
                return (
                  <div
                    key={item.id}
                    className={`glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-4 flex flex-row items-center justify-between gap-4 hover:border-brand-orange/20 transition-all ${
                      isOutOfStock ? 'opacity-65' : ''
                    }`}
                  >
                    {/* Left Side: Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Diet preference tag */}
                      <span className="flex items-center space-x-1 text-[10px] font-black uppercase">
                        <span className={`h-2.5 w-2.5 rounded-lg flex items-center justify-center bg-zinc-900/60 border border-white/10`} title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </span>
                        <span className={item.is_veg ? 'text-green-500' : 'text-red-500'}>
                          {item.is_veg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </span>

                      {/* Item Name */}
                      <h3 className="text-lg font-black text-white leading-snug break-words truncate">
                        {item.name}
                      </h3>

                      {/* Price */}
                      <p className="text-base font-black text-brand-orange">
                        ₹{item.price}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {item.description || 'Freshly cooked premium canteen dish.'}
                      </p>
                    </div>

                    {/* Right Side: Image and controls */}
                    <div className="flex-shrink-0 flex flex-col items-center space-y-3">
                      {/* Image Preview - Reduced Size */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden relative border border-white/10 bg-zinc-900 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${
                            isOutOfStock ? 'grayscale opacity-40' : ''
                          }`}
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[8px] font-black text-white bg-red-600 px-1 py-0.5 rounded uppercase">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions / Quantity selector */}
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed uppercase"
                        >
                          Out of Stock
                        </button>
                      ) : canOrder ? (
                        /* Quantity Controls */
                        <div className="flex items-center space-x-1.5">
                          {isInCart ? (
                            /* Sync with cart */
                            <div className="flex items-center bg-zinc-900 border border-card-border rounded-xl p-1">
                              <button
                                onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                                aria-label="Decrease Quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-black text-white px-2.5">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                                aria-label="Increase Quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ) : (
                            /* Card-local state selector & Add button */
                            <div className="flex flex-col items-center space-y-1.5">
                              <div className="flex items-center bg-zinc-900 border border-card-border rounded-xl p-1">
                                <button
                                  onClick={() => setCardQuantities(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1) }))}
                                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                                  aria-label="Decrease Quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-black text-white px-2.5">
                                  {cardQuantities[item.id] || 1}
                                </span>
                                <button
                                  onClick={() => setCardQuantities(prev => ({ ...prev, [item.id]: (prev[item.id] || 1) + 1 }))}
                                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                                  aria-label="Increase Quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <button
                                onClick={() => handleAddToCart(item, cardQuantities[item.id] || 1)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-orange text-white hover:bg-brand-orange-hover hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-brand-orange/10 transition-all flex items-center space-x-1"
                              >
                                <Plus size={12} />
                                <span>Add</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Prompt Sign In */
                        <a
                          href="/auth/signin"
                          className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-zinc-800 text-zinc-400 border border-card-border hover:text-white hover:border-brand-orange/50 transition-all uppercase"
                        >
                          {isAuthenticated ? 'Student Required' : 'Sign In'}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Sticky Green "Order Now" Bottom Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-zinc-950/80 backdrop-blur-md border-t border-card-border animate-fade-in-up">
          <div className="max-w-5xl mx-auto flex items-center justify-between bg-zinc-900 border border-card-border p-4 rounded-2xl shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-500 text-lg font-bold">
                🛒
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-bold">Your Basket</p>
                <p className="text-sm font-black text-white">{cartCount} Items | ₹{cartTotal}</p>
              </div>
            </div>
            <button
              onClick={toggleCart}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2"
            >
              <span>Order Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
