'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Ban,
  TrendingUp,
  List,
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
  Lock,
  Unlock
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

import { supabase } from '@/lib/supabaseClient';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Métricas
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Estado para usuários com pedidos pausados (agora tracking por e-mail, via Supabase)
  const [pausedUsers, setPausedUsers] = useState<Set<string>>(new Set());

  const fetchRestrictedUsers = async () => {
    try {
      const { data, error } = await supabase.from('usuarios_restritos').select('email');
      if (error && error.code !== '42P01') throw error; // Ignora se a tabela não existir ainda
      if (data) {
        setPausedUsers(new Set(data.map(d => d.email)));
      }
    } catch (err) {
      console.error("Erro ao buscar usuários restritos:", err);
    }
  };

  const togglePauseUser = async (user: any) => {
    if (user.access === 'Admin') {
      alert("Acesso Negado: Administradores e CEOs não podem ter pedidos bloqueados.");
      return;
    }
    
    try {
      if (pausedUsers.has(user.email)) {
        const { error } = await supabase.from('usuarios_restritos').delete().eq('email', user.email);
        if (error) throw error;
        
        setPausedUsers(prev => {
          const next = new Set(prev);
          next.delete(user.email);
          return next;
        });
        alert(`SUCESSO: O cliente ${user.email} agora pode fazer novos pedidos.`);
      } else {
        const { error } = await supabase.from('usuarios_restritos').insert({ email: user.email });
        if (error) throw error;
        
        setPausedUsers(prev => {
          const next = new Set(prev);
          next.add(user.email);
          return next;
        });
        alert(`SUCESSO: Os pedidos para ${user.email} foram interrompidos efetivamente.`);
      }
    } catch (error: any) {
      alert("Erro ao alterar bloqueio (verifique se a tabela 'usuarios_restritos' foi criada no Supabase): " + error.message);
    }
  };

  const fetchUsersAndOrders = async () => {
    setIsLoading(true);
    try {
      // 1. Buscar utilizadores (como o Auth não permite listagem direta sem admin key server-side, 
      // vamos extrair os utilizadores únicos a partir da tabela de pedidos)
      // Idealmente, num futuro, pode criar uma tabela 'profiles' sincronizada com o Auth.
      const { data: pedidosData, error } = await supabase
        .from('pedidos')
        .select('user_id, user_email, criado_em, status');

      if (error) throw error;

      if (pedidosData) {
        // Agrupar pedidos por utilizador
        const userMap = new Map();

        pedidosData.forEach((pedido: any) => {
          if (!userMap.has(pedido.user_id)) {
            userMap.set(pedido.user_id, {
              id: pedido.user_id,
              email: pedido.user_email,
              name: pedido.user_email.split('@')[0], // Nome provisório
              access: pedido.user_email === 'brunomeueditor@gmail.com' ? 'Admin' : 'Client',
              orders: 1,
              joined: pedido.criado_em, // Pega a data do primeiro pedido
              avatar: null
            });
          } else {
            const user = userMap.get(pedido.user_id);
            user.orders += 1;
            // Atualiza a data de entrada se este pedido for mais antigo
            if (new Date(pedido.criado_em) < new Date(user.joined)) {
              user.joined = pedido.criado_em;
            }
          }
        });

        // Garantir que o Admin aparece, mesmo sem pedidos
        if (!userMap.has('admin-bruno')) {
          userMap.set('admin-bruno', {
            id: 'admin-bruno',
            email: 'brunomeueditor@gmail.com',
            name: 'Bruno (CEO)',
            access: 'Admin',
            orders: 0,
            joined: new Date().toISOString(),
            avatar: null
          });
        }

        const uniqueUsers = Array.from(userMap.values());

        // Ordenar por mais recentes
        uniqueUsers.sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());

        setUsers(uniqueUsers);
        setFilteredUsers(uniqueUsers);

        // Calcular Métricas
        setTotalUsers(uniqueUsers.length);
        setTotalOrders(pedidosData.length);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentes = uniqueUsers.filter(u => new Date(u.joined) >= thirtyDaysAgo).length;
        setNewUsersThisMonth(recentes);
      }
    } catch (err: any) {
      console.error('Erro ao buscar utilizadores:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndOrders();
    fetchRestrictedUsers();
  }, []);

  // Pesquisa
  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery) ||
        u.id.toLowerCase().includes(lowerQuery)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#121212]">



        {/* Page Content */}
        <div className="p-8 space-y-8 mx-auto w-full">

          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-display uppercase tracking-widest font-bold mb-2">Gestão de Clientes</h1>
              <p className="text-slate-500 text-xs tracking-widest uppercase">Diretório e controlo de acesso à plataforma</p>
            </div>

            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-studio-gold transition-colors" size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-none py-3 pl-12 pr-4 focus:outline-none focus:border-studio-gold text-xs font-bold tracking-widest uppercase transition-all text-white placeholder:text-slate-600"
                placeholder="Pesquisar cliente..."
                type="text"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-studio-black border border-white/10 p-6 rounded-none flex flex-col gap-1 shadow-xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total de Clientes Ativos</p>
              <div className="flex items-end gap-3 mt-1">
                <h3 className="text-4xl font-bold font-display text-white">{isLoading ? '-' : totalUsers}</h3>
                <span className="flex items-center text-emerald-500 text-[10px] font-bold pb-2 uppercase tracking-widest">
                  <TrendingUp size={14} className="mr-1" /> Crescimento
                </span>
              </div>
            </div>

            <div className="bg-studio-black border border-white/10 p-6 rounded-none flex flex-col gap-1 shadow-xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Novos Clientes (30 dias)</p>
              <div className="flex items-end gap-3 mt-1">
                <h3 className="text-4xl font-bold font-display text-studio-gold">{isLoading ? '-' : newUsersThisMonth}</h3>
                <span className="flex items-center text-studio-gold text-[10px] font-bold pb-2 uppercase tracking-widest">
                  Neste mês
                </span>
              </div>
            </div>

            <div className="bg-studio-black border border-white/10 p-6 rounded-none flex flex-col gap-1 shadow-xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Volume de Ensaios</p>
              <div className="flex items-end gap-3 mt-1">
                <h3 className="text-4xl font-bold font-display text-white">{isLoading ? '-' : totalOrders}</h3>
                <span className="flex items-center text-slate-400 text-[10px] font-bold pb-2 uppercase tracking-widest">
                  Pedidos Gerados
                </span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-studio-black border border-white/10 rounded-none shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-bold flex items-center gap-2 font-display uppercase tracking-widest text-sm text-white">
                <List size={18} className="text-studio-gold" />
                Diretório
              </h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-studio-gold hover:border-studio-gold transition-colors uppercase tracking-widest">
                  <Filter size={14} /> Filtro
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-studio-gold hover:border-studio-gold transition-colors uppercase tracking-widest">
                  <Download size={14} /> Exportar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-studio-gold" size={40} /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <User size={48} className="mb-4 opacity-50" />
                  <p className="text-xs uppercase tracking-widest font-bold">Nenhum cliente encontrado.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Cliente</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Acesso</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Pedidos</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Desde</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user, idx) => {
                      const isPaused = pausedUsers.has(user.email);
                      
                      return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full border border-studio-gold/20 bg-studio-gold/5 flex items-center justify-center flex-shrink-0 text-studio-gold">
                              {user.avatar ? (
                                <Image src={user.avatar} alt="avatar" fill className="object-cover rounded-full" />
                              ) : (
                                <span className="font-bold text-xs uppercase">{user.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white uppercase tracking-wider">{user.name}</p>
                              <p className="text-[10px] text-slate-500 lowercase tracking-wider">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            user.access === 'Admin' ? 'bg-studio-gold/10 text-studio-gold border-studio-gold/30' : 
                            isPaused ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {user.access === 'Admin' ? 'CEO / Admin' : isPaused ? 'Bloqueado (Pedidos)' : 'Cliente VIP'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded">{user.orders}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500 font-medium tabular-nums">{formatDate(user.joined)}</span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {isPaused ? (
                              <button onClick={() => togglePauseUser(user)} className="p-2 border border-white/10 transition-all text-amber-500 hover:border-amber-400 hover:bg-amber-500/10" title="Desbloquear Pedidos">
                                <Unlock size={16} />
                              </button>
                            ) : (
                              <button onClick={() => togglePauseUser(user)} className="p-2 border border-white/10 transition-all text-slate-400 hover:border-amber-500 hover:text-amber-500" title="Bloquear Novos Pedidos">
                                <Lock size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                A Mostrar <span className="text-studio-gold">1-{Math.min(10, filteredUsers.length)}</span> de <span className="text-studio-gold">{filteredUsers.length}</span> clientes
              </p>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center border border-white/10 text-slate-500 hover:text-studio-gold transition-all cursor-not-allowed opacity-50">
                  <ChevronLeft size={16} />
                </button>
                <button className="size-8 flex items-center justify-center border border-studio-gold bg-studio-gold/10 text-studio-gold text-xs font-bold">1</button>
                <button className="size-8 flex items-center justify-center border border-white/10 text-slate-400 hover:text-studio-gold transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}