'use client';

import Link from 'next/link';
import { Camera, Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export default function RecoveryPage() {
  return (
    <div className="bg-studio-black text-slate-100 min-h-screen flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-white/10 bg-studio-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-studio-gold">
              <Camera size={32} />
            </div>
            <h2 className="font-display text-xl font-bold tracking-[0.2em] text-white">VIRTUAL STUDIO</h2>
          </Link>
          <div className="hidden md:block">
            <span className="font-display text-[10px] tracking-[0.3em] text-studio-gold font-medium border border-studio-gold/30 px-4 py-2 rounded-full uppercase">
              CREATIVE EXCELLENCE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Decoration Elements */}
        <div className="absolute top-0 right-0 -z-10 opacity-20 pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-studio-gold/10 blur-[120px]"></div>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 opacity-20 pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full bg-studio-gold/5 blur-[100px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-xl border border-white/10 shadow-2xl">
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl font-medium text-white mb-4 tracking-wide uppercase">Recuperar Senha</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Insira seu e-mail para receber as instruções de redefinição.
              </p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-studio-gold font-semibold" htmlFor="email">
                  E-mail Profissional
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-studio-black border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-studio-gold focus:border-studio-gold transition-all duration-300 outline-none text-sm"
                    id="email"
                    name="email"
                    placeholder="exemplo@estudio1308.com"
                    type="email"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-studio-gold transition-colors" size={20} />
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-studio-gold to-studio-gold-light text-studio-black font-display tracking-widest py-4 rounded-lg font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-studio-gold/10 uppercase text-xs" type="submit">
                <span>ENVIAR INSTRUÇÕES</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            <div className="mt-10 text-center">
              <Link className="text-studio-gold hover:text-studio-gold-light transition-colors text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-2" href="/login">
                <ArrowLeft size={14} />
                Voltar para o Login
              </Link>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-[8px] uppercase tracking-[0.4em]">
              © 2024 VIRTUAL STUDIO. All Rights Reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
