'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Camera, Star, ArrowRight, Loader2, Instagram, Mail, MessageCircle, ShieldCheck, LayoutDashboard, Cloud, Check, Download } from 'lucide-react';
import { galleryData } from './data';
import SalesNotification from '@/components/SalesNotification';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [styles, setStyles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStyles, setSelectedStyles] = useState<any[]>([]);

  const toggleStyle = (style: any) => {
    setSelectedStyles(prev => {
      const isSelected = prev.find(s => s.id === style.id);
      if (isSelected) {
        return prev.filter(s => s.id !== style.id);
      } else {
        return [...prev, style];
      }
    });
  };

  const getWhatsAppLink = () => {
    const names = selectedStyles.map(s => s.titulo).join(', ');
    const text = `Olá! Escolhi estes estilos no catálogo: ${names}. Gostaria de saber mais sobre como fazer meu ensaio.`;
    return `https://wa.me/556193314473?text=${encodeURIComponent(text)}`;
  };

  useEffect(() => {
    // Utilize static data instead of fetching from Supabase
    setStyles(galleryData);
    const uniqueCategories = Array.from(new Set(galleryData.map((s: any) => s.categoria))).filter(Boolean) as string[];
    setCategories(['Todos', ...uniqueCategories]);
    setIsLoading(false);
  }, []);

  const filteredItems = activeCategory === 'Todos'
    ? styles
    : styles.filter(item => item.categoria === activeCategory);

  return (
    <div className="min-h-screen bg-studio-black text-white font-sans flex flex-col">
      {/* Header Fixo */}
      <header className="fixed top-0 w-full z-50 bg-studio-black/80 backdrop-blur-md py-4 border-b border-white/5">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group text-gray-400 hover:text-studio-gold transition">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
            <span className="uppercase tracking-widest text-xs font-display">Voltar para Home</span>
          </Link>
          <div className="relative w-[200px] h-[200px] -my-[80px] flex items-center justify-center z-10 pointer-events-none">
            <Image src="/logo.2.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
          </div>
          <a href="https://wa.me/556193314473?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20ensaios%20VIP%20pelo%20WhatsApp." target="_blank" rel="noopener noreferrer" className="hidden md:block bg-studio-gold text-studio-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-studio-gold-light transition ring-4 ring-studio-gold/10">
            Falar no WhatsApp
          </a>
        </div>
      </header>

      {/* Hero da Galeria */}
      <section className="pt-32 pb-16 text-center container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-studio-gold uppercase tracking-[0.4em] text-[10px] mb-4 font-display">Atendimento VIP em Minutos</p>
          <h1 className="text-4xl md:text-7xl font-bold mb-8 italic uppercase tracking-tighter">
            CATÁLOGO <span className="text-studio-gold">VIP</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg font-light leading-relaxed mb-12">
            Escolha o seu estilo preferido e faça o seu pedido em minutos, direto pelo WhatsApp. <span className="text-studio-gold font-bold">Sem cadastros na plataforma.</span>
          </p>
        </motion.div>

        {/* Filtros em Grid/Wrap */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-4xl mx-auto px-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat
                ? 'bg-studio-gold border-studio-gold text-studio-black shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                : 'bg-transparent border-studio-gold/30 text-studio-gold hover:border-studio-gold hover:bg-studio-gold/5'
                }`}
            >
              {cat === 'Todos' ? '✨ Ver Todos' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Galeria */}
      <section className="container mx-auto px-6 pb-32 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-studio-gold" size={40} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 py-20 flex flex-col items-center">
            <Camera size={48} className="mb-4 text-white/10" />
            <p className="tracking-widest uppercase text-xs">Nenhum estilo encontrado nesta categoria.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {styles.filter(item => activeCategory === 'Todos' || item.categoria === activeCategory).map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => toggleStyle(item)}
                  className={`group relative aspect-[4/5] overflow-hidden block cursor-pointer transition-all duration-300 ${selectedStyles.find(s => s.id === item.id)
                    ? 'ring-4 ring-studio-gold ring-inset border-transparent'
                    : 'gold-border-gradient'
                    }`}
                >
                  <div className="absolute inset-0 bg-studio-black">
                    {item.img_url ? (
                      <Image
                        src={item.img_url}
                        alt={item.titulo}
                        fill
                        className={`object-contain transition-all duration-700 ${selectedStyles.find(s => s.id === item.id)
                          ? 'scale-105 opacity-100'
                          : 'group-hover:scale-110 group-hover:blur-[2px] opacity-80 group-hover:opacity-100'
                          } select-none pointer-events-none`}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <span className="uppercase tracking-widest font-bold text-xs text-gray-500">Sem Imagem</span>
                      </div>
                    )}
                    <div className="absolute inset-0 z-10"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-black via-transparent to-transparent opacity-90"></div>

                  {/* Ícone de Seleção */}
                  {selectedStyles.find(s => s.id === item.id) && (
                    <div className="absolute top-4 right-4 z-30 bg-studio-gold text-studio-black rounded-full p-1 shadow-lg animate-in zoom-in duration-300">
                      <Check size={20} strokeWidth={3} />
                    </div>
                  )}

                  {/* Logo no centro (Marca d'água principal) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-40 transition-all duration-700 z-10">
                    <div className="relative w-32 h-16">
                      <Image src="/logo.2.png" alt="Logo Watermark" fill className="object-contain grayscale" />
                    </div>
                  </div>

                  {/* Categoria na parte inferior */}
                  <div className="absolute bottom-6 left-0 right-0 text-center transition-all duration-500 z-20 group-hover:bottom-12">
                    <span className="text-studio-gold text-[10px] uppercase font-bold tracking-[0.3em] block drop-shadow-md">
                      {item.categoria?.toLowerCase()?.includes('executivo') ? 'Executivo/Corporativo' : item.categoria}
                    </span>
                    <span className={`mt-4 text-studio-black text-[10px] font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-2 bg-studio-gold mx-auto w-max px-6 py-2.5 rounded-full border border-studio-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-105 ${selectedStyles.find(s => s.id === item.id) ? 'opacity-100 scale-105' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                      <Check size={14} className="fill-studio-black" />
                      {selectedStyles.find(s => s.id === item.id) ? 'Selecionado' : 'Selecionar Estilo'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Onboarding Híbrido: Convite para Plataforma Completa */}
      <section className="container mx-auto px-6 pb-24">
        <div className="bg-studio-gray/30 border border-studio-gold/20 rounded-3xl p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-studio-gold/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 italic">Prefere ter controle total do seu ensaio?</h2>
            <p className="max-w-2xl text-gray-400 text-lg font-light mb-12">
              Crie sua conta VIP gratuita e acesse nossa plataforma de Inteligência Artificial com privacidade e autonomia.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
              <div className="flex flex-col items-center p-6 bg-black/20 rounded-2xl border border-white/5 hover:border-studio-gold/20 transition-colors">
                <div className="size-12 rounded-full bg-studio-gold/10 flex items-center justify-center text-studio-gold mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Privacidade Absoluta</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Suas fotos processadas em um painel seguro e confidencial.</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-black/20 rounded-2xl border border-white/5 hover:border-studio-gold/20 transition-colors">
                <div className="size-12 rounded-full bg-studio-gold/10 flex items-center justify-center text-studio-gold mb-4">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Gestão de Pedidos</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Acompanhe o status da sua arte em tempo real na fila de produção.</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-black/20 rounded-2xl border border-white/5 hover:border-studio-gold/20 transition-colors">
                <div className="size-12 rounded-full bg-studio-gold/10 flex items-center justify-center text-studio-gold mb-4">
                  <Download size={24} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Entrega Segura</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Suas prévias e artes finais em alta resolução ficam disponíveis em seu painel privado para download seguro por até 15 dias.</p>
              </div>
            </div>

            <Link
              href="/login"
              className="px-8 py-4 border border-studio-gold/50 text-studio-gold hover:bg-studio-gold hover:text-studio-black transition-all rounded-xl font-bold uppercase tracking-widest text-xs"
            >
              Criar Minha Conta VIP
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final da Galeria */}
      <section className="bg-studio-gray/10 py-32 border-t border-white/5 relative overflow-hidden shrink-0 mt-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-studio-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <Star size={40} className="text-studio-gold fill-studio-gold mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-bold mb-10 italic">PRONTO PARA A SUA <br /> <span className="text-studio-gold">MELHOR VERSÃO?</span></h2>
          <a href="https://wa.me/556193314473?text=Olá!%20Gostaria%20de%20fazer%20meu%20ensaio%20VIP%20pelo%20WhatsApp." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 px-12 py-6 bg-studio-gold text-studio-black font-extrabold uppercase tracking-[0.2em] hover:bg-studio-gold-light hover:scale-105 transition-all shadow-2xl shadow-studio-gold/30 rounded-xl text-sm md:text-lg group">
            CHAMAR NO WHATSAPP <ArrowRight size={24} className="group-hover:translate-x-2 transition" />
          </a>
          <p className="mt-8 text-gray-500 text-sm tracking-[0.3em] font-light uppercase">Resultados reais em pouco tempo</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-studio-black border-t border-white/5 shrink-0" id="contato">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6">

            {/* Logo and Copyright */}
            <div className="flex flex-col items-center md:items-start order-2 md:order-1">
              <div className="relative w-[150px] h-[60px] mb-2">
                <Image src="/logo.2.png" alt="Virtual Studio Logo" fill className="object-contain" />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-light">
                © 2026 VIRTUAL STUDIO<br />
                <span className="opacity-60">Todos os direitos reservados</span>
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col items-center gap-3 text-[10px] text-gray-400 uppercase tracking-widest font-light order-3 md:order-2">
              <Link href="/termos-de-uso" className="hover:text-studio-gold transition-colors">Termos de Uso</Link>
              <Link href="/politica-de-privacidade" className="hover:text-studio-gold transition-colors">Política de Privacidade</Link>
            </div>

            {/* Social and Contact */}
            <div className="flex flex-col items-center md:items-end gap-3 order-1 md:order-3">
              <div className="flex gap-4">
                <a
                  href="mailto:suporte@virtualstudio.click"
                  className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-studio-gold hover:border-studio-gold/30 transition-all duration-300"
                  aria-label="Email support"
                >
                  <Mail size={16} />
                </a>
                <a
                  href="https://www.instagram.com/virtualstudio.click/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-studio-gold hover:border-studio-gold/30 transition-all duration-300"
                  aria-label="Instagram profile"
                >
                  <Instagram size={16} />
                </a>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[10px] text-studio-gold uppercase tracking-widest hover:underline opacity-80 pt-1 cursor-pointer"
              >
                Voltar ao Topo ↑
              </button>
            </div>

          </div>
        </div>
      </footer>

      {/* Floating Action Button (WhatsApp) */}
      <AnimatePresence>
        {selectedStyles.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
          >
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full bg-studio-gold text-studio-black p-4 rounded-2xl shadow-[0_20px_50px_rgba(195,157,93,0.4)] hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                  {selectedStyles.length} {selectedStyles.length === 1 ? 'estilo selecionado' : 'estilos selecionados'}
                </span>
                <span className="text-sm font-bold uppercase tracking-widest">
                  Pedir via WhatsApp
                </span>
              </div>
              <div className="bg-studio-black/10 p-3 rounded-xl group-hover:bg-studio-black/20 transition-colors">
                <MessageCircle size={24} className="fill-studio-black" />
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <SalesNotification />
    </div>
  );
}
