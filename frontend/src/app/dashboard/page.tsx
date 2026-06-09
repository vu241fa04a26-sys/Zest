'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Plus, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

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
  const { isAuthenticated, user } = useAuthStore();
  const canOrder = isAuthenticated && user?.role !== 'admin';

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isVeg, setIsVeg] = useState<boolean | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [mealTag, setMealTag] = useState<string | null>(null); // "breakfast", "lunch", "dinner"
  const [sortBy, setSortBy] = useState<string | null>(null); // "price_asc", "price_desc"
  
  // Feedback states
  const [addedItemIds, setAddedItemIds] = useState<Record<number, boolean>>({});

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/menu/categories');
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
          setCategories(data);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Items based on filters
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId !== null) params.append('category_id', selectedCategoryId.toString());
      if (isVeg !== null) params.append('is_veg', isVeg.toString());
      if (availableOnly) params.append('is_available', 'true');
      if (mealTag !== null) params.append('meal_tag', mealTag);
      if (search) params.append('search', search);
      if (sortBy) params.append('sort_by', sortBy);

      const res = await fetch(`http://localhost:8000/api/menu/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error('Failed to load menu items', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, isVeg, availableOnly, mealTag, search, sortBy]);

  // Debounced search / trigger fetching on filter change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchItems]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.is_veg
    });

    // Provide temporary visual feedback on card
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
  };

  const resetFilters = () => {
    setIsVeg(null);
    setAvailableOnly(false);
    setMealTag(null);
    setSortBy(null);
    setSearch('');
    setSelectedCategoryId(null);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-8">
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

        {/* Instant Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search for biryani, burger, drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-card-border focus:border-brand-orange rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
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

          {/* Meal Timing (Breakfast, Lunch, Dinner) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Meal tags</h4>
            <div className="flex flex-col space-y-2">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                const tagValue = meal.toLowerCase();
                return (
                  <button
                    key={meal}
                    onClick={() => setMealTag(mealTag === tagValue ? null : tagValue)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                      mealTag === tagValue
                        ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                        : 'bg-zinc-900 border-card-border text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {meal}
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

        {/* Food Items Grid Column */}
        <div className="lg:col-span-9">
          {loading ? (
            /* Loading Skeleton States */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-panel border border-white/5 bg-zinc-950/20 rounded-3xl p-4 space-y-4 animate-pulse">
                  <div className="aspect-[4/3] bg-zinc-800 rounded-2xl" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-4/5" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-zinc-800 rounded w-1/4" />
                    <div className="h-9 bg-zinc-800 rounded-xl w-1/3" />
                  </div>
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
            /* Food Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((item) => {
                const isItemAdded = addedItemIds[item.id];
                const isOutOfStock = !item.is_available || item.availability_status === 'Out Of Stock';
                const isLimitedStock = item.availability_status === 'Limited Stock';
                
                return (
                  <div
                    key={item.id}
                    className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-4 space-y-4 hover:scale-[1.01] hover:border-brand-orange/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-zinc-900">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${
                            isOutOfStock ? 'opacity-40 grayscale' : ''
                          }`}
                        />
                        {/* Veg / Non-Veg Indicator */}
                        <span
                          className={`absolute top-3 left-3 h-5 w-5 rounded-lg flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm border border-white/10`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </span>

                        {/* Availability Tag overlay */}
                        {isOutOfStock ? (
                          <span className="absolute top-3 right-3 bg-red-600/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-xl shadow-lg">
                            OUT OF STOCK
                          </span>
                        ) : isLimitedStock ? (
                          <span className="absolute top-3 right-3 bg-amber-500/90 text-zinc-950 font-bold text-[10px] px-2.5 py-1 rounded-xl shadow-lg">
                            LIMITED STOCK
                          </span>
                        ) : null}
                      </div>

                      {/* Header details */}
                      <div className="mt-3.5 space-y-1">
                        <h4 className="text-base font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed min-h-[32px]">
                          {item.description || 'No description available.'}
                        </p>
                      </div>
                    </div>

                    {/* Footer price & action */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-card-border/50">
                      <span className="text-lg font-black text-white">₹{item.price}</span>
                      
                      {canOrder ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={isOutOfStock}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                            isOutOfStock
                              ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'
                              : isItemAdded
                              ? 'bg-green-500 text-white hover:bg-green-600 scale-[0.98]'
                              : 'bg-brand-orange text-white hover:bg-brand-orange-hover hover:scale-[1.02] shadow-md shadow-brand-orange/10'
                          }`}
                        >
                          {isItemAdded ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <a
                          href="/auth/signin"
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-300 border border-card-border hover:text-white hover:border-brand-orange/50 transition-all"
                        >
                          {isAuthenticated ? 'Student login required' : 'Sign in to order'}
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
    </div>
  );
}
