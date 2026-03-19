'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Camera, Star, ArrowRight, Instagram, Linkedin, Twitter } from 'lucide-react';

const categories = ['Todos', 'Corporativo', 'Moda', 'Lifestyle', 'Gamer'];

const galleryItems = [
  { id: 1, category: 'Corporativo', title: 'Retrato Executivo', img: '/corporativo.png' },
  { id: 2, category: 'Corporativo', title: 'Identidade Business', img: '/humanoide.png' },
  { id: 3, category: 'Moda', title: 'Editorial de Luxo', img: '/editorial-de-moda.png' },
  { id: 4, category: 'Moda', title: 'Estilo Cinematográfico', img: '/estilo-cinematográfico.jpeg' },
  { id: 5, category: 'Lifestyle', title: 'Casual Urbano', img: '/lifestyle-urbano.png' },
  { id: 6, category: 'Lifestyle', title: 'Dia a Dia Premium', img: '/lifestyle.png' },
  { id: 7, category: 'Lifestyle', title: 'Essência Real', img: '/lifestyleurbano.png' },
  { id: 8, category: 'Gamer', title: 'Setup Futurista', img: '/gamer.png' },
  { id: 9, category: 'Gamer', title: 'Hero Digital', img: '/hero-futurista.png' },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredItems = activeCategory === 'Todos' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-studio-black text-white font-sans">
      {/* Header Fixo */}
      <header className="fixed top-0 w-full z-50 bg-studio-black/80 backdrop-blur-md py-4 border-b border-white/5">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group text-gray-400 hover:text-studio-gold transition">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
            <span className="uppercase tracking-widest text-xs font-display">Voltar para Home</span>
          </Link>
          <div className="relative w-32 h-10">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <Link href="/signup" className="hidden md:block bg-studio-gold text-studio-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-studio-gold-light transition ring-4 ring-studio-gold/10">
            Quero o meu
          </Link>
        </div>
      </header>

      {/* Hero da Galeria */}
      <section className="pt-32 pb-16 text-center container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-studio-gold uppercase tracking-[0.4em] text-[10px] mb-4 font-display">Museu de Resultados</p>
          <h1 className="text-4xl md:text-7xl font-bold mb-8 italic">
            GALERIA DE <span className="text-studio-gold">SENTIDOS</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg font-light leading-relaxed mb-12">
            Explore a perfeição visual gerada pela nossa Inteligência Artificial com curadoria artística humana. Cada pixel conta uma história de autoridade e estilo.
          </p>
        </motion.div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeCategory === cat 
                ? 'border-studio-gold text-white bg-studio-gold/5' 
                : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Galeria */}
      <section className="container mx-auto px-6 pb-32">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative h-[600px] overflow-hidden gold-border-gradient"
              >
                <div className="absolute inset-0 bg-studio-black">
                   <Image 
                     src={item.img} 
                     alt={item.title} 
                     fill 
                     className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px] opacity-80 group-hover:opacity-100" 
                     referrerPolicy="no-referrer"
                   />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-studio-black via-transparent to-transparent opacity-90"></div>
                
                {/* Overlay Informativo */}
                <div className="absolute bottom-10 left-10 transition-all duration-500 group-hover:bottom-12">
                   <span className="text-studio-gold text-[10px] uppercase font-bold tracking-widest mb-2 block">{item.category}</span>
                   <h3 className="text-3xl font-display font-bold group-hover:text-studio-gold-light transition">{item.title}</h3>
                   <div className="w-0 group-hover:w-20 h-[2px] bg-studio-gold mt-4 transition-all duration-500"></div>
                </div>

                {/* Badge de Lente */}
                <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                   <Camera size={18} className="text-studio-gold" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* CTA Final da Galeria */}
      <section className="bg-studio-gray/10 py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-studio-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <Star size={40} className="text-studio-gold fill-studio-gold mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-bold mb-10 italic">PRONTO PARA A SUA <br /> <span className="text-studio-gold">MELHOR VERSÃO?</span></h2>
          <Link href="/signup" className="inline-flex items-center gap-4 px-12 py-6 bg-studio-gold text-studio-black font-extrabold uppercase tracking-[0.2em] hover:bg-studio-gold-light hover:scale-105 transition-all shadow-2xl shadow-studio-gold/30 rounded-xl text-lg group">
            CRIAR MEU ENSAIO <ArrowRight size={24} className="group-hover:translate-x-2 transition" />
          </Link>
          <p className="mt-8 text-gray-500 text-sm tracking-[0.3em] font-light uppercase">Resultados reais em até 24 horas</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-studio-black text-center relative border-t border-white/5" id="contato">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <div className="relative w-[280px] h-[280px] mx-auto -mt-10 -mb-24">
              <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" />
            </div>
            <h4 className="font-display tracking-[0.3em] text-xl relative z-10">VIRTUAL STUDIO</h4>
          </div>
          <div className="mb-6 relative z-10">
            <a href="mailto:suporte@virtualstudio.click" className="text-studio-gold hover:text-studio-gold-light transition-all text-sm tracking-[0.2em] font-display uppercase">
              suporte@virtualstudio.click
            </a>
          </div>
          <div className="mb-12 relative z-10">
            <p className="text-gray-500 text-xs uppercase">© 2026 VIRTUAL STUDIO - TODOS OS DIREITOS RESERVADOS</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-12 text-xs text-gray-400 uppercase tracking-widest font-light">
            <Link href="/termos-de-uso" className="hover:text-studio-gold transition">Termos de Uso</Link>
            <Link href="/politica-de-privacidade" className="hover:text-studio-gold transition">Política de Privacidade</Link>
          </div>
          <div className="max-w-xl mx-auto border-t border-white/10 pt-10">
            <a className="text-studio-gold uppercase text-[10px] tracking-widest hover:underline" href="#">Voltar ao Topo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
