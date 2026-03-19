'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Camera, ChevronLeft, ChevronRight, Check, CheckCheck, Star, Play, Instagram, Linkedin, Twitter, Menu, X, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

const testimonials = [
  {
    id: 1,
    name: "Roberto Tech",
    img: "/profile_roberto.png",
    status: "Online",
    msgs: [
      { sender: "client", text: "Fala Bruno, beleza? Cara, passei pra avisar q botei a foto nova do Virtual Studio no LinkedIn ontem.", time: "09:41" },
      { sender: "client", text: "bicho, ja recebi 3 inbounds de recrutador hj! Todo mundo elogiando a foto kkk, disseram q passei mó autoridade. Valeu dms!! 💪🔥", time: "09:42" },
      { sender: "vs", text: "Tamo junto, Roberto! Sabia que ia dar certo. Foco na autoridade é tudo 🤜", time: "09:45" }
    ]
  },
  {
    id: 2,
    name: "Camila Lookbook",
    img: "/profile_camila.png",
    status: "Online",
    msgs: [
      { sender: "client", text: "Amigaaa vc n tem noção! Postei as fotos do ensaio da IA e meu insta EXPLODIU 💥💥💥", time: "20:15" },
      { sender: "client", text: "Todo mundo perguntando se eu viajei pra Milão pra fazer 😂 Ninguém acredita q foi o Virtual Studio. Ficou PERFEITO o rosto, n parece boneco. Ja to marcando o próximo! 😍📸", time: "20:16" },
      { sender: "vs", text: "Hahaha q top Camila! Seus amigos n perdem por esperar. Próximo ensaio já to bolando uns temas massa 💥", time: "20:20" }
    ]
  },
  {
    id: 3,
    name: "Dr. Andre Card",
    img: "/profile_andre.png",
    status: "visto por último às 15:42",
    msgs: [
      { sender: "client", text: "Boa tarde. Confesso que estava cético com essa história de IA, mas o resultado final do Virtual Studio me surpreendeu positivamente.", time: "16:30" },
      { sender: "client", text: "As fotos ficaram naturais e com excelente iluminação profissional. Já configurei meu perfil médico com elas. Trabalho de excelência. Parabéns à equipe. 👍🤝", time: "16:32" },
      { sender: "vs", text: "Muito obrigado, Dr. Andre. Nossa curadoria humana garante q a essência fique intacta. Sucesso na clínica!", time: "16:45" }
    ]
  },
  {
    id: 4,
    name: "Aline Trip",
    img: null,
    status: "Online",
    msgs: [
      { sender: "client", text: "Bicho, acabei de ver as fotos da Noruega q o VS fez. Ninguém acredita q eu n fui kkk. Ficou mto real, os reflexos, tudo.", time: "11:10" },
      { sender: "vs", text: "Nossa IA simula até a luz ambiente, Aline. Sabia q vc ia curtir a imersão! 🌍🏔️", time: "11:15" }
    ]
  },
  {
    id: 5,
    name: "Carlos Exec",
    img: null,
    status: "Online",
    msgs: [
      { sender: "client", text: "R$ 397 pra 50 fotos prontas em 24h? O estúdio aqui cobrou R$ 1.200 e 15 dias pra entregar 10. O VS é o futuro.", time: "14:20" },
      { sender: "vs", text: "Tempo é dinheiro, Carlos. A gente entende as dores do executivo. Fico feliz q tenha poupado ambos! 🤝💨", time: "14:25" }
    ]
  },
  {
    id: 6,
    name: "Juliana Model",
    img: null,
    status: "visto por último às 10:00",
    msgs: [
      { sender: "client", text: "Fiz a galeria Editorial de Moda. O resultado superou dms minhas agências reais. To chocada com a curadoria.", time: "10:05" },
      { sender: "vs", text: "Nossa Lead Irina Sova revisa cada foto, Ju. O olhar artístico é o nosso diferencial. 🤜📸", time: "10:10" }
    ]
  },
  {
    id: 7,
    name: "Marcos Imóveis",
    img: null,
    status: "Online",
    msgs: [
      { sender: "client", text: "Fala time Virtual Studio! O perfil novo do Google Meu Negócio bombou hj kkk. A foto corporativa com IA me deu mó moral.", time: "17:40" },
      { sender: "vs", text: "Tamo junto, Marcos! A autoridade visual ajuda a fechar mais negócios. Sucesso! 👍🤜", time: "17:45" }
    ]
  },
  {
    id: 8,
    name: "Paula Mãe",
    img: null,
    status: "Online",
    msgs: [
      { sender: "client", text: "Gente, criei um ensaio Lifestyle Mãe e Filho e chorei kkk. As fotos com meu filho de 3 anos ficaram emocionantes. Mto obrigado.", time: "09:30" },
      { sender: "vs", text: "Nossa Paula! Esse é o melhor feedback q a gente podia receber. É sobre capturar essência, n só pixels. ❤️👶", time: "09:35" }
    ]
  },
  {
    id: 9,
    name: "Pedro Burger",
    img: null,
    status: "visto por último ontem",
    msgs: [
      { sender: "client", text: "Bicho, as fotos do VS pro cardápio novo e pro Insta ficaram PERFEITAS. Os burguers parecem mais suculentos q os reais 😂", time: "21:00" },
      { sender: "vs", text: "Hahaha q top, Pedro! A IA tbm sabe de gastronomia kkk. Sucesso nas vendas! 🍔💥", time: "21:05" }
    ]
  },
  {
    id: 10,
    name: "Tiago Ator",
    img: null,
    status: "Online",
    msgs: [
      { sender: "client", text: "Gastei mó grana com headshots normais q pareciam estáticos. O VS gerou uns com expressões naturais perfeitas pro casting.", time: "13:15" },
      { sender: "vs", text: "Casting natural é o foco, Tiago. Sabia q nossa IA ia te destacar dos concorrentes. Boa sorte! 👍💥", time: "13:20" }
    ]
  }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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

      {/* Testimonials / Social Proof (Dark Mode WhatsApp Carousel) */}
      <section className="py-24 bg-studio-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-studio-gold/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">O QUE NOSSOS CLIENTES ESTÃO DIZENDO</h2>
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

                const isCenter = offset === 0;
                const absOffset = Math.abs(offset);

                // Position logic: hide cards that are too far
                if (absOffset > 2) return null;

                // Adjust translateX, scale and opacity for 3D overlap effect
                const translateX = offset * 340;
                const scale = isCenter ? 1 : Math.max(0.7, 0.9 - (absOffset * 0.1));
                const zIndex = 50 - absOffset;
                const opacity = isCenter ? 1 : Math.max(0, 0.6 - (absOffset * 0.2));

                return (
                  <div
                    key={test.id}
                    className="absolute top-1/2 left-1/2 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                      zIndex,
                      opacity,
                      pointerEvents: isCenter ? 'auto' : 'auto',
                    }}
                    onClick={() => !isCenter && setActiveTestimonial(index)}
                  >
                    {/* WhatsApp Phone Frame */}
                    <div className={`bg-[#111b21] rounded-[2.5rem] overflow-hidden shadow-2xl relative border-[6px] border-[#1C1C1E] transition-all duration-500 w-full max-w-[320px] min-w-[320px] ${!isCenter && 'pointer-events-none'}`}>
                      {/* Fake Phone Notch */}
                      <div className="absolute top-0 inset-x-0 h-6 bg-[#1C1C1E] rounded-b-2xl mx-16 z-20"></div>

                      {/* Header */}
                      <div className="bg-[#202c33] pt-8 pb-4 px-4 flex items-center gap-3 text-[#e9edef] relative z-10 border-b border-[#2a3942]">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#005c4b] flex items-center justify-center">
                          {test.img ? (
                            <Image src={test.img} alt={test.name} fill className="object-cover" />
                          ) : (
                            <span className="text-[#e9edef] font-bold text-[15px]">
                              {test.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-semibold text-base leading-none text-[#e9edef] truncate">{test.name}</p>
                          <p className="text-xs text-[#8696a0] mt-1 truncate">{test.status}</p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 h-[420px] bg-[#0b141a] flex flex-col justify-start gap-2 relative overflow-y-auto custom-scrollbar" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(11, 20, 26, 0.95)' }}>
                        <div className="bg-[#182229] border border-[#202c33] text-[#8696a0] text-[11px] py-1 px-3 rounded-lg self-center mb-3 mt-1 shadow-sm font-medium">Hoje</div>

                        {test.msgs.map((msg, idx) => (
                          <div key={idx} className={`p-[10px] rounded-xl shadow-md max-w-[90%] relative mt-1 flex flex-col ${msg.sender === 'vs' ? 'bg-[#005c4b] self-end rounded-tr-sm' : 'bg-[#202c33] self-start rounded-tl-sm'}`}>
                            <p className="text-[#e9edef] text-[13.5px] leading-[1.4] pr-[40px] whitespace-pre-wrap">{msg.text}</p>
                            <div className="absolute bottom-1 right-2 flex items-center gap-[2px]">
                              <span className="text-[#8696a0] text-[10px] min-w-[30px] text-right font-medium">{msg.time}</span>
                              {msg.sender === 'vs' && <CheckCheck size={14} className="text-[#53bdeb]" />}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Fade Overlay when not in focus */}
                      {!isCenter && (
                        <div className="absolute inset-0 bg-studio-black/40 z-30 transition-opacity duration-500"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 lg:left-[5%] xl:left-[10%] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-studio-gray/80 border border-white/10 flex items-center justify-center text-white hover:bg-studio-gold hover:border-studio-gold hover:text-black transition-all z-50 backdrop-blur-md shadow-lg"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 lg:right-[5%] xl:right-[10%] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-studio-gray/80 border border-white/10 flex items-center justify-center text-white hover:bg-studio-gold hover:border-studio-gold hover:text-black transition-all z-50 backdrop-blur-md shadow-lg"
              aria-label="Próximo"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots Indicators */}
          <div className="flex justify-center items-center gap-3 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${activeTestimonial === i ? 'w-10 h-2 bg-studio-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
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

          <div className="space-y-12">
            {/* Pacote 1: ESSENTIAL - Staggered Left */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16 p-8 md:p-12 bg-studio-gray/10 border border-white/5 hover:border-studio-gold/30 transition-all duration-500 rounded-2xl group"
            >
              <div className="md:w-1/3 relative aspect-square rounded-xl overflow-hidden shadow-2xl">
                 <Image src="/corporativo.png" alt="Essential Package" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 to-transparent"></div>
                 <div className="absolute bottom-4 left-4">
                   <span className="text-studio-gold font-display text-lg">ESSENTIAL</span>
                 </div>
              </div>
              <div className="md:w-2/3 flex flex-col justify-center">
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
                <button className="self-start px-8 py-4 bg-transparent border border-studio-gold text-studio-gold font-bold uppercase tracking-widest hover:bg-studio-gold hover:text-studio-black transition-all flex items-center gap-3 group/btn">
                  Iniciar Transformação <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Pacote 2: PRO - Full Width Highlight */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-16 bg-studio-black border-2 border-studio-gold rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(195,157,93,0.15)] group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-studio-gold/10 blur-[100px] pointer-events-none"></div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-studio-gold text-studio-black text-[10px] font-bold px-6 py-2 uppercase tracking-widest rounded-b-lg">Preferido pelos Leads</div>
              
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/2">
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
                  <button className="w-full md:w-auto px-12 py-5 bg-studio-gold text-studio-black font-extrabold uppercase tracking-[0.2em] hover:bg-studio-gold-light hover:scale-105 transition-all shadow-xl shadow-studio-gold/20 flex items-center justify-center gap-4">
                    QUERO SER PRO <ArrowRight size={20} />
                  </button>
                </div>
                <div className="md:w-1/2 relative">
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
              <div className="md:w-1/3 relative aspect-square rounded-xl overflow-hidden shadow-2xl">
                 <Image src="/estilo-cinematográfico.jpeg" alt="Ultra Package" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 to-transparent"></div>
                 <div className="absolute bottom-4 left-4">
                   <span className="text-studio-gold font-display text-lg">ULTRA</span>
                 </div>
              </div>
              <div className="md:w-2/3 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl mb-4 text-white">Domínio Editorial e Escala Global</h3>
                <p className="text-gray-400 mb-8 leading-relaxed font-light text-lg">
                  Para quem não aceita nada menos que o auge. <strong className="text-white">50 fotos lendárias</strong> abrangendo até 10 estilos cinematográficos. Transforme sua imagem em um império visual com fotos que parecem ter saído das maiores revistas de moda do mundo.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-gray-300 font-light italic">"A maior diversidade de poses e cenários para sua marca."</li>
                </ul>
                <button className="self-start px-8 py-4 bg-transparent border border-studio-gold text-studio-gold font-bold uppercase tracking-widest hover:bg-studio-gold hover:text-studio-black transition-all flex items-center gap-3 group/btn">
                  Alcançar o Topo <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

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
                <p className="text-gray-400 font-light leading-relaxed">Sem agendamentos, espera na agenda ou trânsito. Acesso <strong className="text-white">disponível 24/7</strong> para você criar na palma da sua mão a qualquer momento.</p>
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

      {/* Footer */}
      <footer className="py-16 bg-studio-black text-center relative border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <div className="relative w-[280px] h-[280px] mx-auto -mt-10 -mb-24">
              <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" />
            </div>
            <h4 className="font-display tracking-[0.3em] text-xl relative z-10">VIRTUAL STUDIO</h4>
            <p className="text-gray-500 text-xs mt-2 uppercase relative z-10">© 2026 VIRTUAL STUDIO - TODOS OS DIREITOS RESERVADOS</p>
          </div>
          <div className="flex justify-center gap-6 mb-12">
            <a className="text-studio-gold hover:text-white transition" href="#"><Instagram size={20} /></a>
            <a className="text-studio-gold hover:text-white transition" href="#"><Linkedin size={20} /></a>
            <a className="text-studio-gold hover:text-white transition" href="#"><Twitter size={20} /></a>
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