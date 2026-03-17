'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  Search,
  ChevronDown,
  User,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Bitcoin,
  Apple,
  Lock
} from 'lucide-react';

export default function GalleryPreview() {
  return (
    <div className="bg-studio-black text-gray-200 font-sans selection:bg-studio-gold selection:text-studio-black min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-studio-black/90 backdrop-blur-md border-b border-studio-gold/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 border border-studio-gold flex items-center justify-center">
              <span className="font-display text-studio-gold text-xl font-bold">1308</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-display tracking-widest uppercase">Photo Studio</span>
              <span className="text-[10px] text-studio-gold/60 uppercase tracking-tighter">Professional AI Photography</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-[10px] font-medium uppercase tracking-[0.2em]">
            <Link className="hover:text-studio-gold transition-colors" href="#">Portfolio</Link>
            <Link className="text-studio-gold" href="#">Gallery Preview</Link>
            <Link className="hover:text-studio-gold transition-colors" href="#">Pricing</Link>
            <Link className="hover:text-studio-gold transition-colors" href="#">Contact</Link>
          </nav>
          <div className="flex items-center space-x-6">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Logged in as</p>
              <p className="text-xs font-semibold">User_0722</p>
            </div>
            <button className="p-2 border border-white/10 rounded-full hover:border-studio-gold/50 transition-colors">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery Section */}
        <section className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display uppercase tracking-widest mb-2">Collection Preview</h1>
              <p className="text-studio-gold/60 text-sm italic">AI Generated Masterpieces • Session #1092</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400">
              <span>Sort by:</span>
              <select className="bg-transparent border-none focus:ring-0 text-studio-gold cursor-pointer py-0 text-[10px] uppercase font-bold tracking-widest">
                <option>Latest</option>
                <option>Relevance</option>
              </select>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {[
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBRSDpidAELCqPsuvVz6mze83q0QCEjBRCyknknV4m2y9LNhG5PyYG8i5o1Qq3uZZKbd4RLec9hCGV_CX8jFdLHlyY7NPdifrqYAEn9lHHWBH1zNW2eF600mZlWaLzJ2fuSGYaorM0i3NnK2sq283PxGCAwOoFBJltlRzffDm6pVFwaKH0rRg8JHHO0QPx1PdZ9L9g0W2otv8dqOg8k5U29uo3tZ2_A_lh2PdDR3Gn_ocMdnnoE5YeTOQ4loLPCNiG96aW-Jyn72vPx',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDE_g0PuNR4mLuqmn3ub_r5mYSj5dHKZWel5uUp0B63spOP9V1YhVO-Wz5C7fchCcoF9JocbQe9_iKBFVZTJz30kHpCpuhBM1-D_dQL-v4N62dC33FjYFU8envFX9Nq-5BbN-SYd7yPDq39NJGeY2AdxHiLAdoqom4QRJBw5FC8Okhp9jo4gW-_lPcBSaM4YWnoGcof8uwojUNz1iVTWqaKrnx1rGQnpNrIG-kV1kPpN0Gc4v-ORkTVtpPNbvF62MLB2KNcWuyeGMrf',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDtAttbSTSTMKCbyA5dr8rBtxl1vH0pp3MV3MZ3LLwmEVK0MKvG8m8kFBk_QT2wFal_EyKY6m-E4gljuTPnVLMOavtVRBFm5XoGUEW6O2RnscX1uKtHArVz1z9OJMPr4AF3hKwUtuuj_iuBc7TkfTa0330Yu_6Yn9yUsxPQt_61mCFizCvd31yV647mYsmaOpFQYweczMAH7anpUZQq3mFHZkeJQx8ID00YpOqQTl-v09yKmNlKOee_ymqkWcrVioICcrVHRF6t4CjD',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuD-xZaaXE0wSQHF3YNlzeuqqwfMXTHpLXYG0ZLpoqhzMXmwbB83bH0hWJmPgQ_QFB3WWDURol_Ivifat5iJHcG0co899h3IDQoY3dr9q90tQz_QXyM4hOkKrf55wAJNPSaRt4xJmrS1ANgaV0CnAsfV_419ABfB1PRznG6dktwEQviTqt_30XXSCouxOLgZ84NrdGqYUD8P4VzKy8e13UiPRVeHw19sSip2OYHCnGug8NSdLR20cGeBcJoo6tyBBmPMhcEedXYMpFwN'
            ].map((img, i) => (
              <div key={i} className="relative group aspect-[3/4] overflow-hidden border border-white/5 bg-[#0e0d0a]">
                <Image
                  src={img}
                  alt="AI Photography Preview"
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                  <span className="font-display text-4xl text-studio-gold/20 -rotate-45 uppercase tracking-[0.5em] select-none">PHOTO 1308</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/5 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-widest text-studio-gold border border-studio-gold/20">
                  Preview_0{i + 1}.png
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Checkout Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Tier Selection */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-sm space-y-6 border border-studio-gold/10">
            <h3 className="font-display text-xl uppercase tracking-widest text-studio-gold text-center">Select Your Membership</h3>
            <div className="space-y-4">
              {[
                { id: 'silver', label: 'Silver Tier', price: '$49', desc: '10 High-Res Photos' },
                { id: 'gold', label: 'Gold Member', price: '$99', desc: '25 High-Res Photos', popular: true },
                { id: 'elite', label: 'Elite Access', price: '$149', desc: '50 High-Res Photos' }
              ].map((tier) => (
                <label key={tier.id} className="block relative cursor-pointer group">
                  <input type="radio" name="tier" className="peer sr-only" defaultChecked={tier.id === 'gold'} />
                  <div className="p-4 border border-white/10 peer-checked:border-studio-gold transition-all duration-300 hover:bg-white/5 relative overflow-hidden">
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-studio-gold text-studio-black text-[8px] font-bold px-2 py-0.5 uppercase tracking-tighter">Most Popular</div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">{tier.desc}</p>
                        <p className="font-display text-lg uppercase">{tier.label}</p>
                      </div>
                      <p className="font-display text-xl text-studio-gold">{tier.price}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#0e0d0a] border border-studio-gold/10 p-8 space-y-6">
            <h3 className="font-display text-lg uppercase tracking-widest">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Package</span>
                <span className="text-white uppercase tracking-wider text-[10px]">Gold Member (25 Units)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Tax</span>
                <span className="text-white uppercase tracking-wider text-[10px]">$0.00</span>
              </div>
              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <span className="text-studio-gold font-display uppercase text-base">Total Amount</span>
                <span className="text-white font-display text-2xl">$99.00</span>
              </div>
            </div>
            <Link href="/checkout/success" className="w-full py-4 bg-gradient-to-br from-studio-gold to-[#a68144] text-studio-black font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2 group hover:brightness-110 transition-all shadow-lg shadow-studio-gold/20">
              Checkout Now
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="pt-6 flex flex-wrap justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <CreditCard size={24} />
              <Apple size={24} />
              <Bitcoin size={24} />
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Lock size={12} />
              <span className="text-[10px] uppercase tracking-widest">SSL Secured Payment Gateway</span>
            </div>
          </div>

          {/* Important Notice */}
          <div className="p-6 border border-white/5 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-studio-gold font-bold">Important Notice</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              High-resolution downloads are provided in 300 DPI PNG format immediately after payment. Watermarks will be removed automatically upon license acquisition. All sales are final due to the digital nature of the product.
            </p>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 py-12 bg-[#0e0d0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-8">
          <div className="w-12 h-12 border border-studio-gold/30 flex items-center justify-center opacity-50">
            <span className="font-display text-studio-gold text-lg">1308</span>
          </div>
          <div className="flex space-x-8 text-[10px] uppercase tracking-[0.2em] text-gray-500">
            <Link className="hover:text-studio-gold transition-colors" href="#">Privacy Policy</Link>
            <Link className="hover:text-studio-gold transition-colors" href="#">Terms of Service</Link>
            <Link className="hover:text-studio-gold transition-colors" href="#">Commercial Licensing</Link>
          </div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            © 2024 VIRTUAL STUDIO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
