'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Mail, Lock, Eye, EyeOff, Github } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Importando a conexão do banco
import { useRouter } from 'next/navigation'; // Para redirecionar após o login

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Estados para capturar o que o usuário digita
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter();

  // A função mágica que fala com o Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage('Erro: E-mail ou senha incorretos.');
      setLoading(false);
    } else {
      setMessage('Acesso liberado! Redirecionando...');
      router.push('/dashboard'); // Agora sim ele vai pra Dashboard do jeito certo!
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0807]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0ZlxuTySbhRbdkystj1YbVuKSrGR8CnvHrkFhMdYY6QiIwmLM0pg8OMeBrDtk7QTM13siCGRA2AvcDxz8jYfSMFXB3VRJpfDkf4nsv-ieO6lhvO2rvcD02gUvsKBkiNY4A8-OTkDJUDFIHTKSJ3XHxzGm09kVtiZRnU9fVbyyUq54y-UYk-YVZYzjs3aV4oQdwuF8D9CuBUuEv-Sw9iFMPjgt1VyIJ2kDy6XqxvZHafMWNoMm0o_UEiWiTNW-dHT_KZ7ihz7mttKb"
          alt="Studio Background"
          fill
          className="object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0807]/80 to-[#0a0807]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-xl border border-studio-gold/10 shadow-2xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="size-16 flex items-center justify-center rounded-full border border-studio-gold/30 bg-background-dark/50 text-studio-gold shadow-[0_0_15px_rgba(195,157,93,0.2)]">
            <Camera size={32} />
          </div>
          <div className="text-center">
            <h1 className="text-white text-2xl font-black leading-tight tracking-wider uppercase italic">VIRTUAL STUDIO</h1>
            <p className="text-slate-400 text-xs font-light tracking-[0.2em] mt-1 uppercase">Creative Excellence</p>
          </div>
        </div>

        {/* Form - Agora com o onSubmit chamando o Supabase */}
        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-widest px-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-studio-gold/50 transition-all text-base"
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-widest px-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-studio-gold/50 transition-all text-base"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          {/* Mensagem de Erro/Sucesso estilizada com a paleta do site */}
          {message && (
            <div className={`p-3 rounded text-sm text-center font-medium ${message.includes('Erro') ? 'text-red-400 bg-red-400/10 border border-red-400/20' : 'text-studio-gold bg-studio-gold/10 border border-studio-gold/20'}`}>
              {message}
            </div>
          )}

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input className="size-4 rounded border-white/20 bg-transparent text-studio-gold focus:ring-studio-gold" type="checkbox" />
              <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">Lembrar de mim</span>
            </label>
            <Link href="/recovery" className="text-studio-gold/80 text-sm font-medium hover:text-studio-gold transition-colors">Esqueceu a senha?</Link>
          </div>

          {/* Submit Button - Mudou de Link falso para Button real */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-studio-gold to-studio-gold-light w-full h-14 rounded-lg text-black font-bold text-base uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(195,157,93,0.3)] mt-2 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-[#120c0a] px-4 text-slate-500">Ou continuar com</span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 h-12 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all">
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="currentColor"></path>
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 h-12 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all">
            <Github size={20} />
            <span className="text-sm font-medium">Github</span>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-slate-500 text-sm">
          Não tem uma conta? <Link href="/signup" className="text-studio-gold font-semibold hover:underline">Solicitar acesso</Link>
        </p>
      </div>
    </div>
  );
}