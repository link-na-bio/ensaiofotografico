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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-[#121212] border border-white/5 overflow-hidden transition-all duration-500 hover:border-studio-gold/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo Container 3:4 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-studio-black">
        {/* After Image (IA Result) */}
        <Image
          src={afterImg}
          alt={`Resultado IA: ${styleName}`}
          fill
          className={`object-cover transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
        
        {/* Before Image (Base Photo) */}
        <Image
          src={beforeImg}
          alt="Foto Base"
          fill
          className={`object-cover transition-opacity duration-1000 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />

        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-studio-black to-transparent z-10"></div>

        {/* Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-studio-gold text-studio-black text-[9px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
            <span className="text-xs">✅</span> Curadora Convidada
          </span>
        </div>

        {/* Comparison Label */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-1">
           <span className="bg-studio-gold/10 backdrop-blur-md text-studio-gold text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 border border-studio-gold/20 rounded-md">
             {isHovered ? 'Resultado Profissional' : 'Foto Original'}
           </span>
           <p className="text-white/40 text-[7px] uppercase tracking-widest mr-1">Passe o mouse para comparar</p>
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
