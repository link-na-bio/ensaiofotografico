'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Mail, Lock, Eye, EyeOff, User, Github } from 'lucide-react';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0f0a08]">
      <div className="w-full max-w-[480px] flex flex-col gap-8">
        {/* Header / Logo Section */}
        <header className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-tr from-studio-gold to-studio-gold-light p-0.5">
            <div className="bg-[#0f0a08] w-full h-full rounded-full flex items-center justify-center">
              <Camera className="text-studio-gold" size={32} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-widest text-white uppercase font-display">VIRTUAL STUDIO</h1>
            <p className="text-studio-gold/80 text-sm font-medium tracking-[0.3em] mt-1 uppercase">Creative Excellence</p>
          </div>
        </header>

        {/* Registration Form */}
        <main className="bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm shadow-2xl">
          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 text-white focus:border-studio-gold focus:ring-1 focus:ring-studio-gold outline-none transition-all placeholder:text-slate-600"
                  placeholder="Digite seu nome completo"
                  type="text"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 text-white focus:border-studio-gold focus:ring-1 focus:ring-studio-gold outline-none transition-all placeholder:text-slate-600"
                  placeholder="exemplo@estudio1308.com"
                  type="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-12 text-white focus:border-studio-gold focus:ring-1 focus:ring-studio-gold outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-studio-gold transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 mt-2">
              <div className="flex items-center h-5">
                <input className="w-4 h-4 rounded border-white/20 bg-white/5 text-studio-gold focus:ring-studio-gold focus:ring-offset-[#0f0a08]" id="terms" type="checkbox" />
              </div>
              <label className="text-sm text-slate-400 leading-tight" htmlFor="terms">
                Eu concordo com os <Link className="text-studio-gold hover:underline" href="#">Termos de Uso</Link> e <Link className="text-studio-gold hover:underline" href="#">Política de Privacidade</Link>.
              </label>
            </div>

            {/* Main Action Button */}
            <Link href="/dashboard" className="w-full bg-studio-gold hover:bg-studio-gold-light text-studio-black font-bold py-4 rounded-lg shadow-lg shadow-studio-gold/20 transition-all uppercase tracking-widest mt-4 text-center">
              Criar Conta
            </Link>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Ou continue com</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-lg transition-all text-white">
              <svg className="size-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="currentColor"></path>
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-lg transition-all text-white">
              <Github size={20} />
              <span className="text-sm font-medium">Github</span>
            </button>
          </div>
        </main>

        {/* Bottom Link */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Já tem uma conta?
            <Link className="text-studio-gold font-bold hover:underline ml-1" href="/login">Fazer Login</Link>
          </p>
        </div>

        {/* Footer Links */}
        <footer className="mt-8 flex justify-center gap-6">
          <Link className="text-[10px] font-bold tracking-[0.2em] text-slate-600 hover:text-studio-gold transition-colors uppercase" href="#">Privacidade</Link>
          <Link className="text-[10px] font-bold tracking-[0.2em] text-slate-600 hover:text-studio-gold transition-colors uppercase" href="#">Termos de Uso</Link>
          <Link className="text-[10px] font-bold tracking-[0.2em] text-slate-600 hover:text-studio-gold transition-colors uppercase" href="#">Suporte</Link>
        </footer>
      </div>
    </div>
  );
}
