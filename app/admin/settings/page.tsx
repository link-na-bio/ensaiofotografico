'use client';

import { useState } from 'react';
import { 
  DollarSign, 
  Tag, 
  Power, 
  Shield, 
  Settings as SettingsIcon,
  Save,
  Plus
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

export default function AdminSettings() {
  // Preços
  const [prices, setPrices] = useState({ essencial: 59, premium: 99, elite: 149 });
  
  // Cupons
  const [couponName, setCouponName] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([
    { code: 'VIP20', discount: 20 },
    { code: 'BETA50', discount: 50 },
    { code: 'NOIVA15', discount: 15 }
  ]);
  
  // Manutenção
  const [isMaintenance, setIsMaintenance] = useState(false);
  
  // Segurança
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleGenerateCoupon = () => {
    if (!couponName || !couponDiscount) {
      alert("Preencha o nome e o desconto do cupom.");
      return;
    }
    setActiveCoupons([{ code: couponName.toUpperCase(), discount: Number(couponDiscount) }, ...activeCoupons]);
    setCouponName('');
    setCouponDiscount('');
    alert("Cupom gerado com sucesso (mockup).");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#121212]">
        <AdminHeader />
        
        <div className="p-8 space-y-8 mx-auto w-full max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display uppercase tracking-widest font-bold mb-2 flex items-center gap-3">
                <SettingsIcon className="text-studio-gold text-opacity-80 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" size={32} />
                Configurações da Plataforma
              </h1>
              <p className="text-slate-500 text-xs tracking-widest uppercase">Controle de sistema, pacotes e segurança administrativa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* GESTÃO DE PREÇOS */}
            <div className="bg-studio-black border border-white/10 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-studio-gold/30 transition-all flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign size={80} className="text-studio-gold" />
              </div>
              <h3 className="flex items-center gap-3 font-display uppercase tracking-widest text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                <DollarSign className="text-studio-gold" size={20} /> Gestão de Preços (Pacotes)
              </h3>
              
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-1/2 flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Plano Essencial</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input type="number" value={prices.essencial} onChange={(e) => setPrices({...prices, essencial: Number(e.target.value)})} className="w-full bg-[#121212] border border-white/10 text-white px-4 py-3 pl-12 focus:outline-none focus:border-studio-gold transition-colors font-mono font-bold text-lg" />
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Plano Premium</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input type="number" value={prices.premium} onChange={(e) => setPrices({...prices, premium: Number(e.target.value)})} className="w-full bg-[#121212] border border-white/10 text-white px-4 py-3 pl-12 focus:outline-none focus:border-studio-gold transition-colors font-mono font-bold text-lg text-studio-gold" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Plano Elite</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                    <input type="number" value={prices.elite} onChange={(e) => setPrices({...prices, elite: Number(e.target.value)})} className="w-full bg-[#121212] border border-white/10 text-white px-4 py-3 pl-12 focus:outline-none focus:border-studio-gold transition-colors font-mono font-bold text-lg text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <button onClick={() => alert("Preços salvos (Mockup)")} className="mt-8 w-full py-4 bg-studio-gold/10 border border-studio-gold/30 text-studio-gold hover:bg-studio-gold hover:text-black font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                <Save size={16} /> Atualizar Tabela de Preços
              </button>
            </div>

            {/* CONTROLE DO SISTEMA (MODO MANUTENÇÃO) */}
            <div className="bg-studio-black border border-white/10 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-studio-gold/30 transition-all flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Power size={80} className="text-studio-gold" />
              </div>
              <h3 className="flex items-center gap-3 font-display uppercase tracking-widest text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                <Power className="text-studio-gold" size={20} /> Controle do Sistema
              </h3>
              
              <div className="flex flex-col items-center justify-center flex-1 py-4">
                <button 
                  onClick={() => setIsMaintenance(!isMaintenance)}
                  className={`relative w-28 h-12 rounded-full p-1 transition-all duration-300 ease-in-out cursor-pointer ${isMaintenance ? 'bg-amber-500/20 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-white/5 border border-white/10 hover:border-white/30'}`}
                >
                  <div className={`absolute left-1 top-1 size-10 flex items-center justify-center rounded-full shadow-lg transform transition-all duration-300 ease-in-out ${isMaintenance ? 'translate-x-16 bg-amber-500' : 'translate-x-0 bg-white/20'}`}>
                    <Power size={18} className={isMaintenance ? "text-studio-black" : "text-white/50"} />
                  </div>
                </button>
                
                <h4 className={`mt-8 font-display font-bold uppercase tracking-widest text-lg transition-colors ${isMaintenance ? 'text-amber-500' : 'text-slate-400'}`}>
                  {isMaintenance ? 'Modo de Manutenção Ativado' : 'Sistema Operacional Online'}
                </h4>
                
                <div className="mt-4 p-4 bg-[#121212] border border-white/5 text-center max-w-sm">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium leading-relaxed">
                    {isMaintenance 
                      ? "Atenção: A criação de novos cadastros e as compras na plataforma estão suspensos temporariamente." 
                      : "A plataforma está online. Os clientes podem efetuar pagamentos e gerar novos ensaios sem restrições."}
                  </p>
                </div>
              </div>
            </div>

            {/* CUPONS DE DESCONTO */}
            <div className="bg-studio-black border border-white/10 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-studio-gold/30 transition-all flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Tag size={80} className="text-studio-gold" />
              </div>
              <h3 className="flex items-center gap-3 font-display uppercase tracking-widest text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                <Tag className="text-studio-gold" size={20} /> Cupons de Desconto
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Nome do Cupom</label>
                  <input type="text" placeholder="Ex: VIRTUAL20" value={couponName} onChange={(e) => setCouponName(e.target.value.toUpperCase())} className="bg-[#121212] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-studio-gold transition-colors uppercase font-mono font-bold" />
                </div>
                <div className="md:w-32 flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Desconto (%)</label>
                  <div className="relative">
                    <input type="number" placeholder="20" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} className="w-full bg-[#121212] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-studio-gold transition-colors font-mono font-bold" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                  </div>
                </div>
              </div>
              
              <button onClick={handleGenerateCoupon} className="w-full py-4 border border-white/10 bg-white/5 text-slate-300 hover:border-studio-gold hover:text-studio-gold hover:bg-studio-gold/5 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 mb-8">
                <Plus size={16} /> Gerar Novo Cupom
              </button>

              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Lista de Cupons Ativos no BD</p>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeCoupons.map((coupon, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#121212] border border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Tag size={14} className="text-slate-500" />
                        <span className="text-studio-gold font-bold font-mono tracking-widest">{coupon.code}</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-400/10 px-2 py-1 rounded">- {coupon.discount}% off</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SEGURANÇA DO ADMIN */}
            <div className="bg-studio-black border border-white/10 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-studio-gold/30 transition-all flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield size={80} className="text-studio-gold" />
              </div>
              <h3 className="flex items-center gap-3 font-display uppercase tracking-widest text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                <Shield className="text-studio-gold" size={20} /> Segurança do Admin
              </h3>
              
              <div className="flex-1 space-y-6">
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 text-rose-500 text-xs text-center uppercase tracking-widest font-bold">
                  Área Sensível: Altere credenciais com cautela
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Nova Senha de Acesso</label>
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#121212] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors font-mono tracking-widest" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Confirmar Nova Senha</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-[#121212] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors font-mono tracking-widest" />
                </div>
              </div>
              
              <button onClick={() => alert("Senha atualizada (Mockup)")} className="mt-8 w-full py-4 border border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                <Shield size={16} /> Atualizar Credenciais do Sistema
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
