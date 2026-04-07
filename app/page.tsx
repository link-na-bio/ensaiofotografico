'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, CheckCheck, Star, ArrowRight, Zap, ChevronDown, ChevronUp, Sparkles, Instagram, Layers, MousePointerClick, Heart, Handshake, Mail, PlusCircle } from 'lucide-react';
import SalesNotification from '@/components/SalesNotification';
import Link from 'next/link';

const faqs = [
  {
    question: "Como funciona o Virtual Studio?",
    answer: "Nosso sistema de IA avançado analisa suas fotos para criar um modelo digital personalizado. Em seguida, nossos artistas aplicam curadoria humana para gerar retratos profissionais que mantêm sua essência real e autoridade visual."
  },
  {
    question: "Como funciona a escolha dos Estilos?",
    answer: "No nosso modelo 'À La Carte', você tem total controle. Cada estilo selecionado no catálogo equivale a 1 foto final. A nossa IA aplicará o seu rosto mantendo a estética, a iluminação, a roupa e o cenário exatos do card escolhido. Você sabe exatamente a direção de arte que vai receber, sem surpresas, garantindo um ensaio incrivelmente realista e focado no seu objetivo."
  },
  {
    question: "Quantas fotos eu preciso enviar?",
    answer: "Recomendamos o envio de 5 a 10 fotos nítidas do seu rosto, de diferentes ângulos e expressões. Quanto melhores as fotos enviadas, melhor nossa IA poderá aprender sua fisionomia para resultados perfeitos."
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

  const cardRef1 = useRef(null);
  const cardRef2 = useRef(null);
  const cardRef3 = useRef(null);

  const { scrollYProgress: s1 } = useScroll({ target: cardRef1, offset: ["start end", "end start"] });
  const { scrollYProgress: s2 } = useScroll({ target: cardRef2, offset: ["start end", "end start"] });
  const { scrollYProgress: s3 } = useScroll({ target: cardRef3, offset: ["start end", "end start"] });

  const filter1 = useTransform(s1, [0, 0.3], ["grayscale(100%)", "grayscale(0%)"]);
  const filter2 = useTransform(s2, [0, 0.3], ["grayscale(100%)", "grayscale(0%)"]);
  const filter3 = useTransform(s3, [0, 0.3], ["grayscale(100%)", "grayscale(0%)"]);

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

  const EVENTO_SAZONAL = {
    ativo: true,
    titulo: 'Especial Dia das Mães 🌹',
    descricao: 'Surpreenda com uma foto perfeita! 1 Estilo Temático em altíssima resolução.',
    preco: 'R$ 19,90', // Mantido para referência interna se necessário, mas ocultado no visual
  };

  return (
    <div className="min-h-screen bg-studio-black overflow-x-hidden selection:bg-studio-gold selection:text-studio-black">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-studio-black/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <nav className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative w-[200px] h-[200px] -my-[80px] flex items-center justify-center z-10 pointer-events-none">
              <Image src="/logo.2.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
            </div>
            <span className="font-display text-lg tracking-widest hidden md:block"></span>
          </div>
          <ul className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-display">
            <li><a className="hover:text-studio-gold transition" href="#galeria">Estilos</a></li>
            <li><a className="hover:text-studio-gold transition" href="#processo">Processo</a></li>
            <li><a className="hover:text-studio-gold transition" href="#precos">Packs</a></li>
            <li><a className="hover:text-studio-gold transition" href="#contato">Contato</a></li>
          </ul>
          <Link href="/signup" className="bg-studio-gold text-studio-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-studio-gold-light transition hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]">
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
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-studio-gold text-studio-black px-8 py-3.5 font-bold uppercase tracking-widest hover:scale-105 transition-transform text-center text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg">
              SOLICITAR MEU ENSAIO <ArrowRight size={16} />
            </Link>
            <Link href="/galeria" className="border border-white/30 backdrop-blur-sm px-10 py-4 font-bold uppercase tracking-widest hover:bg-white/10 transition text-center rounded-lg">
              Ver Galeria
            </Link>
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
                  <p className="text-gray-200">Resultados de nível editorial em pouco tempo, escolhendo cenários e roupas incríveis, com curadoria artística humana.</p>
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
            { title: 'Casual', img: 'https://ruildppqtxrgycgsactu.supabase.co/storage/v1/object/public/estilos_imagens/1774210309215.jpg', offset: false },
            { title: 'Estúdio', img: '/editorial-de-moda.png', offset: true },
            { title: 'Lifestyle Urbano', img: '/lifestyleurbano.png', offset: false },
            { title: 'Executivo/Corporativo', img: 'https://ruildppqtxrgycgsactu.supabase.co/storage/v1/object/public/estilos_imagens/1774208652539.jpg', offset: true }
          ].map((style, i) => (
            <div key={i} className={`relative group h-[500px] overflow-hidden ${style.offset ? 'md:mt-12' : ''}`}>
              <div className="absolute inset-0 bg-studio-black scale-[1.08] translate-y-3 origin-center">
                <Image
                  src={style.img}
                  alt={style.title}
                  fill
                  className="object-contain transition duration-700 group-hover:scale-110"
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
        <div className="mt-16 text-center">
          <Link href="/galeria" className="inline-flex items-center justify-center gap-2 border border-studio-gold text-studio-gold px-10 py-4 font-bold uppercase tracking-widest hover:bg-studio-gold hover:text-studio-black transition-all text-sm rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            Ver Todos os Estilos <ArrowRight size={16} />
          </Link>
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
              { step: '01', title: 'Upload', desc: 'Envie de 5 a 10 fotos suas de diferentes ângulos para treinar nossa IA.' },
              { step: '02', title: 'Estilo', desc: 'Escolha entre nossos +100 estilos no modelo À La Carte.' },
              { step: '03', title: 'Geração', desc: 'Nossa IA recria você perfeitamente nos cenários e iluminações escolhidos.' },
              { step: '04', title: 'Curadoria', desc: 'Nossos artistas selecionam e retocam as imagens para uma perfeição absoluta.' },
              { step: '05', title: 'Entrega', desc: 'Receba seu ensaio em alta resolução pronto para as suas redes.' }
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

      {/* DEPOIMENTOS: IMAGENS 3D */}
      <section className="py-24 bg-studio-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-studio-gold/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display italic uppercase">
              O QUE NOSSOS CLIENTES <span className="text-studio-gold">ESTÃO DIZENDO</span>
            </h2>
            <p className="text-studio-gold tracking-widest uppercase text-sm font-light">
              Mais de 500 ensaios gerados com 100% de satisfação
            </p>
          </div>

          <div className="relative h-[600px] w-full max-w-6xl mx-auto flex items-center justify-center overflow-hidden">

            {testimonials.map((test, index) => {
              const offset = getOffset(index);
              const absOffset = Math.abs(offset);
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
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/60 transition-all duration-300 hover:bg-black/40" />
                  )}
                </motion.div>
              );
            })}

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
            <p className="text-gray-400 tracking-widest uppercase text-sm font-light">Escolha a escala da sua transformação visual com Descontos Progressivos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pacote 1: ESSENCIAL */}
            <Link href="/signup" className="block">
              <motion.div
                ref={cardRef1}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col h-full bg-studio-gray/10 border border-white/5 hover:border-studio-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500 rounded-3xl group overflow-hidden cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <motion.div
                    className="w-full h-full"
                    style={{ filter: windowWidth < 768 ? filter1 : "none" }}
                  >
                    <Image
                      src="/corporativo.png"
                      alt="Essencial Package"
                      fill
                      className={`object-cover object-top transition-all duration-700 ${windowWidth >= 768 ? 'grayscale group-hover:grayscale-0 group-hover:scale-105' : ''}`}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 flex flex-col">
                    <span className="text-studio-gold font-display text-xl tracking-[0.2em] font-bold">ESSENCIAL</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-lg mb-4 text-white font-bold uppercase tracking-tight">O Começo da Sua Nova Versão</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed font-light text-sm flex-grow">
                    Para testar a tecnologia ou atualizar o LinkedIn com praticidade e sofisticação imediata.
                  </p>
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> <strong>5 fotos</strong> em Alta Resolução
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Escolha de <strong>5 estilos</strong> exatos
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Curadoria manual de qualidade
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Sem marca d'água
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Entrega em até 72h
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Licença Comercial
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Pacote 2: PREMIUM */}
            <Link href="/signup" className="block">
              <motion.div
                ref={cardRef2}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col h-full bg-studio-gray/10 border-2 border-studio-gold shadow-[0_0_40px_rgba(195,157,93,0.15)] hover:shadow-[0_0_60px_rgba(195,157,93,0.3)] hover:-translate-y-2 transition-all duration-500 rounded-3xl group overflow-hidden relative cursor-pointer"
              >
                <div className="absolute top-4 right-4 z-20">
                  <span className="bg-studio-gold text-studio-black text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded-full shadow-lg">Mais Vendido</span>
                </div>
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <motion.div
                    className="w-full h-full"
                    style={{ filter: windowWidth < 768 ? filter2 : "none" }}
                  >
                    <Image
                      src="/editorial-de-moda.png"
                      alt="Premium Package"
                      fill
                      className={`object-cover object-top transition-all duration-700 ${windowWidth >= 768 ? 'grayscale group-hover:grayscale-0 group-hover:scale-105' : ''}`}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 flex flex-col">
                    <span className="text-studio-gold font-display text-xl tracking-[0.2em] font-bold">PREMIUM</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-lg mb-4 text-white font-bold uppercase tracking-tight">Identidade Visual Completa</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed font-light text-sm flex-grow">
                    O pacote ideal para profissionais que querem variedade para o Instagram e material corporativo.
                  </p>
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Star size={14} className="text-studio-gold fill-studio-gold" /> <strong>10 fotos</strong> em Alta Resolução
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <CheckCheck size={14} className="text-studio-gold" /> Escolha de <strong>10 estilos</strong> exatos
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <CheckCheck size={14} className="text-studio-gold" /> Curadoria manual de qualidade
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <CheckCheck size={14} className="text-studio-gold" /> Sem marca d'água
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <CheckCheck size={14} className="text-studio-gold" /> Entrega em até 72h
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <CheckCheck size={14} className="text-studio-gold" /> Licença Comercial
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Pacote 3: ELITE */}
            <Link href="/signup" className="block">
              <motion.div
                ref={cardRef3}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col h-full bg-studio-gray/10 border border-white/5 hover:border-studio-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500 rounded-3xl group overflow-hidden cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <motion.div
                    className="w-full h-full"
                    style={{ filter: windowWidth < 768 ? filter3 : "none" }}
                  >
                    <Image
                      src="/img2594.jpg"
                      alt="Elite Package"
                      fill
                      className={`object-cover object-top transition-all duration-700 ${windowWidth >= 768 ? 'grayscale group-hover:grayscale-0 group-hover:scale-105' : ''}`}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 flex flex-col">
                    <span className="text-studio-gold font-display text-xl tracking-[0.2em] font-bold">ELITE</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-lg mb-4 text-white font-bold uppercase tracking-tight">Domínio Editorial e Rebranding Total</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed font-light text-sm flex-grow">
                    Para CEOs e palestrantes que precisam de um arsenal completo para rebranding total.
                  </p>
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Zap size={14} className="text-studio-gold shadow-[0_0_10px_rgba(195,157,93,0.5)]" /> <strong>20 fotos</strong> em Alta Resolução
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Escolha de <strong>20 estilos</strong> exatos
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300 font-bold text-studio-gold">
                      <Sparkles size={14} /> Retoque FINO avançado
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Sem marca d'água
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Entrega em até 48h
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-studio-gold" /> Licença Comercial
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Botão Único Final e Amostra VIP */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto"
          >
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-studio-gold text-studio-black px-10 py-4 font-bold uppercase tracking-widest hover:scale-105 transition-transform text-center text-sm shadow-[0_0_30px_rgba(212,175,55,0.4)] rounded-lg mb-8"
            >
              SOLICITAR MEU ENSAIO <ArrowRight size={18} />
            </Link>

            {/* Card Estilo Especial Sazonal (Dia das Mães) */}
            {EVENTO_SAZONAL.ativo && (
              <Link href="/signup" className="block w-full">
                <div className="border-2 border-purple-500/30 hover:border-purple-500/60 bg-gradient-to-r from-purple-900/40 to-studio-black/80 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden text-left shadow-[0_0_30px_rgba(168,85,247,0.15)] cursor-pointer">
                  <div className="absolute top-0 right-0 bg-studio-gold text-studio-black text-[10px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-xl shadow-lg z-20">TEMPO LIMITADO</div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/20 group-hover:scale-110 transition-transform">
                        <Heart size={20} fill="currentColor" className="opacity-80" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold font-display uppercase tracking-widest text-white group-hover:text-studio-gold transition-colors">{EVENTO_SAZONAL.titulo}</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">{EVENTO_SAZONAL.descricao}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="px-2 py-0.5 bg-studio-gold/10 border border-studio-gold/20 rounded text-[9px] font-bold text-studio-gold uppercase tracking-wider">1 Estilo Temático</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 flex flex-col items-center sm:items-end gap-2">
                      <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest bg-white/5 px-6 py-3 rounded-lg border border-white/10 group-hover:bg-studio-gold group-hover:text-studio-black transition-all">
                        <PlusCircle size={16} /> Adicionar
                      </div>
                    </div>
                  </div>
                  {/* Subtle Glow Effect */}
                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-purple-500/10 blur-[60px] pointer-events-none"></div>
                </div>
              </Link>
            )}

            <p className="mt-8 text-gray-500 text-sm italic font-light tracking-widest uppercase">Comece agora sua jornada definitiva de imagem</p>
          </motion.div>

          <div className="mt-24 border-t border-white/10 pt-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">POR QUE ESCOLHER O VIRTUAL STUDIO?</h2>
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

      {/* Ecosystem / Partners — subtle strip */}
      <section className="py-12 bg-studio-black border-t border-white/5" id="ecossistema">
        <div className="container mx-auto px-6">

          <div className="mb-10 text-center mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 uppercase tracking-tight">
              Ferramentas <span className="text-studio-gold italic">Recomendadas</span>
            </h2>
            <p className="text-gray-500 text-sm font-light leading-relaxed max-w-xl mx-auto">
              Potencialize os seus resultados nas redes sociais com as plataformas parceiras do Virtual Studio.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Social Prime */}
            <a
              href="https://www.socialprime.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 p-5 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden mb-1 bg-white/5 flex items-center justify-center">
                <img
                  src="https://www.google.com/s2/favicons?domain=socialprime.space&sz=64"
                  alt="Social Prime logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-200 transition-colors">Social Prime</span>
              <span className="text-[11px] text-gray-400 font-light leading-relaxed">Estratégia e crescimento nas redes sociais.</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-studio-gold/70 transition-colors flex items-center gap-1 mt-auto pt-2">
                socialprime.space <ArrowRight size={10} />
              </span>
            </a>

            {/* Link na Bio Pro */}
            <a
              href="https://www.linknabio.pro/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 p-5 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden mb-1 bg-white/5 flex items-center justify-center">
                <img
                  src="https://www.google.com/s2/favicons?domain=linknabio.pro&sz=64"
                  alt="Link na Bio Pro logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-200 transition-colors">Link na Bio Pro</span>
              <span className="text-[11px] text-gray-400 font-light leading-relaxed">Cartão de visitas digital de alta conversão.</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-studio-gold/70 transition-colors flex items-center gap-1 mt-auto pt-2">
                linknabio.pro <ArrowRight size={10} />
              </span>
            </a>

            {/* Social Media Cristã */}
            <a
              href="https://legendas-cristas.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 p-5 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden mb-1 bg-transparent flex items-center justify-center">
                <img
                  src="/logo-legendas-cristas.png"
                  alt="Social Media Cristã logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-200 transition-colors">Social Media Cristã</span>
              <span className="text-[11px] text-gray-400 font-light leading-relaxed">Legendas inspiradoras geradas por IA em segundos.</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-studio-gold/70 transition-colors flex items-center gap-1 mt-auto pt-2">
                legendas-cristas.app <ArrowRight size={10} />
              </span>
            </a>

            {/* Seja um Parceiro */}
            <a
              href="mailto:suporte@virtualstudio.click?subject=Parceria%20Virtual%20Studio&body=Ol%C3%A1%2C%20tenho%20interesse%20em%20ser%20parceiro%20do%20Virtual%20Studio!"
              className="group flex flex-col gap-2 p-5 rounded-xl border border-dashed border-white/5 hover:border-white/15 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden mb-1 bg-white/5 flex items-center justify-center">
                <Handshake size={16} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-200 transition-colors">Seja um Parceiro</span>
              <span className="text-[11px] text-gray-400 font-light leading-relaxed">Anuncie para a nossa base de clientes.</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-studio-gold/70 transition-colors flex items-center gap-1 mt-auto pt-2">
                Falar com a equipa <ArrowRight size={10} />
              </span>
            </a>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-studio-black border-t border-white/5" id="contato">
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
                  <Mail size={16} /> {/* Proper Mail icon */}
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
              <a href="#" className="text-[10px] text-studio-gold uppercase tracking-widest hover:underline opacity-80 pt-1">
                Voltar ao Topo ↑
              </a>
            </div>

          </div>
        </div>
      </footer>

      <SalesNotification />
    </div>
  );
}