'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  CheckCircle,
  Download,
  Receipt,
  ZoomIn,
  Brush,
  Sparkles,
  Instagram,
  Twitter,
  ChevronDown
} from 'lucide-react';

export default function CheckoutSuccess() {
  return (
    <div className="bg-studio-black text-slate-100 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-studio-gold/10 px-6 md:px-20 py-5 bg-studio-black/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-4 text-studio-gold">
          <Camera size={24} />
          <h2 className="text-slate-100 text-xl font-light tracking-[0.2em] uppercase font-display">VIRTUAL STUDIO</h2>
        </Link>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-9">
            <Link className="text-slate-400 hover:text-studio-gold text-[10px] font-medium uppercase tracking-widest transition-colors" href="/dashboard">Minha Galeria</Link>
            <Link className="text-slate-400 hover:text-studio-gold text-[10px] font-medium uppercase tracking-widest transition-colors" href="#">Planos</Link>
            <Link className="text-slate-400 hover:text-studio-gold text-[10px] font-medium uppercase tracking-widest transition-colors" href="#">Suporte</Link>
          </nav>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-studio-gold/30 relative overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABmENFIU2Hz39wX1Ew1reA8nrQ3-xmLOooE9N7XUlH31x4QQiiAV6r80OYFaoh6eHKDOf91C20ujhBe41HMpZQa1OEU8pmrFRKgAujXsOFrnxpXdY1_XO3P1tACimZV6opKdi7F6ch0cWABa3r9rVnQA85lRXjR4WtQpZZdMTxzGJ8EUP4NECP8gxxoVYZ9Yld6bLyf-ajrWJrNbV0Hn5lR2t-nNwXg2psDNKDrUHlDkE7P4FogdLha_AAaRRBlTsxZGUPfAB6WOrB"
              alt="User"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <div className="size-20 rounded-full bg-studio-gold/10 border border-studio-gold/30 flex items-center justify-center text-studio-gold">
            <CheckCircle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase font-display bg-gradient-to-r from-studio-gold via-studio-gold-light to-studio-gold bg-clip-text text-transparent">Pagamento Confirmado!</h1>
            <p className="text-slate-400 text-lg font-light">Seu ensaio exclusivo já está disponível em alta resolução.</p>
          </div>
          <div className="flex gap-4 pt-4">
            <button className="bg-studio-gold hover:bg-studio-gold-light text-studio-black px-8 py-3 rounded-none font-bold text-xs tracking-widest uppercase transition-all shadow-lg shadow-studio-gold/20 flex items-center gap-2 font-display">
              <Download size={18} />
              Baixar Todas as Fotos (HD)
            </button>
          </div>
        </div>

        {/* Plan Summary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 border border-studio-gold/20 bg-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-studio-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 space-y-4 text-center md:text-left">
              <div>
                <p className="text-studio-gold text-[10px] font-bold uppercase tracking-widest mb-1">Pacote Selecionado</p>
                <h3 className="text-2xl font-light text-slate-100 font-display">Plano Premium</h3>
              </div>
              <ul className="text-slate-400 text-xs space-y-2 uppercase tracking-widest">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle size={14} className="text-studio-gold" />
                  50 Fotos em Alta Resolução (TIFF/JPG)
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle size={14} className="text-studio-gold" />
                  Retoque Profissional Incluso
                </li>
              </ul>
            </div>
            <div className="relative z-10 w-full md:w-64 h-40 grayscale hover:grayscale-0 transition-all duration-700">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4kDhNFTT-xf92uZGENYDxcD1nPfcX9KQsyyCkVrjdDZ17CRHz3uuKGXL__AVOAExZQQYNzs2O1nMVfwRi3UJRbt--qbZRk7u9IJVkqFuNIfqQjjkMnWO3UI7Iv_LgMH3bvdfddbxu_3BvCGHVX16WMrFaP8GJBMfmtqF2K-q_WWsNryZHcSIhzbVanodyiZD4V2tX73F5e8cyEgQQLfCSwcyZZyx5ZwVAeXs6vxqcRX-7N5P7rNSjmieR4KN4AQETs8Q3lC6MuWlI"
                alt="Studio"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Receipt Sidebar */}
          <div className="border border-studio-gold/20 bg-white/5 p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-slate-100 text-[10px] font-bold uppercase tracking-widest">Detalhes do Recibo</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase tracking-widest">ID do Pedido</span>
                  <span className="text-slate-300">#STU-1308-9921</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase tracking-widest">Data</span>
                  <span className="text-slate-300">24 Out, 2023</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase tracking-widest">Total</span>
                  <span className="text-studio-gold font-bold">R$ 1.450,00</span>
                </div>
              </div>
            </div>
            <button className="mt-8 border border-studio-gold/40 hover:border-studio-gold text-studio-gold px-4 py-3 text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2">
              <Receipt size={14} />
              Visualizar Nota Fiscal
            </button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-8 border-b border-studio-gold/10 pb-4">
            <h2 className="text-2xl font-light tracking-widest uppercase text-slate-100 font-display">Sua Galeria Digital</h2>
            <span className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">50 Itens selecionados</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAT6zHL5BgaAAPwyKVFjcsARIHWtLYKsvb3iqu94hWaKG15B5m_CR2elZPMC3QhGgEeN8s124flRFvrQDa3iUZt7uG8qTV_aSr5AqoOBuClRdq6XD1Qc-Tx2ENZO0kB8udCvLOh8iYfgowjW2JKNDvwtLR7CQCia9dLIOKGUXzHm8LNYDqkhWsyPHr3pFZ5AEcPvIh69sgSPFmBvtpBB70jIKt39xphz76QIDZ8R72vjGN02HjbngX-iK3bqV3JcQpfBlTYyJYK5aU2',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuA7zyOZjmPsiWiQ2hDZcl4aqQZrIFh3pL08zczwGjq9KC7NAWdEsUuYTJYNtJllKj42zbxDPVhrwkAigTqxUabdbv-iV7YYoHaZ54sjB8oAf4o3ERyBU0Cbv0HoeJZEfprFiFb1Dmo5iGxcbki3X7dE_QnyKVHCe8tmS8PCxkl91P02x3-4QEgi8Dla6iH7bXffxTV7zRMAwr7Z6xOcbxnqpzZnyn69cb9dwafnM6tLVevVLleL7eWxkkjh_zMDF9N1efSTgr3xTC3P',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCKzgFspz5Br7tuqXFH0XOCE_E0HGQfGU7Db33LyMC5zbfGRWqW6YGPAHhGxPujNZJtlE7VQ4D7fZhmqLtpIBMCBraLkRIQKRD1tlHCc8fK5_XaU_FY7ZyZa0kOWrtqV5eibhFzZ8HTVC_WoD2R1isSA57i9PepwZC6IYgPIamrD4lKoIUPRK2mRp6YXaIapkACY7MCQMvEcb1WvBBiZ9bPwX4LrGsSexrlNxa4QylaYpoLhNCRj9q7tdqd24gf_dMCWUyAHwFiTNzx',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBDVhxjV1-Rqeb0rrY40ayEusiYFTMQ7DrUhbTUo242w_q6pW2Dhca53HOZhtOnECJyEJ0tW_XCRdm-ZY4qKDHg-JqWYG50RPlW1j5XiSjvm002xo6Mh6ipW2PXJUa94E1piToUkV87f8k7W4Do3_ULA1X3qLx9KQ3vNG-nZ_rH58CppR632J86Ruzbr9zZvV_g_r-psr2DXXw1MRuLwOEg7ap4kdiUerBSiNvyk8xbD5DoCGnNYXXx9ZtXdB_b3eyuSmXaAQ15fs0F'
            ].map((img, i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden bg-slate-900">
                <Image
                  src={img}
                  alt={`Portrait ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-studio-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <button className="size-10 rounded-full bg-studio-gold text-studio-black flex items-center justify-center">
                    <Download size={18} />
                  </button>
                  <button className="size-10 rounded-full border border-white/30 text-white flex items-center justify-center">
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button className="text-studio-gold hover:text-white transition-colors text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 mx-auto">
              Ver Galeria Completa
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="border-t border-studio-gold/10 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-xl font-light text-slate-100 uppercase tracking-widest font-display">E agora?</h4>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 border border-studio-gold/10 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="text-studio-gold"><Brush size={24} /></div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Solicitar Retoque Extra</h5>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Gostaria de ajustes específicos? Nossa equipe está à disposição.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border border-studio-gold/10 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="text-studio-gold"><Sparkles size={24} /></div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Imprimir Álbum Físico</h5>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Transforme suas memórias digitais em uma obra de arte física.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xl font-light text-slate-100 uppercase tracking-widest font-display">Compartilhe sua Experiência</h4>
            <p className="text-sm text-slate-400">Marque o @photostudio1308 em suas redes sociais e ganhe 10% de desconto em seu próximo ensaio exclusivo.</p>
            <div className="flex gap-4">
              <Link className="size-10 border border-white/10 flex items-center justify-center hover:border-studio-gold hover:text-studio-gold transition-all" href="#">
                <Instagram size={20} />
              </Link>
              <Link className="size-10 border border-white/10 flex items-center justify-center hover:border-studio-gold hover:text-studio-gold transition-all" href="#">
                <Twitter size={20} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-studio-gold/10 py-12 px-6 md:px-20 text-center">
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em]">© 2023 VIRTUAL STUDIO. EXCELLENCE IN VISUAL STORYTELLING.</p>
      </footer>
    </div>
  );
}
