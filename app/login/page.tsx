'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError('Erro ao conectar com o Google.');
    }
  };

  return (
    <div className="min-h-screen bg-studio-black flex flex-col md:flex-row font-sans">
      {/* Lado Esquerdo - Imagem (Oculto no Mobile) */}
      <div className="hidden md:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <Image
          src="/hero-futurista.png"
          alt="Virtual Studio Concept"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-studio-black via-transparent to-transparent"></div>
        <div className="relative z-10 p-12 text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-4 tracking-widest uppercase">Virtual Studio</h1>
          <p className="text-studio-gold tracking-widest text-sm uppercase">A Evolução da sua Imagem</p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-studio-gold/5 via-studio-black to-studio-black pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10 md:hidden">
            <div className="relative w-24 h-24 mx-auto -mb-4">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-widest uppercase">Virtual Studio</h2>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2 font-display uppercase tracking-wider">Acesse sua conta</h2>
            <p className="text-gray-400 text-sm">Bem-vindo de volta à plataforma de excelência visual.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-studio-gold outline-none transition-colors text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Senha</label>
                <Link href="#" className="text-[10px] text-studio-gold hover:underline uppercase tracking-widest">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-studio-gold outline-none transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-studio-gold text-studio-black py-3.5 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-studio-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Entrar na Plataforma <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-8 opacity-60">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ou continue com</span>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black py-3.5 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar com Google
          </button>

          <p className="mt-10 text-center text-xs text-gray-500">
            Ainda não tem uma conta? <Link href="/signup" className="text-studio-gold font-bold hover:underline">Criar conta grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}