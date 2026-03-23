import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Camera, 
  ShoppingBag, 
  Users, 
  Palette, 
  CreditCard, 
  Settings, 
  BarChart3,
  MessageSquare,
  MoreVertical,
  User,
  LogOut,
  Bell,
  CheckCheck
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

const navItems = [
  { label: 'Management', type: 'header' },
  { label: 'Pedidos', icon: ShoppingBag, href: '/admin/orders' },
  { label: 'Usuários', icon: Users, href: '/admin/users' },
  { label: 'Mensagens', icon: MessageSquare, href: '/admin/messages' },
  { label: 'Estilos', icon: Palette, href: '/admin/styles' },
  { label: 'Financeiro', icon: CreditCard, href: '/admin/finance' },
  { label: 'System', type: 'header' },
  { label: 'Configurações', icon: Settings, href: '/admin/settings' },
  { label: 'Relatórios', icon: BarChart3, href: '/admin/reports' },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // =============== NOTIFICATIONS LOGIC =================
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || null);
      }
    };
    getAdmin();
  }, []);

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

    const channel = supabase
      .channel('notificacoes_admin_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes_admin' },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setHasNew(true);
          playBeep(); 
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.warn('Áudio bloqueado pelo navegador. Dê um clique na tela primeiro.', err));
    }
  };

  const toggleDropdown = () => setShowNotifications(!showNotifications);

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
  // ======================================================

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/signup');
    } catch (error: any) {
      console.error('Erro ao sair:', error.message);
    }
  };

  const adminName = adminEmail ? adminEmail.split('@')[0] : 'Admin';

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-studio-black flex flex-col h-screen sticky top-0 z-[100] relative">
      <audio ref={audioRef} src="/alerta.mp3" preload="auto" className="hidden" />

      <div className="p-8 flex flex-col items-center text-center border-b border-white/5 mb-4">
        <div className="flex flex-col items-center">
          <div className="relative w-[150px] h-[150px] -mt-[40px] -mb-[60px] flex items-center justify-center pointer-events-none">
            <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
          </div>
          <div className="h-[1px] w-2/3 bg-gradient-to-r from-transparent via-studio-gold/50 to-transparent mt-2 mb-1"></div>
          <p className="text-[10px] text-studio-gold font-bold uppercase tracking-[0.3em] opacity-80">
            Painel Administrativo
          </p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'header') {
            return (
              <div key={i} className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] px-3 mb-3 mt-6 first:mt-2 font-display">
                {item.label}
              </div>
            );
          }
          
          const Icon = item.icon!;
          const isActive = pathname === item.href;

          return (
            <Link 
              key={i}
              href={item.href!} 
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all group relative ${
                isActive 
                  ? 'bg-studio-gold/5 text-studio-gold' 
                  : 'text-gray-500 hover:text-studio-gold hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-studio-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
              )}
              <Icon size={18} className={isActive ? 'text-studio-gold' : 'group-hover:text-studio-gold transition-colors'} />
              <span className="text-[11px] font-bold uppercase tracking-widest font-display">{item.label}</span>
              {item.label === 'Mensagens' && (
                <span className="ml-auto size-1.5 bg-studio-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]"></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-1">Alertas</span>
          <button 
            onClick={toggleDropdown}
            className={`p-2 rounded-none bg-white/5 border border-white/10 relative transition-colors ${hasNew ? 'text-studio-gold border-studio-gold/30 hover:bg-studio-gold/10' : 'text-slate-500 hover:bg-white/10 hover:text-white'}`}
          >
            <Bell size={16} />
            {hasNew && <span className="absolute -top-1 -right-1 size-2.5 border border-studio-black bg-studio-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,1)] animate-pulse"></span>}
          </button>
        </div>

        {/* NOTIFICATIONS DROPDOWN */}
        {showNotifications && (
          <div className="absolute bottom-full left-0 mb-4 ml-4 w-[320px] bg-[#121212] border border-white/10 shadow-2xl z-[150] animate-in slide-in-from-bottom-2 fade-in">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-studio-gold">Alertas de PIX</span>
              <button onClick={clearNotifications} className="text-[9px] flex items-center gap-1 text-gray-400 hover:text-white uppercase tracking-widest transition-colors"><CheckCheck size={12} /> Limpar</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">Caixa de entrada limpa.</div>
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
                    <p className="text-[10px] font-medium text-emerald-400 mb-1">
                      Cliente: {notif.user_email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-light">{notif.mensagem}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 bg-studio-black/80 border-t border-white/5 text-center">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest">Estes registros serão salvos em Financeiro futuramente.</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 mt-1 bg-white/[0.02] border border-white/5 rounded-none hover:border-studio-gold/30 transition-all group">
          <div className="size-8 rounded-full border border-studio-gold/30 flex items-center justify-center bg-studio-gold/10 group-hover:bg-studio-gold/20 transition-colors">
            <User size={16} className="text-studio-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold truncate text-white uppercase tracking-widest font-display">{adminName}</p>
            <p className="text-[8px] text-slate-500 truncate uppercase tracking-tighter opacity-80">Admin Logado</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
            title="Sair do Painel"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
