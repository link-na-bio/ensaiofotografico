'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Camera, ChevronLeft, ChevronRight, Check, CheckCheck, Star, Play, Instagram, Linkedin, Twitter, Menu, X, ArrowRight, Zap, Phone, Video, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';

const faqs = [
  {
    question: "Como funciona o Virtual Studio?",
    answer: "Nosso sistema de IA avançado analisa suas fotos para criar um modelo digital personalizado. Em seguida, nossos artistas aplicam curadoria humana para gerar retratos profissionais que mantêm sua essência real e autoridade visual."
  },
  {
    question: "Quantas fotos eu preciso enviar?",
    answer: "Recomendamos o envio de 10 a 20 fotos de diferentes ângulos, iluminações e expressões. Quanto mais variadas as fotos, melhor nossa IA poderá aprender sua fisionomia para resultados perfeitos."
  },
  {
    question: "Em quanto tempo recebo meu ensaio?",
    answer: "O prazo padrão de entrega é de até 72 horas. Nossa prioridade é a perfeição, por isso cada pixel passa por uma revisão humana rigorosa antes de ser liberado na sua galeria."
  },
  {
    question: "As fotos ficam com aspecto artificial?",
    answer: "Diferente de filtros comuns de redes sociais, nossa tecnologia de IA generativa simula luzes e sombras físicas reais. A curadoria humana final garante que o resultado seja 100% convincente e profissional."
  },
  {
    question: "Existe política de reembolso?",
    answer: "Devido ao altíssimo custo de processamento computacional das nossas IAs de elite, não oferecemos reembolsos após o início da geração. No entanto, garantimos a satisfação através de nossa curadoria de excelência."
  },
  {
    question: "Meus dados e fotos estão protegidos?",
    answer: "Privacidade é nosso pilar. Suas imagens originais e o modelo de IA treinado são utilizados exclusivamente para o seu ensaio e deletados permanentemente de nossos servidores após a conclusão do trabalho."
  }
];

