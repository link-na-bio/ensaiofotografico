'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, CheckCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminHeader() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Referência para o áudio pré-carregado
  const audioRef = useRef<HTMLAudioElement>(null);

  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Zera o áudio para tocar desde o início
      // O catch previne que o erro do navegador "quebre" a tela caso esteja bloqueado
      audioRef.current.play().catch((err) => console.warn('Áudio bloqueado pelo navegador. Dê um clique na tela primeiro.', err));
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notificacoes_admin')
        .select('*')
        .eq('lida', false)
        .order('criado_em', { ascending: false });

      if (data) {
        setNotifications(data);
        if (data.length > 0) setHasNew(true);
      }
    };

    fetchNotifications();

    // ESCUTADOR REAL-TIME DO PIX
    const channel = supabase
      .channel('notificacoes_admin_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes_admin' },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setHasNew(true);
          playBeep(); // 🔔 Toca o alerta.mp3 pré-carregado!
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleDropdown = () => {
    setShowNotifications(!showNotifications);
  };

  const clearNotifications = async () => {
    setHasNew(false);
    setNotifications([]);
    setShowNotifications(false);
    await supabase.from('notificacoes_admin').update({ lida: true }).eq('lida', false);
  };

  const handleNotificationClick = (orderId: string) => {
    setShowNotifications(false);
    router.push('/admin/orders');
  };

  return (
    <header className="h-20 bg-studio-black border-b border-white/5 flex items-center justify-between px-4 pr-16 md:px-8 bg-gradient-to-b from-white/[0.02] to-transparent sticky top-0 z-50">

      {/* 🎵 ÁUDIO PRÉ-CARREGADO ESCONDIDO 🎵 */}
      <audio ref={audioRef} src="/alerta.mp3" preload="auto" className="hidden" />

      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="relative w-[120px] h-[120px] -mt-[40px] -mb-[40px] flex items-center justify-center pointer-events-none">
          <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
        </div>
        <div className="hidden md:flex flex-col">
          <h1 className="text-xl font-bold font-display uppercase tracking-[0.2em] text-white">VIRTUAL <span className="text-studio-gold">STUDIO</span></h1>
          <p className="text-[9px] text-studio-gold font-bold uppercase tracking-[0.2em] opacity-60">Painel de Controle Administrativo</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-none text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-studio-gold transition-all outline-none text-white placeholder:text-gray-600" placeholder="Pesquisar pedidos..." type="text" />
        </div>

        <div className="hidden md:block h-8 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <button onClick={toggleDropdown} className={`size-9 flex items-center justify-center rounded-none bg-white/5 border border-white/10 text-slate-400 relative hover:text-studio-gold transition-colors ${hasNew ? 'text-studio-gold border-studio-gold/30' : ''}`}>
              <Bell size={18} />
              {hasNew && <span className="absolute top-2 right-2 size-2 bg-studio-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,1)] animate-pulse"></span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[350px] bg-[#121212] border border-white/10 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-studio-gold">Alertas de PIX</span>
                  <button onClick={clearNotifications} className="text-[9px] flex items-center gap-1 text-gray-400 hover:text-white uppercase tracking-widest transition-colors"><CheckCheck size={12} /> Limpar Avisos</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-600 italic">Caixa de entrada limpa.</div>
                  ) : (
                    notifications.map((notif, i) => (
                      <div
                        key={i}
                        onClick={() => handleNotificationClick(notif.order_id)}
                        className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[10px] font-bold text-white uppercase group-hover:text-studio-gold transition-colors">
                            Pacote {notif.pacote}
                          </p>
                          <p className="text-[9px] text-gray-500 tracking-tighter">
                            {new Date(notif.criado_em).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                        <p className="text-[11px] font-medium text-emerald-400 mb-1">
                          Cliente: {notif.user_email?.split('@')[0]}
                        </p>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{notif.mensagem}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 bg-studio-black/80 border-t border-white/5 text-center">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest italic">Estes registros serão salvos em Financeiro futuramente.</span>
                </div>
              </div>
            )}
          </div>

          <button className="hidden md:flex h-10 px-8 bg-studio-gold text-studio-black rounded-none text-[10px] font-bold font-display uppercase tracking-widest items-center gap-2 hover:bg-studio-gold-light transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)]"><Plus size={14} />Novo Pedido</button>
        </div>
      </div>
    </header>
  );
}