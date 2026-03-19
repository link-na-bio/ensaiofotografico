'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, CheckCheck, Star, ArrowRight, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

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

// O Array original com os seus prints de tela
const testimonials = [
  { id: 1, name: "Roberto T.", img: "/01.jpeg" },
  { id: 2, name: "Camila", img: "/02.jpeg" },
  { id: 3, name: "Dr. Andre", img: "/03.jpeg" },
  { id: 4, name: "Aline", img: "/04.jpeg" },
  { id: 5, name: "Carlos Exec.", img: "/05.jpeg" },
  { id: 6, name: "Juliana Model", img: "/06.jpeg" },
  { id: 7, name: "Mauro A.", img: "/07.jpeg" },
  { id: 8, name: "Paula", img: "/08.jpeg" },
  { id: 9, name: "Pedro Burger", img: "/09.jpeg" },
  { id: 10, name: "Tiago A.", img: "/10.jpeg" }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(1200);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Função matemática para o loop infinito
  const getOffset = (index: number) => {
    let offset = index - activeTestimonial;
    const total = testimonials.length;
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;
    return offset;
  };

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-studio-black overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-studio-black/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <nav className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
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
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-studio-gold text-studio-black px-8 py-3.5 font-bold uppercase tracking-widest hover:scale-105 transition-transform text-center text-sm shadow-xl shadow-studio-gold/20 rounded-lg">
              SOLICITAR MEU ENSAIO <ArrowRight size={16} />
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

      {/* NOVA SEÇÃO DE DEPOIMENTOS: IMAGENS 3D (PRINTS ORIGINAIS) - CORRIGIDA E À PROVA DE FALHAS */}
      <section className="py-24 bg-studio-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-studio-gold/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display italic uppercase">
              O QUE NOSSOS CLIENTES <span className="text-studio-gold">ESTÃO DIZENDO</span>
            </h2>
            <p className="text-studio-gold tracking-widest uppercase text-sm font-light">
              Mais de 1.500 ensaios gerados com 100% de satisfação
            </p>
          </div>

          {/* O Carrossel 3D CoverFlow */}
          {/* Flexbox centraliza todos os itens absolutos com perfeição */}
          <div className="relative h-[600px] w-full max-w-6xl mx-auto flex items-center justify-center overflow-hidden">

            {testimonials.map((test, index) => {
              const offset = getOffset(index);
              const absOffset = Math.abs(offset);

              // Constantes para controlar se o cartão aparece na tela
              const isActive = absOffset <= 2;
              const isCenter = offset === 0;
              const distanceX = windowWidth < 768 ? 140 : 250;

              return (
                <motion.div
                  key={test.id}
                  onClick={() => !isCenter && setActiveTestimonial(index)}
                  className={`absolute w-[260px] h-[520px] md:w-[280px] md:h-[560px] rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300 bg-studio-black ${isCenter ? 'border-2 border-studio-gold cursor-default' : 'border border-white/10 cursor-pointer'}`}
                  style={{ pointerEvents: isActive ? "auto" : "none" }}
                  initial={false}
                  animate={{
                    // Animação usando números puros, sem travar o React!
                    x: offset * distanceX,
                    scale: isActive ? 1 - absOffset * 0.15 : 0.5,
                    zIndex: 20 - absOffset,
                    opacity: isActive ? (1 - absOffset * 0.3) : 0,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                >
                  <Image
                    src={test.img}
                    alt={`Depoimento ${test.name}`}
                    fill
                    className="object-contain"
                    priority={isCenter}
                  />
                  {/* Máscara preta escurecendo as imagens laterais */}
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/60 transition-all duration-300 hover:bg-black/40" />
                  )}
                </motion.div>
              );
            })}

            {/* Setas de navegação */}
            <button
              onClick={prevTestimonial}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-studio-black/80 backdrop-blur-md border border-studio-gold/50 flex items-center justify-center text-studio-gold hover:bg-studio-gold hover:text-black transition-all shadow-xl z-50 cursor-pointer"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-studio-black/80 backdrop-blur-md border border-studio-gold/50 flex items-center justify-center text-studio-gold hover:bg-studio-gold hover:text-black transition-all shadow-xl z-50 cursor-pointer"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Pontos de Navegação Inferiores */}
          <div className="flex justify-center items-center gap-3 mt-8 relative z-50">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer h-2 ${activeTestimonial === i
                    ? 'w-10 bg-studio-gold shadow-[0_0_10px_rgba(195,157,93,0.5)]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                aria-label={`Ir para depoimento ${i + 1}`}
              />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pacote 1: ESSENTIAL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col bg-studio-gray/10 border border-white/5 hover:border-studio-gold/30 transition-all duration-500 rounded-3xl group overflow-hidden"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image src="/corporativo.png" alt="Essential Package" fill className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="text-studio-gold font-display text-xl tracking-widest">ESSENTIAL</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl mb-4 text-white font-bold uppercase tracking-tight">O Começo da Sua Nova Versão</h3>
                <p className="text-gray-400 mb-8 leading-relaxed font-light text-sm flex-grow">
                  Ideal para quem precisa de um impacto imediato. Receba <strong className="text-white text-base">10 fotos de alta resolução</strong> em até 2 estilos distintos. Perfeito para seu perfil no LinkedIn ou WhatsApp.
                </p>
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <Check size={14} className="text-studio-gold" /> Curadoria Humana
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <Check size={14} className="text-studio-gold" /> Entrega em 24h
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pacote 2: PRO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col bg-studio-gray/10 border border-white/5 hover:border-studio-gold/30 transition-all duration-500 rounded-3xl group overflow-hidden"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image src="/editorial-de-moda.png" alt="Pro Package" fill className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="text-studio-gold font-display text-xl tracking-widest">PRO</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl mb-4 text-white font-bold uppercase tracking-tight">Identidade Visual Completa</h3>
                <p className="text-gray-400 mb-8 leading-relaxed font-light text-sm flex-grow">
                  A escolha para empreendedores e criadores. Com <strong className="text-white text-base">25 fotos de nível editorial</strong> em até 5 estilos. Conteúdo para meses de postagens de alta autoridade e confiança.
                </p>
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <Star size={14} className="text-studio-gold fill-studio-gold" /> 5 Estilos Exclusivos
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <CheckCheck size={14} className="text-studio-gold" /> Suporte Prioritário
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <Zap size={14} className="text-studio-gold" /> Processamento Turbo
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pacote 3: ULTRA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col bg-studio-gray/10 border border-white/5 hover:border-studio-gold/30 transition-all duration-500 rounded-3xl group overflow-hidden"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image src="/estilo-cinematográfico.jpeg" alt="Ultra Package" fill className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="text-studio-gold font-display text-xl tracking-widest">ULTRA</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl mb-4 text-white font-bold uppercase tracking-tight">Domínio Editorial e Escala Global</h3>
                <p className="text-gray-400 mb-8 leading-relaxed font-light text-sm flex-grow">
                  Para quem não aceita nada menos que o auge. <strong className="text-white text-base">50 fotos lendárias</strong> em até 10 estilos cinematográficos. Transforme sua imagem em um império visual de elite.
                </p>
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-xs text-gray-300 italic">
                    <Check size={14} className="text-studio-gold" /> Estilos revistas de moda
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300 italic">
                    <Check size={14} className="text-studio-gold" /> "A maior diversidade de poses"
                  </div>
                </div>
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
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-studio-gold text-studio-black px-8 py-3.5 font-bold uppercase tracking-widest hover:scale-105 transition-transform text-center text-sm shadow-xl shadow-studio-gold/20 rounded-lg"
            >
              SOLICITAR MEU ENSAIO <ArrowRight size={16} />
            </Link>
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