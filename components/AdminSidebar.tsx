import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || null);
      }
    };
    getAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/signup'); // Ou /login se existir, mas signup parece ser a base de auth aqui
    } catch (error: any) {
      console.error('Erro ao sair:', error.message);
    }
  };

  const adminName = adminEmail ? adminEmail.split('@')[0] : 'Admin';

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-studio-black flex flex-col h-screen sticky top-0">
      <div className="p-8 flex flex-col items-center text-center border-b border-white/5 mb-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold font-display uppercase tracking-[0.2em] text-white leading-none mb-1">
            VIRTUAL <span className="text-studio-gold">STUDIO</span>
          </h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-studio-gold/50 to-transparent my-2"></div>
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

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-none hover:border-studio-gold/30 transition-all group">
          <div className="size-10 rounded-full border border-studio-gold/30 flex items-center justify-center bg-studio-gold/10 group-hover:bg-studio-gold/20 transition-colors">
            <User size={20} className="text-studio-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white uppercase tracking-widest font-display">{adminName}</p>
            <p className="text-[9px] text-slate-500 truncate uppercase tracking-tighter opacity-60">Admin Logado</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
            title="Sair do Painel"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
