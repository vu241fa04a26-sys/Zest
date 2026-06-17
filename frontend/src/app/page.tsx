'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Coffee, 
  UtensilsCrossed, 
  ChefHat,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { API_BASE_URL } from '@/config';

const categoryMeta: Record<string, { icon: string; desc: string; image: string }> = {
  "Breakfast": { icon: "🥞", desc: "Crispy warm dosas and steamed soft fluffy idlis.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80" },
  "Rice": { icon: "🍚", desc: "Tangy tomato rice, curd rice, and quick daily rice bowls.", image: "https://images.unsplash.com/photo-1603133872878-685f588c7a9a?w=300&auto=format&fit=crop&q=80" },
  "Noodles": { icon: "🍝", desc: "Spicy wok-tossed noodles with colorful julienned veggies.", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80" },
  "Biryani": { icon: "🍛", desc: "Slow-cooked aromatic basmati rice layering spices & meat.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80" },
  "Burgers": { icon: "🍔", desc: "Sizzling juicy patties loaded with rich melted cheese.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80" },
  "Pizza": { icon: "🍕", desc: "Golden bubbly crust loaded with marinara, veggies, and cheese.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80" },
  "Sandwiches": { icon: "🥪", desc: "Grilled double-decker sandwiches and toasted wraps.", image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&auto=format&fit=crop&q=80" },
  "Shawarma": { icon: "🌯", desc: "Spiced roasted chicken wrapped inside thin rumali rotis.", image: "https://images.unsplash.com/photo-1642683215891-37835150efb0?w=300&auto=format&fit=crop&q=80" },
  "Starters": { icon: "🍟", desc: "Crispy Gobi 65, Chilli Paneer, and classic dry appetizers.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80" },
  "Juices": { icon: "🥤", desc: "Freshly squeezed cooling juices and healthy ABC juices.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&auto=format&fit=crop&q=80" },
  "Milkshakes": { icon: "🥛", desc: "Rich Oreo, Belgium Chocolate, and dense thick shakes.", image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=300&auto=format&fit=crop&q=80" },
  "Mocktails": { icon: "🍹", desc: "Chilled bubbly blends of fresh citrus, mint, and soda.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80" }
};

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();

  // Categories & Specialties States
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [specialtiesTitle, setSpecialtiesTitle] = useState('Menu Specialties');
  const [specialtiesItems, setSpecialtiesItems] = useState<any[]>([]);

  // Embedded Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const resCats = await fetch(`${API_BASE_URL}/api/menu/categories`);
        if (resCats.ok) {
          const dataCats = await resCats.json();
          if (dataCats.length > 0) setCategoriesList(dataCats);
        }
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      }

      try {
        const resTitle = await fetch(`${API_BASE_URL}/api/menu/settings/specialties_title`);
        if (resTitle.ok) {
          const dataTitle = await resTitle.json();
          if (dataTitle.value) setSpecialtiesTitle(dataTitle.value);
        }
      } catch (e) {
        console.error('Failed to fetch specialties title:', e);
      }

      try {
        const resSpecialties = await fetch(`${API_BASE_URL}/api/menu/specialties`);
        if (resSpecialties.ok) {
          const dataSpecs = await resSpecialties.json();
          if (dataSpecs.length > 0) {
            setSpecialtiesItems(dataSpecs);
          }
        }
      } catch (e) {
        console.error('Failed to fetch specialties:', e);
      }
    };

    fetchHomeData();
  }, []);

  // Set default categories & specialties if API returns empty
  const activeCategories = categoriesList.length > 0 ? categoriesList : [
    { id: 1, name: 'Biryani' },
    { id: 2, name: 'Burgers' },
    { id: 3, name: 'Breakfast' },
    { id: 4, name: 'Mocktails' }
  ];

  const activeSpecialties = specialtiesItems.length > 0 ? specialtiesItems : [
    { name: 'ZEST Special Chicken Biryani', price: 180, rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80' },
    { name: 'Crunchy Double Cheese Burger', price: 110, rating: 4.8, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
    { name: 'Rich Oreo Milkshake', price: 80, rating: 4.7, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=300&auto=format&fit=crop&q=80' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Incorrect email or password.');
      }

      login(
        data.access_token,
        data.refresh_token,
        data.id,
        data.email,
        data.name,
        data.role,
        rememberMe
      );

      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setLoginError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoginLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-zinc-950">
        {/* Burst Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950 to-zinc-950" />
        
        {/* Soft Background Orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Text block */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-left space-y-6 sm:space-y-8"
          >
            {/* Cloche Header Tag */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full glass-panel border border-brand-orange/20 bg-brand-orange/5">
              <ChefHat size={16} className="text-brand-orange animate-pulse" />
              <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">Most Happening Place</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Taste The Magic at <br />
              <span className="text-gradient">MHP</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-xl font-normal leading-relaxed">
              Experience the ultimate campus dining. Skip the long lines, browse premium chef recommendations, and order your favorites with lightning-fast real-time queue tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-brand-orange text-white text-base font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Order Now</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 glass-panel border border-card-border text-white text-base font-bold rounded-2xl flex items-center justify-center space-x-2 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                <span>Explore Menu</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-card-border/50 max-w-md">
              <div>
                <p className="text-2xl font-bold text-white">07:00 AM</p>
                <p className="text-xs text-zinc-500">Opens Daily</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">05:30 PM</p>
                <p className="text-xs text-zinc-500">Closes Daily</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12+</p>
                <p className="text-xs text-zinc-500">Categories</p>
              </div>
            </div>
          </motion.div>

          {/* Graphical/Illustrative Panel OR Embedded Sign In Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {isAuthenticated ? (
              /* Visual Frame */
              <div className="relative w-full max-w-md aspect-square rounded-[3rem] overflow-hidden glass-panel border border-white/10 shadow-2xl p-4 flex flex-col justify-between">
                {/* Top highlights */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-zinc-400">Spread Food Vibes ✨</span>
                  <div className="flex space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow" />
                  </div>
                </div>

                {/* Main Food Image */}
                <div className="my-6 relative flex-1 rounded-[2rem] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
                    alt="Special Chicken Biryani"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-xs font-bold text-brand-yellow tracking-widest uppercase mb-1">CHEF RECOMMENDATION</span>
                    <h3 className="text-xl font-bold text-white">ZEST Special Chicken Biryani</h3>
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">Our signature aromatic basmati rice cooked with succulent chicken and rich spices.</p>
                  </div>
                </div>

                {/* Floating Card */}
                <div className="flex items-center justify-between bg-zinc-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold">
                      🔥
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Trending on Campus</h4>
                      <p className="text-[10px] text-zinc-400">120+ students ordered today</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-lg">₹180</span>
                </div>
              </div>
            ) : (
              /* Embedded Sign In form */
              <div className="relative w-full max-w-md bg-zinc-900/60 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
                <div className="text-center space-y-1.5">
                  <h3 className="text-2xl font-black text-white tracking-tight">Sign In</h3>
                  <p className="text-xs text-zinc-400">Access your college canteen ordering dashboard</p>
                </div>
                {loginError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-center font-semibold">
                    {loginError}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="relative group">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-10 py-3 text-xs text-white focus:outline-none transition-all placeholder-transparent"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                      <Mail size={14} />
                    </span>
                    <label className="absolute left-10 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                      College Email Address
                    </label>
                  </div>
                  {/* Password */}
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-10 py-3 text-xs text-white focus:outline-none transition-all placeholder-transparent"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                      <Lock size={14} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <label className="absolute left-10 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                      Password
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-[10px] text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-brand-orange rounded border-zinc-700 bg-zinc-950 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                      />
                      <span>Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-[10px] font-semibold text-brand-orange hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loginLoading ? (
                      <span className="border-2 border-white border-t-transparent animate-spin rounded-full h-4 w-4" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
                <p className="text-center text-[10px] text-zinc-500">
                  Don't have an account yet?{' '}
                  <Link href="/auth/signup" className="font-semibold text-brand-orange hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORIES & MENU PREVIEW */}
      <section id="menu-preview" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/40 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {specialtiesTitle}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Explore some of our most trending food items across popular campus canteen categories. Made fresh daily with curated recipes.
            </p>
          </div>



          {/* Specialties items Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {activeSpecialties.map((item) => (
              <div 
                key={item.name}
                className="glass-panel border border-white/5 bg-zinc-950/40 rounded-3xl p-4 space-y-4 hover:scale-[1.01] hover:border-brand-orange/30 transition-all"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md text-brand-orange px-3 py-1 text-sm font-extrabold rounded-xl border border-white/5">
                    ₹{item.price}
                  </span>
                </div>
                <div className="space-y-2 px-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-white line-clamp-1">{item.name}</h4>
                  </div>
                  <p className="text-xs text-zinc-500">{item.description || "A campus favorite crafted with high-quality ingredients."}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-brand-orange text-white text-base font-bold rounded-2xl hover:bg-brand-orange-hover shadow-lg shadow-brand-orange/20 transition-all hover:scale-[1.02]"
            >
              <span>View Full Menu</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. INFORMATION SECTION & DETAILS */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* About Zest text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-orange uppercase tracking-widest">About ZEST</span>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">
                Crafting Culinary Smiles & Campus Food Vibes
              </h2>
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed font-normal">
              ZEST is more than just a college canteen. We are the culinary heart of your campus, committed to serving delicious, high-quality, and nutritious meals to fuel your academic journey. Our kitchen matches hygiene safety standards with gourmet startup recipes.
            </p>

            {/* Core Pillars */}
            <div className="space-y-4">
              {[
                { title: 'Hygienic Preparation', desc: 'Sourced from local farms, cooked in ultra-clean conditions.' },
                { title: 'Queue-Free System', desc: 'Order from class and collect when ready. No cash hassle.' },
                { title: 'Fresh Ingredients Only', desc: '100% natural, fresh juices, and home-blended spices.' }
              ].map((pillar) => (
                <div key={pillar.title} className="flex items-start space-x-3">
                  <CheckCircle2 className="text-brand-orange shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-white">{pillar.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hours & Contact */}
            <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-zinc-900/30 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-brand-orange">
                  <Clock size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Canteen Hours</span>
                </div>
                <div className="text-zinc-300 text-xs space-y-1">
                  <p className="font-semibold text-white">Monday - Saturday</p>
                  <p>07:00 AM - 05:30 PM</p>
                  <p className="text-zinc-500">Sunday: Closed</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-brand-orange">
                  <Phone size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Contact Details</span>
                </div>
                <div className="text-zinc-300 text-xs space-y-1">
                  <p className="font-semibold text-white">Call/Email Support</p>
                  <p className="flex items-center space-x-1">
                    <span>📞</span> <span>+91 98765 43210</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <span>✉️</span> <span className="underline">support@zestcanteen.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Embedded Map */}
          <div id="contact" className="space-y-6 lg:pl-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-brand-orange">
                <MapPin size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Canteen Address</span>
              </div>
              <p className="text-sm font-bold text-white">
                Vignan University, Vadlamudi, Guntur District, Andhra Pradesh
              </p>
            </div>

            {/* Google Map Widget */}
            <div className="h-96 w-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative">
              <iframe
                title="Google Maps Canteen Location"
                src="https://www.google.com/maps?q=Vignan%20University%20Vadlamudi%20Guntur%20Andhra%20Pradesh&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-card-border/60 text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <UtensilsCrossed size={18} className="text-brand-orange" />
          <span className="font-extrabold text-white tracking-widest text-sm uppercase">ZEST CANTEEN</span>
        </div>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
          &copy; {new Date().getFullYear()} ZEST Canteen Ordering Platform. All rights reserved. Built for seamless campus dining.
        </p>
      </footer>
    </div>
  );
}
