'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Camera, ChevronRight, Check, Star, Play, Instagram, Linkedin, Twitter, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-studio-black">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-studio-black/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <nav className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Logo expandida sem empurrar a altura da barra (margem negativa resolve) */}
            <div className="relative w-[200px] h-[200px] -my-[80px] flex items-center justify-center z-10 pointer-events-none">
              <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
            </div>
            <span className="font-display text-lg tracking-widest hidden md:block">VIRTUAL STUDIO</span>
          </div>
          <ul className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-display">
            <li><a className="hover:text-studio-gold transition" href="#galeria">Estilos</a></li>
            <li><a className="hover:text-studio-gold transition" href="#processo">Processo</a></li>
            <li><a className="hover:text-studio-gold transition" href="#precos">Preços</a></li>
            <li><a className="hover:text-studio-gold transition" href="#contato">Contato</a></li>
          </ul>
          <Link href="/login" className="bg-studio-gold text-studio-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-studio-gold-light transition">
            Começar Agora
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD31FwgTzY94BXOQ4Lsu4gTWwijG8_k85DTVXHnTcf2QRC0jxwA6fK8YD-nQ48fW6UXnJYKqIUBm026zVFZa1AoQXreXo7GdyCnxCc2jVbrDjcOS13IuIwRng5fRekwP6jxdtxdyl7g7AYkH4vkl7p5MvzFzzy6o3orP5-TSao2xOOrkR06ZAQcU3A92k0BnJGoBka4WD7CoNaBUXz-naQmpnMQg9LYAHlJQjExTAk0ijJi9xpAJ64uC8CQUFoqqMaC7yQ5bMn5Kpbn"
            alt="Hero Background"
            fill
            className="object-cover opacity-60"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 mist-overlay"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-studio-black to-transparent z-10"></div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-studio-gold uppercase tracking-[0.5em] mb-4 text-sm font-display"
          >
            A Nova Era da Fotografia Profissional
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-8xl font-bold mb-8 leading-tight"
          >
            CRIE SEU ENSAIO <br />
            <span className="text-studio-gold italic">PROFISSIONAL COM IA</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto text-gray-300 text-lg mb-10 font-light"
          >
            Esqueça os estúdios caros e horas de edição. Transforme suas fotos comuns em obras de arte profissionais com o VIRTUAL STUDIO.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup" className="bg-studio-gold text-studio-black px-10 py-4 font-bold uppercase tracking-widest hover:scale-105 transition-transform text-center">
              Criar Meu Ensaio
            </Link>
            <button className="border border-white/30 backdrop-blur-sm px-10 py-4 font-bold uppercase tracking-widest hover:bg-white/10 transition">
              Ver Galeria
            </button>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-studio-black relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 border-t border-l border-studio-gold opacity-30"></div>
              <div className="relative aspect-square overflow-hidden bg-studio-black">
                {/* Scale-105 e translate-y para jogar a marca d'água para fora do container overflow-hidden */}
                <div className="absolute inset-0 scale-[1.08] translate-y-3 origin-center">
                  <Image
                    src="/humanoide.png"
                    alt="Comparison"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-8 text-studio-gold">O Fim da Complexidade</h2>
              <div className="space-y-8">
                <div className="group">
                  <h4 className="text-xl mb-2 text-white flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-studio-gold"></span> Estúdios Tradicionais
                  </h4>
                  <p className="text-gray-400 font-light">Aluguel de espaço caro, aluguel de roupas, deslocamento, iluminação complexa e dias esperando pela edição final.</p>
                </div>
                <div className="group">
                  <h4 className="text-xl mb-2 text-studio-gold flex items-center gap-3 font-bold">
                    <span className="w-8 h-[1px] bg-white"></span> VIRTUAL STUDIO
                  </h4>
                  <p className="text-gray-200">Resultados de nível editorial em pouco tempo, em qualquer cenário do mundo, com curadoria artística humana.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style Gallery */}
      <section className="py-24 bg-studio-black" id="galeria">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">MUSEU DE ESTILOS</h2>
          <p className="text-studio-gold tracking-widest uppercase text-sm">Escolha sua identidade visual</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
          {[
            { title: 'Retrato Corporativo', img: '/corporativo.png', offset: false },
            { title: 'Editorial de Moda', img: '/editorial-de-moda.png', offset: true },
            { title: 'Lifestyle Urbano', img: '/lifestyleurbano.png', offset: false },
            { title: 'Estilo Cinematográfico', img: '/estilo-cinematográfico.jpeg', offset: true }
          ].map((style, i) => (
            <div key={i} className={`relative group h-[500px] overflow-hidden ${style.offset ? 'md:mt-12' : ''}`}>
              {/* Scale-105 e translate-y para jogar a marca d'água para fora do container overflow-hidden */}
              <div className="absolute inset-0 bg-studio-black scale-[1.08] translate-y-3 origin-center">
                <Image
                  src={style.img}
                  alt={style.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-studio-black via-transparent to-transparent opacity-80 pointer-events-none"></div>
              <div className="absolute bottom-8 left-8 pointer-events-none">
                <h3 className="text-2xl font-display">{style.title}</h3>
                <p className="text-studio-gold text-xs mt-2 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">Ver Detalhes</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-studio-gray/30 relative" id="processo">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">COMO FUNCIONA</h2>
            <div className="w-24 h-1 bg-studio-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: '01', title: 'Upload', desc: 'Envie 10 ou mais fotos suas de diferentes ângulos para treinar nossa IA.' },
              { step: '02', title: 'Estilo', desc: 'Escolha entre nossos +100 estilos e poses.' },
              { step: '03', title: 'Geração', desc: 'Nossa IA cria centenas de variações baseadas na sua fisionomia real.' },
              { step: '04', title: 'Curadoria', desc: 'Nossos artistas selecionam e retocam as melhores imagens para perfeição.' },
              { step: '05', title: 'Entrega', desc: 'Receba seu ensaio em alta resolução pronto para suas redes.' }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 border border-studio-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-studio-gold group-hover:text-studio-black transition text-xl font-display">{item.step}</div>
                <h4 className="font-bold mb-3 text-studio-gold">{item.title}</h4>
                <p className="text-xs text-gray-400 font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Artist Section */}
      <section className="py-24 bg-studio-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-2">CURADORIA HUMANA</h2>
              <p className="text-studio-gold uppercase tracking-widest text-sm mb-8">Tecnologia com Alma de Artista</p>
              <p className="text-gray-300 mb-6 font-light leading-relaxed">
                Diferente de aplicativos genéricos, no VIRTUAL STUDIO cada pixel é revisado por um profissional. Nós não apenas geramos imagens; nós criamos uma narrativa visual que respeita suas características únicas e eleva sua marca pessoal.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-studio-gold p-1 overflow-hidden relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXmbvlUBl5568OLtxMRxujriRI2D4kB0W5Phl6xnPdVqjh7SEiueLa6ceROZI26onU6WCbGMCNeQlRiMgdcTM6Qk6rA0mcEBuv2r_hwNd-IxIkxTrYqvASXY4TX_W0ytTSHbb0ss4kMld_CrQGx5Ro1ULEkS78eFOnDODODQza3IAPLNZt11qNnwMthtXPnEh3txb1jh3ILEj4HpBmqgPeWoNUeecpRvaDW5GXwA7dVw3BtPSPDu4-k8ggHMdD0dFjOpLNgHTEwOeM"
                    alt="Irina Sova"
                    fill
                    className="object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="font-display text-lg">Irina Sova</p>
                  <p className="text-studio-gold text-xs uppercase">Lead AI Curator</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="relative aspect-video gold-border-gradient p-4">
                <Image
                  src="/curadoria.png"
                  alt="AI Artist Working"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-studio-black border-t border-white/5" id="precos">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">PLANOS EXCLUSIVOS</h2>
            <p className="text-studio-gold tracking-widest uppercase text-sm">Investimento na sua imagem</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan 1 */}
            <div className="p-8 border border-white/10 bg-studio-gray/20 flex flex-col hover:border-studio-gold transition">
              <h3 className="text-2xl font-display mb-4">BÁSICO</h3>
              <p className="text-4xl font-bold mb-6">R$ 197<span className="text-sm font-light text-gray-500">/ensaio</span></p>
              <ul className="space-y-4 text-sm text-gray-400 mb-10 flex-grow">
                <li>• 15 fotos em alta resolução</li>
                <li>• 1 Estilo de cenário</li>
                <li>• Entrega em 48 horas</li>
                <li className="line-through opacity-30">• Curadoria manual Premium</li>
              </ul>
              <button className="w-full border border-studio-gold text-studio-gold py-4 font-bold uppercase tracking-widest hover:bg-studio-gold hover:text-studio-black transition">Selecionar</button>
            </div>
            {/* Plan 2 */}
            <div className="p-8 border-2 border-studio-gold bg-studio-black flex flex-col relative scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-studio-gold text-studio-black text-[10px] font-bold px-4 py-1 uppercase tracking-tighter">Mais Popular</div>
              <h3 className="text-2xl font-display mb-4">POPULAR</h3>
              <p className="text-4xl font-bold mb-6">R$ 397<span className="text-sm font-light text-gray-500">/ensaio</span></p>
              <ul className="space-y-4 text-sm text-gray-200 mb-10 flex-grow">
                <li>• 50 fotos em alta resolução</li>
                <li>• 5 Estilos de cenário</li>
                <li>• Entrega em 24 horas</li>
                <li>• Curadoria manual Premium</li>
                <li>• Pack de Retoques Extras</li>
              </ul>
              <button className="w-full bg-studio-gold text-studio-black py-4 font-bold uppercase tracking-widest hover:bg-studio-gold-light transition">Selecionar</button>
            </div>
            {/* Plan 3 */}
            <div className="p-8 border border-white/10 bg-studio-gray/20 flex flex-col hover:border-studio-gold transition">
              <h3 className="text-2xl font-display mb-4">PRO</h3>
              <p className="text-4xl font-bold mb-6">R$ 797<span className="text-sm font-light text-gray-500">/ensaio</span></p>
              <ul className="space-y-4 text-sm text-gray-400 mb-10 flex-grow">
                <li>• Fotos ilimitadas</li>
                <li>• Todos os cenários liberados</li>
                <li>• Entrega prioritária (12h)</li>
                <li>• Consultoria de Imagem Personalizada</li>
                <li>• Direitos comerciais totais</li>
              </ul>
              <button className="w-full border border-studio-gold text-studio-gold py-4 font-bold uppercase tracking-widest hover:bg-studio-gold hover:text-studio-black transition">Selecionar</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-studio-black text-center relative border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <div className="relative w-[200px] h-[200px] mx-auto mb-4">
              <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" />
            </div>
            <h4 className="font-display tracking-[0.3em] text-xl">VIRTUAL STUDIO</h4>
            <p className="text-gray-500 text-xs mt-2 uppercase">© 2026 VIRTUAL STUDIO - TODOS OS DIREITOS RESERVADOS</p>
          </div>
          <div className="flex justify-center gap-6 mb-12">
            <a className="text-studio-gold hover:text-white transition" href="#"><Instagram size={20} /></a>
            <a className="text-studio-gold hover:text-white transition" href="#"><Linkedin size={20} /></a>
            <a className="text-studio-gold hover:text-white transition" href="#"><Twitter size={20} /></a>
          </div>
          <div className="max-w-xl mx-auto border-t border-white/10 pt-10">
            <h2 className="text-4xl md:text-6xl font-bold opacity-20 mb-4 font-display">OBRIGADO POR NOS ESCOLHER</h2>
            <a className="text-studio-gold uppercase text-[10px] tracking-widest hover:underline" href="#">Voltar ao Topo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}