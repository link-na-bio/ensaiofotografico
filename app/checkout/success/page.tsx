'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  CheckCircle,
  Download,
  Receipt,
  ZoomIn,
  Brush,
  Sparkles,
  Instagram,
  Home,
  ArrowRight // <- A NOSSA SETA AGORA ESTÁ AQUI!
} from 'lucide-react';
import { motion } from 'motion/react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  const [pedido, setPedido] = useState<any>(null);
  const [qtdFotos, setQtdFotos] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const { data } = await supabase.from('pedidos').select('*').eq('id', orderId).single();
      if (data) {
        setPedido(data);
        const pkgNome = data.pacote?.toLowerCase() || '';
        const isLegacy = !pkgNome.includes('dinamico_') && !pkgNome.includes('sazonal');
        if (!isLegacy) {
          setQtdFotos(data.estilos?.length || 1);
        } else {
          setQtdFotos(pkgNome.includes('elite') ? 50 : pkgNome.includes('premium') ? 25 : pkgNome.includes('essencial') ? 10 : 1);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="bg-studio-black text-slate-100 font-sans min-h-screen flex flex-col selection:bg-studio-gold selection:text-studio-black">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-studio-gold/10 px-6 md:px-20 py-5 bg-studio-black/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-4 text-studio-gold">
          <div className="relative w-8 h-8"><Image src="/logo.2.png" alt="Virtual Studio" fill className="object-contain" /></div>
          <h2 className="text-slate-100 text-sm font-bold tracking-[0.2em] uppercase font-display hidden sm:block">VIRTUAL STUDIO</h2>
        </Link>
        <div className="flex justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-9">
            <Link className="text-slate-400 hover:text-studio-gold text-[10px] font-bold uppercase tracking-widest transition-colors" href="/dashboard">Meu Painel</Link>
            <Link className="text-slate-400 hover:text-studio-gold text-[10px] font-bold uppercase tracking-widest transition-colors" href="mailto:suporte@virtualstudio.click">Suporte</Link>
          </nav>
          <button onClick={() => router.push('/dashboard')} className="bg-white/5 border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
            <Home size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Success Header */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center gap-6 mb-16">
          <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase font-display bg-gradient-to-r from-studio-gold via-studio-gold-light to-studio-gold bg-clip-text text-transparent">Comprovativo Enviado!</h1>
            <p className="text-gray-400 text-sm font-light max-w-lg mx-auto leading-relaxed">
              Recebemos o seu comprovativo com sucesso. A nossa equipa financeira está a analisar e, em instantes, o seu ensaio será libertado na sua galeria.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => router.push('/dashboard')} className="bg-studio-gold hover:bg-studio-gold-light text-studio-black px-8 py-3 rounded-lg font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-2 font-display">
              Ir para o Meu Painel <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Plan Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 border border-studio-gold/20 bg-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group rounded-2xl">
            <div className="absolute inset-0 bg-studio-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 space-y-4 text-center md:text-left w-full">
              <div>
                <p className="text-studio-gold text-[10px] font-bold uppercase tracking-widest mb-1">Resumo da Aquisição</p>
                <h3 className="text-2xl font-bold text-slate-100 font-display uppercase">{pedido?.pacote ? pedido.pacote.replace('dinamico_', 'Pack ') : 'Seu Ensaio'}</h3>
              </div>
              <ul className="text-gray-400 text-xs space-y-3 uppercase tracking-widest">
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <CheckCircle size={16} className="text-emerald-500" />
                  {qtdFotos > 0 ? `${qtdFotos} Foto(s) de Alta Resolução` : 'Fotos em Alta Resolução (TIFF/JPG)'}
                </li>
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Direção de Arte com Inteligência Artificial
                </li>
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Curadoria e Retoque Humano
                </li>
              </ul>
            </div>
          </div>

          {/* Receipt Sidebar */}
          <div className="border border-white/10 bg-white/5 p-8 flex flex-col justify-between rounded-2xl">
            <div className="space-y-4">
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest border-b border-white/10 pb-3">Detalhes da Transação</h4>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 uppercase tracking-widest font-bold">ID do Pedido</span>
                  <span className="text-gray-300">#{orderId ? orderId.slice(0, 8).toUpperCase() : 'AGUARDE'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 uppercase tracking-widest font-bold">Status</span>
                  <span className="text-blue-400 font-bold uppercase">Em Análise</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">Você será notificado assim que as fotos estiverem prontas para download.</p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <div className="border-t border-white/10 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white uppercase tracking-widest font-display">O que acontece agora?</h4>
            <div className="space-y-4">
              <div className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-studio-gold"><Sparkles size={24} /></div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Aprovação Financeira</h5>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest leading-relaxed">A nossa equipa vai validar o PIX enviado. É muito rápido.</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-emerald-500"><Download size={24} /></div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Libertação da Galeria</h5>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest leading-relaxed">As suas fotos ficarão imediatamente disponíveis na aba "Meus Ensaios".</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white uppercase tracking-widest font-display">Siga o Virtual Studio</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Acompanhe as novidades, dicas de posicionamento de imagem e novos estilos exclusivos que adicionamos todas as semanas no nosso Instagram.</p>
            <div className="flex gap-4">
              <Link className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-studio-gold hover:text-studio-black transition-all" href="https://www.instagram.com/virtualstudio.click/" target="_blank">
                <Instagram size={20} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 px-6 md:px-20 text-center">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em]">© 2026 VIRTUAL STUDIO. A NOVA ERA DA FOTOGRAFIA.</p>
      </footer>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-studio-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}