const testimonials = [
  {
    id: 1,
    name: "Roberto T.",
    testimonialImage: "/01.jpeg"
  },
  {
    id: 2,
    name: "Camila",
    testimonialImage: "/02.jpeg"
  },
  {
    id: 3,
    name: "Dr. Andre",
    testimonialImage: "/03.jpeg"
  },
  {
    id: 4,
    name: "Aline",
    testimonialImage: "/04.jpeg"
  },
  {
    id: 5,
    name: "Carlos Exec.",
    testimonialImage: "/05.jpeg"
  },
  {
    id: 6,
    name: "Juliana Model",
    testimonialImage: "/06.jpeg"
  },
  {
    id: 7,
    name: "Mauro A.",
    testimonialImage: "/07.jpeg"
  },
  {
    id: 8,
    name: "Paula",
    testimonialImage: "/08.jpeg"
  },
  {
    id: 9,
    name: "Pedro Burger",
    testimonialImage: "/09.jpeg"
  },
  {
    id: 10,
    name: "Tiago A.",
    testimonialImage: "/10.jpeg"
  }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
            <li><a className="hover:text-studio-gold transition" href="#precos">Pacotes</a></li>
            <li><a className="hover:text-studio-gold transition" href="#contato">Contato</a></li>
          </ul>
          <Link href="/login" className="bg-studio-gold text-studio-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-studio-gold-light transition">
            Começar Agora
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden bg-studio-black">
          <div className="absolute inset-0 scale-[1.08] translate-y-3 origin-center">
            <Image
              src="/hero-futurista.png"
              alt="Hero Background"
              fill
              className="object-cover opacity-30"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
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
            <button className="border border-white/30 backdrop-blur-sm px-10 py-4 font-bold uppercase tracking-widest hover:bg-white/10 transition text-center opacity-50 cursor-default">
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

      {/* Testimonials / Social Proof (Dark Mode WhatsApp Carousel) */}
      <section className="py-24 bg-studio-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-studio-gold/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display italic">O QUE NOSSOS CLIENTES ESTÃO <span className="text-studio-gold">DIZENDO</span> <span className="text-xs opacity-50 ml-2">({activeTestimonial + 1}/{testimonials.length})</span></h2>
            <p className="text-studio-gold tracking-widest uppercase text-sm font-light">Mais de 500 ensaios gerados com 100% de satisfação</p>
          </div>

          <div className="relative h-[650px] max-w-7xl mx-auto flex items-center justify-center mt-8 perspective-1000">
            {/* Carousel Items */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
              {testimonials.map((test, index) => {
                const diff = (index - activeTestimonial + testimonials.length) % testimonials.length;
                const half = Math.floor(testimonials.length / 2);
                let offset = diff;
                if (offset > half) offset -= testimonials.length;

                const absOffset = Math.abs(offset);
                const isCenter = offset === 0;

                // Position logic: hide cards that are too far
                if (absOffset > 2) return null;

                const scale = isCenter ? 1.05 : 0.8;
                const translateX = offset * 380;
                const zIndex = 50 - absOffset;
                const opacity = isCenter ? 1 : Math.max(0, 0.4 - (absOffset * 0.1));

                return (
                  <motion.div
                    key={test.id}
                    className="absolute top-1/2 left-1/2 cursor-pointer"
                    initial={false}
                    animate={{
                      x: translateX,
                      y: '-50%',
                      scale,
                      opacity,
                      zIndex,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 26,
                    }}
                    style={{
                      left: '50%',
                      translateX: '-50%',
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      const swipeThreshold = 50;
                      if (info.offset.x > swipeThreshold) {
                        prevTestimonial();
                      } else if (info.offset.x < -swipeThreshold) {
                        nextTestimonial();
                      }
                    }}
                    onClick={() => !isCenter && setActiveTestimonial(index)}
                  >
                    {/* Testimonial Image Card - Optimized for Visibility */}
                    <div className="relative w-[420px] aspect-[9/19.5] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white/5 border border-white/10 group">
                      <Image 
                        src={test.testimonialImage} 
                        alt={test.name} 
                        fill 
                        className="object-contain"
                        priority={isCenter}
                      />
                      
                      {!isCenter && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-30 transition-all duration-500"></div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls (Moved outside perspective container) */}
          <div className="flex flex-col items-center mt-12 gap-8 relative z-50">
            {/* Desktop Arrows Row */}
            <div className="hidden md:flex items-center gap-12">
              <button
                onClick={prevTestimonial}
                className="w-16 h-16 rounded-full bg-studio-gray/80 border border-white/10 flex items-center justify-center text-white hover:bg-studio-gold hover:text-black transition-all shadow-xl"
                aria-label="Anterior"
              >
                <ChevronLeft size={32} />
              </button>
              
              {/* Dots Indicators */}
              <div className="flex justify-center items-center gap-3">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`transition-all duration-300 rounded-full cursor-pointer h-2 ${activeTestimonial === i ? 'w-12 bg-studio-gold shadow-[0_0_15px_rgba(255,215,0,0.6)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                    aria-label={`Ir para depoimento ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-16 h-16 rounded-full bg-studio-gray/80 border border-white/10 flex items-center justify-center text-white hover:bg-studio-gold hover:text-black transition-all shadow-xl"
                aria-label="Próximo"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Mobile Arrows Row */}
            <div className="flex md:hidden items-center gap-8">
              <button
                onClick={prevTestimonial}
                className="w-14 h-14 rounded-full bg-studio-gray/80 border border-white/10 flex items-center justify-center text-white shadow-lg"
                aria-label="Anterior"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="flex gap-2">
                {[...Array(testimonials.length)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${activeTestimonial === i ? 'bg-studio-gold' : 'bg-white/20'}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-14 h-14 rounded-full bg-studio-gray/80 border border-white/10 flex items-center justify-center text-white shadow-lg"
                aria-label="Próximo"
              >
                <ChevronRight size={28} />
              </button>
            </div>
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

            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="relative aspect-[16/10] md:aspect-video gold-border-gradient p-2 md:p-4">
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
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              INVESTIMENTO NA SUA <span className="text-studio-gold">AUTORIDADE</span>
            </motion.h2>
            <p className="text-gray-400 tracking-widest uppercase text-sm font-light">Escolha a escala da sua transformação visual</p>
          </div>

          <div className="space-y-12">
            {/* Pacote 1: ESSENTIAL - Staggered Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16 p-8 md:p-12 bg-studio-gray/10 border border-white/5 hover:border-studio-gold/30 transition-all duration-500 rounded-2xl group"
            >
              <div className="w-full md:w-1/3 relative aspect-square rounded-xl overflow-hidden shadow-2xl order-1">
                <Image src="/corporativo.png" alt="Essential Package" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-studio-gold font-display text-lg">ESSENTIAL</span>
                </div>
              </div>
              <div className="md:w-2/3 flex flex-col justify-center order-2">
                <h3 className="text-2xl md:text-3xl mb-4 text-white">O Começo da Sua Nova Versão</h3>
                <p className="text-gray-400 mb-8 leading-relaxed font-light text-lg">
                  Ideal para quem precisa de um impacto imediato. Receba <strong className="text-white">10 fotos de alta resolução</strong> em até 2 estilos distintos. Perfeito para atualizar seu perfil no LinkedIn ou WhatsApp com uma imagem que transmite confiança e profissionalismo de elite.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <Check size={14} className="text-studio-gold" /> Curadoria Humana
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <Check size={14} className="text-studio-gold" /> Entrega em 24h
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Pacote 2: PRO - Full Width Highlight */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-16 bg-studio-black border-2 border-studio-gold rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(195,157,93,0.15)] group"
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-studio-gold text-studio-black text-[10px] font-bold px-6 py-2 uppercase tracking-widest rounded-b-lg">O Mais Escolhido</div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-studio-gold/10 blur-[100px] pointer-events-none"></div>


              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/2 order-2 md:order-1">
                  <h3 className="text-3xl md:text-5xl mb-6 text-studio-gold italic">PACOTE PRO</h3>
                  <p className="text-xl md:text-2xl text-white mb-6 font-display leading-tight">MOLDE UMA IDENTIDADE VISUAL COMPLETA E INESQUECÍVEL</p>
                  <p className="text-gray-300 mb-8 leading-relaxed font-light text-lg">
                    A escolha definitiva para empreendedores e criadores. Com <strong className="text-white">25 fotos de nível editorial</strong> em até 5 estilos, você terá conteúdo para meses de postagens de alta autoridade. Nossa IA e curadores trabalham para garantir que sua essência brilhe em cada cenário global.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <div className="flex items-center gap-3 text-sm text-gray-200">
                      <Star size={18} className="text-studio-gold fill-studio-gold" /> 5 Estilos Exclusivos
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-200">
                      <CheckCheck size={18} className="text-studio-gold" /> Suporte Prioritário
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-200">
                      <Zap size={18} className="text-studio-gold" /> Processamento Turbo
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-200">
                      <Check size={18} className="text-studio-gold" /> Licença Comercial Full
                    </div>
                  </div>

                </div>
                <div className="w-full md:w-1/2 relative order-1 md:order-2">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 md:rotate-2 group-hover:rotate-0 transition-transform duration-700">
                    <Image src="/editorial-de-moda.png" alt="Pro Package" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-studio-black/40 to-transparent"></div>
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-studio-gold/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-studio-gold/30 -z-10 animate-pulse hidden md:flex"></div>
                </div>
              </div>
            </motion.div>

            {/* Pacote 3: ULTRA - Staggered Right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 p-8 md:p-12 bg-studio-gray/10 border border-white/5 hover:border-studio-gold/30 transition-all duration-500 rounded-2xl group"
            >
              <div className="w-full md:w-1/3 relative aspect-square rounded-xl overflow-hidden shadow-2xl order-1">
                <Image src="/estilo-cinematográfico.jpeg" alt="Ultra Package" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-studio-gold font-display text-lg">ULTRA</span>
                </div>
              </div>
              <div className="md:w-2/3 flex flex-col justify-center order-2">
                <h3 className="text-2xl md:text-3xl mb-4 text-white">Domínio Editorial e Escala Global</h3>
                <p className="text-gray-400 mb-8 leading-relaxed font-light text-lg">
                  Para quem não aceita nada menos que o auge. <strong className="text-white">50 fotos lendárias</strong> abrangendo até 10 estilos cinematográficos. Transforme sua imagem em um império visual com fotos que parecem ter saído das maiores revistas de moda do mundo.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-gray-300 font-light italic">"A maior diversidade de poses e cenários para sua marca."</li>
                </ul>

              </div>
            </motion.div>
          </div>

          {/* Botão Único Final */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center px-4"
          >
            <button className="w-full md:w-auto px-8 py-5 md:px-12 md:py-6 bg-studio-gold text-studio-black font-extrabold uppercase tracking-[0.1em] md:tracking-[0.2em] hover:bg-studio-gold-light hover:scale-105 transition-all shadow-2xl shadow-studio-gold/30 rounded-xl flex items-center justify-center gap-4 mx-auto text-base md:text-lg">
              SOLICITAR MEU ENSAIO <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <p className="mt-8 text-gray-500 text-sm italic font-light tracking-widest uppercase">Comece agora sua jornada definitiva de imagem</p>
          </motion.div>

          <div className="mt-24 border-t border-white/10 pt-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">POR QUE ESCOLHER A VIRTUAL STUDIO?</h2>
              <p className="text-studio-gold tracking-widest uppercase text-sm font-light">Evolua sua imagem com Inteligência</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="group">
                <div className="w-16 h-16 rounded-full border border-studio-gold/30 bg-studio-gold/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-studio-gold/20 transition-all duration-300">
                  <span className="text-studio-gold text-2xl font-bold font-display">01</span>
                </div>
                <h3 className="text-xl font-bold font-display uppercase tracking-widest mb-4">Economia Absoluta</h3>
                <p className="text-gray-400 font-light leading-relaxed">Até <strong className="text-white">90% mais barato</strong> que um estúdio presencial. Sem custos com fotógrafo, aluguel de cenário, figurino, maquiador e deslocamento.</p>
              </div>

              <div className="group">
                <div className="w-16 h-16 rounded-full border border-studio-gold/30 bg-studio-gold/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-studio-gold/20 transition-all duration-300">
                  <span className="text-studio-gold text-2xl font-bold font-display">02</span>
                </div>
                <h3 className="text-xl font-bold font-display uppercase tracking-widest mb-4">Agilidade Incomparável</h3>
                <p className="text-gray-400 font-light leading-relaxed">Sem agendamentos, espera na agenda ou trânsito. Acesso <strong className="text-white">disponível 24/7</strong> na palma da sua mão a qualquer momento.</p>
              </div>

              <div className="group">
                <div className="w-16 h-16 rounded-full border border-studio-gold/30 bg-studio-gold/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-studio-gold/20 transition-all duration-300">
                  <span className="text-studio-gold text-2xl font-bold font-display">03</span>
                </div>
                <h3 className="text-xl font-bold font-display uppercase tracking-widest mb-4">Qualidade Fotorealista</h3>
                <p className="text-gray-400 font-light leading-relaxed">Nossa <strong className="text-white">tecnologia de IA de ponta</strong> captura e mantém sua essência real, criando sombras, bordas e luzes 100% físicas e convincentes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-studio-black border-t border-white/5" id="faq">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-display italic">PERGUNTAS <span className="text-studio-gold">FREQUENTES</span></h2>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-light">Tudo o que você precisa saber sobre o Virtual Studio</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden hover:border-studio-gold/30 transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className={`text-lg transition-colors duration-300 ${activeFaq === index ? 'text-studio-gold font-bold' : 'text-gray-200 group-hover:text-white'}`}>
                    {faq.question}
                  </span>
                  {activeFaq === index ? (
                    <ChevronUp className="text-studio-gold shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-500 group-hover:text-studio-gold shrink-0 transition-all" size={20} />
                  )}
                </button>
                <AnimatePresence mode="wait">
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-8 pb-6 text-gray-400 font-light leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm mb-6">Ainda tem dúvidas? Fale com nosso suporte.</p>
            <a href="mailto:suporte@virtualstudio.click" className="text-studio-gold font-bold border-b border-studio-gold/30 pb-1 hover:text-studio-gold-light transition-all">
              suporte@virtualstudio.click
            </a>
          </div>
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