'use client';

import React from 'react';
import Link from 'next/link';
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
  ChefHat 
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

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

  const categories = [
    { name: 'Biryani', icon: '🍛', desc: 'Slow-cooked aromatic basmati rice layering spices & meat.', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80' },
    { name: 'Burgers', icon: '🍔', desc: 'Sizzling juicy patties loaded with rich melted cheese.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
    { name: 'Breakfast', icon: '🥞', desc: 'Crispy warm dosas and steamed soft fluffy idlis.', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80' },
    { name: 'Mocktails', icon: '🍹', desc: 'Chilled bubbly blends of fresh citrus, mint, and soda.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80' }
  ];

  const specialtyItems = [
    { name: 'ZEST Special Chicken Biryani', price: '₹180', rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80' },
    { name: 'Crunchy Double Cheese Burger', price: '₹110', rating: 4.8, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
    { name: 'Rich Oreo Milkshake', price: '₹80', rating: 4.7, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=300&auto=format&fit=crop&q=80' }
  ];

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
              <span className="text-gradient">ZEST Canteen</span>
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
                href="#menu-preview"
                className="px-8 py-4 glass-panel border border-card-border text-white text-base font-bold rounded-2xl flex items-center justify-center space-x-2 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                <span>Explore Menu</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-card-border/50 max-w-md">
              <div>
                <p className="text-2xl font-bold text-white">07:30 AM</p>
                <p className="text-xs text-zinc-500">Opens Daily</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">06:00 PM</p>
                <p className="text-xs text-zinc-500">Closes Daily</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12+</p>
                <p className="text-xs text-zinc-500">Categories</p>
              </div>
            </div>
          </motion.div>

          {/* Graphical/Illustrative Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Visual Frame */}
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
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORIES & MENU PREVIEW */}
      <section id="menu-preview" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/40 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Menu Specialties
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Explore some of our most trending food items across popular campus canteen categories. Made fresh daily with curated recipes.
            </p>
          </div>

          {/* Categories Horizontal Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.name}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group relative h-72 rounded-3xl overflow-hidden glass-panel border border-white/5 shadow-lg flex flex-col justify-between p-6"
              >
                {/* Background Image with Hover Effect */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                </div>

                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-[10px] font-bold tracking-widest text-brand-orange uppercase bg-brand-orange/10 px-2 py-0.5 rounded-full">
                    POPULAR
                  </span>
                </div>

                <div className="relative z-10 space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Specialties items Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {specialtyItems.map((item) => (
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
                    {item.price}
                  </span>
                </div>
                <div className="space-y-2 px-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-white line-clamp-1">{item.name}</h4>
                    <div className="flex items-center text-brand-yellow space-x-1">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold text-white">{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">A campus favorite crafted with high-quality ingredients.</p>
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
                  <p>07:30 AM - 06:00 PM</p>
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
