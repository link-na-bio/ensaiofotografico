'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Instagram, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CuratorCardProps {
  name: string;
  instaHandle: string;
  styleName: string;
  beforeImg: string;
  afterImg: string;
  instaLink: string;
}

export default function CuratorCard({
  name,
  instaHandle,
  styleName,
  beforeImg,
  afterImg,
  instaLink
}: CuratorCardProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div 
      className="group relative bg-[#121212] border border-white/5 overflow-hidden transition-all duration-500 hover:border-studio-gold/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] rounded-xl"
    >
      {/* Photo Container 3:4 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-studio-black select-none">
        
        {/* Before Image (Base Photo) - BOTTOM LAYER */}
        <Image
          src={beforeImg}
          alt="Foto Base"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />

        {/* After Image (IA Result) - TOP LAYER WITH CLIP */}
        <div 
          className="absolute inset-0 z-10"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <Image
            src={afterImg}
            alt={`Resultado IA: ${styleName}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>

        {/* Custom Slider Handle/Line */}
        <div 
          className="absolute inset-y-0 z-20 w-0.5 bg-studio-gold/50 shadow-[0_0_15px_rgba(195,157,93,0.5)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-studio-gold rounded-full flex items-center justify-center shadow-2xl border-4 border-studio-black">
            <div className="flex gap-1">
              <div className="w-0.5 h-3 bg-studio-black rounded-full"></div>
              <div className="w-0.5 h-3 bg-studio-black rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Transparent Range Input (The real controller) */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="absolute inset-0 z-30 opacity-0 cursor-ew-resize w-full h-full"
        />

        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-studio-black to-transparent z-10 pointer-events-none"></div>

        {/* Badge */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <span className="bg-studio-gold text-studio-black text-[9px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
            <span className="text-xs">✅</span> Curadora Convidada
          </span>
        </div>

        {/* Comparison Labels */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition > 10 ? 1 : 0 }}>
          <span className="bg-black/40 backdrop-blur-md text-white/70 text-[7px] font-bold uppercase tracking-[0.2em] px-2 py-1 border border-white/10 rounded">
            Antes
          </span>
        </div>
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition < 90 ? 1 : 0 }}>
          <span className="bg-studio-gold/20 backdrop-blur-md text-studio-gold text-[7px] font-bold uppercase tracking-[0.2em] px-2 py-1 border border-studio-gold/20 rounded">
            Depois
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-10 flex flex-col items-center text-center">
        <h3 className="text-2xl font-display font-bold uppercase tracking-[0.1em] text-white mb-3">
          {name}
        </h3>
        
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-light">
            Curadoria Especial para o Estilo:
          </p>
          <p className="text-studio-gold font-serif text-3xl italic leading-tight">
            {styleName}
          </p>
        </div>

        <div className="flex flex-col items-center gap-5 w-full">
          <Link 
            href={instaLink}
            target="_blank"
            className="flex items-center gap-2 text-slate-500 hover:text-studio-gold text-[10px] uppercase tracking-widest font-bold transition-colors group/insta"
          >
            <Instagram size={14} className="group-hover/insta:scale-110 transition-transform" /> Ver no Instagram
          </Link>

          <Link 
            href="/signup"
            className="w-full bg-studio-gold text-studio-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-studio-gold-light transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:-translate-y-1 rounded-lg"
          >
            QUERO ESTE ESTILO <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
