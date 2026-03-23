'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Download, 
  Filter,
  Search,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  DollarSign
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

import { supabase } from '@/lib/supabaseClient';

const PLAN_PRICES: Record<string, number> = {
  'Essencial': 89.90,
  'Premium': 149.90,
  'Elite': 247.90
};

export default function AdminFinance() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, user_email, pacote, status, criado_em')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      if (data) {
        // Enforce a valid price for all items, assuming 0 if package name doesn't match
        const ordersWithValues = data.map(order => {
          // Extrair nome limpo do pacote caso venha com sufixos ou typos
          let pkgName = order.pacote;
          if (pkgName.includes('Essencial')) pkgName = 'Essencial';
          if (pkgName.includes('Premium')) pkgName = 'Premium';
          if (pkgName.includes('Elite')) pkgName = 'Elite';

          const value = PLAN_PRICES[pkgName] || 0;
          return {
            ...order,
            valor: value
          };
        });

        setOrders(ordersWithValues);
        setFilteredOrders(ordersWithValues);

        // Calc metrics
        let total = 0;
        let monthTotal = 0;
        const now = new Date();
        
        ordersWithValues.forEach(order => {
          total += order.valor;
          const orderDate = new Date(order.criado_em);
          if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
            monthTotal += order.valor;
          }
        });

        setTotalRevenue(total);
        setThisMonthRevenue(monthTotal);
        
        if (ordersWithValues.length > 0) {
          setAverageTicket(total / ordersWithValues.length);
        }
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados financeiros:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = orders.filter(o => 
        (o.user_email && o.user_email.toLowerCase().includes(lowerQuery)) ||
        o.id.toLowerCase().includes(lowerQuery) ||
        o.pacote.toLowerCase().includes(lowerQuery)
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
              <h1 className="text-3xl font-display uppercase tracking-widest font-bold mb-2">Financeiro</h1>
              <p className="text-slate-500 text-xs tracking-widest uppercase">Gestão de receita e transações financeiras</p>
            </div>

            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-studio-gold transition-colors" size={18} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-none py-3 pl-12 pr-4 focus:outline-none focus:border-studio-gold text-xs font-bold tracking-widest uppercase transition-all text-white placeholder:text-slate-600" 
                placeholder="Pesquisar transação..." 
                type="text"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-studio-black border border-white/10 p-6 rounded-none flex flex-col gap-1 shadow-xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Receita Total Bruta</p>
              <div className="flex items-end gap-3 mt-1">
                <h3 className="text-4xl font-bold font-display text-white">{isLoading ? '-' : formatCurrency(totalRevenue)}</h3>
                <span className="flex items-center text-emerald-500 text-[10px] font-bold pb-2 uppercase tracking-widest">
                  <TrendingUp size={14} className="mr-1" /> All-Time
                </span>
              </div>
            </div>

            <div className="bg-studio-black border border-white/10 p-6 rounded-none flex flex-col gap-1 shadow-xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Receita do Mês Atual</p>
              <div className="flex items-end gap-3 mt-1">
                <h3 className="text-4xl font-bold font-display text-studio-gold">{isLoading ? '-' : formatCurrency(thisMonthRevenue)}</h3>
                <span className="flex items-center text-studio-gold text-[10px] font-bold pb-2 uppercase tracking-widest">
                  Mês Corrente
                </span>
              </div>
            </div>

            <div className="bg-studio-black border border-white/10 p-6 rounded-none flex flex-col gap-1 shadow-xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Ticket Médio (Aprox)</p>
              <div className="flex items-end gap-3 mt-1">
                <h3 className="text-4xl font-bold font-display text-white">{isLoading ? '-' : formatCurrency(averageTicket)}</h3>
                <span className="flex items-center text-slate-400 text-[10px] font-bold pb-2 uppercase tracking-widest">
                  Por Pedido
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-studio-black border border-white/10 rounded-none shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-bold flex items-center gap-2 font-display uppercase tracking-widest text-sm text-white">
                <CreditCard size={18} className="text-studio-gold" />
                Histórico de Transações
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
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <DollarSign size={48} className="mb-4 opacity-50" />
                  <p className="text-xs uppercase tracking-widest font-bold">Nenhuma transação encontrada.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">TID / Identificador</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Pagador</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Item Faturado</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Status do Pedido</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Data</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((order, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-400 font-mono tracking-wider">{order.id.slice(0, 8).toUpperCase()}...</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white tracking-widest">{order.user_email ? order.user_email.split('@')[0] : 'Desconhecido'}</span>
                            <span className="text-[9px] text-slate-500 lowercase tracking-wider">{order.user_email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-studio-gold bg-studio-gold/10 px-2 py-1 border border-studio-gold/20 rounded">
                            {order.pacote}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                            order.status === 'Pagamento em Análise' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 
                            order.status === 'Ensaio Concluído' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                            'text-slate-300 bg-white/10 border-white/20'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-slate-400 tabular-nums uppercase tracking-wider">{formatDate(order.criado_em)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-display font-bold text-white tracking-wider">{formatCurrency(order.valor)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Exibindo <span className="text-studio-gold">1-{Math.min(10, filteredOrders.length)}</span> de <span className="text-studio-gold">{filteredOrders.length}</span> transações
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
