'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Plus, CheckCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Função para tocar um "Bipe" nativo do navegador (Sem precisar de MP3)
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Frequência do bipe
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // Volume

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15); // Duração curta
    } catch (e) {
      console.log('Áudio não suportado ou bloqueado no momento.');
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
          playBeep(); // 🔔 Toca o bipe instantaneamente!
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleDropdown = () => {
    setShowNotifications(!showNotifications);
  };

  // Só limpa as notificações se o admin clicar nesse botão
  const clearNotifications = async () => {
    setHasNew(false);
    setNotifications([]);
    setShowNotifications(false);
    await supabase.from('notificacoes_admin').update({ lida: true }).eq('lida', false);
  };

  const handleNotificationClick = (orderId: string) => {
    setShowNotifications(false);
    router.push('/admin/orders'); // Opcional: futuramente pode ser /admin/financeiro
  };

  return (
    <header className="h-20 bg-studio-black border-b border-white/5 flex items-center justify-between px-8 bg-gradient-to-b from-white/[0.02] to-transparent sticky top-0 z-50">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold font-display uppercase tracking-[0.2em] text-white">VIRTUAL <span className="text-studio-gold">STUDIO</span></h1>
        <p className="text-[9px] text-studio-gold font-bold uppercase tracking-[0.2em] opacity-60">Painel de Controle Administrativo</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-none text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-studio-gold transition-all outline-none text-white placeholder:text-gray-600" placeholder="Pesquisar pedidos..." type="text" />
        </div>

        <div className="h-8 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-4">
          {/* Sino */}
          <div className="relative">
            <button onClick={toggleDropdown} className={`size-9 flex items-center justify-center rounded-none bg-white/5 border border-white/10 text-slate-400 relative hover:text-studio-gold transition-colors ${hasNew ? 'text-studio-gold border-studio-gold/30' : ''}`}>
              <Bell size={18} />
              {hasNew && <span className="absolute top-2 right-2 size-2 bg-studio-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,1)] animate-pulse"></span>}
            </button>

            {/* Dropdown Persistente */}
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
                        {/* Nome do Cliente */}
                        <p className="text-[11px] font-medium text-emerald-400 mb-1">
                          Cliente: {notif.user_email?.split('@')[0]}
                        </p>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{notif.mensagem}</p>
                      </div>
                    ))
                  )}
                </div>
                {/* Rodapé do Dropdown: O seu futuro atalho para o Financeiro */}
                <div className="p-3 bg-studio-black/80 border-t border-white/5 text-center">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest italic">Estes registros serão salvos em Financeiro futuramente.</span>
                </div>
              </div>
            )}
          </div>

          <button className="h-10 px-8 bg-studio-gold text-studio-black rounded-none text-[10px] font-bold font-display uppercase tracking-widest flex items-center gap-2 hover:bg-studio-gold-light transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)]"><Plus size={14} />Novo Pedido</button>
        </div>
      </div>
    </header>
  );
}