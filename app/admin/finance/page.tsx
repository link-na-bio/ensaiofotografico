'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  DollarSign,
  Wallet,
  Activity,
  Ticket,
  UserPlus,
  FileText,
  Star,
  Receipt
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
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

  // Metrics & Charts
  const [metrics, setMetrics] = useState({
    allTimeRevenue: 0,
    monthRevenue: 0,
    averageTicket: 0,
    totalClients: 0
  });
  const [chartData, setChartData] = useState<{ month: string, value: number }[]>([]);
  const [planData, setPlanData] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, user_email, pacote, status, criado_em')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      if (data) {
        let totalRevenue = 0;
        let monthRevenue = 0;
        const userSet = new Set();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const planCounts: Record<string, number> = {};
        const monthlyRev: Record<string, number> = {};
        const clientSpending: Record<string, number> = {};

        // Inicializa os últimos 6 meses com 0
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mName = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
          monthlyRev[mName] = 0;
        }

        // Processa todos os pedidos e calcula os valores
        const ordersWithValues = data.map(order => {
          let pkgName = order.pacote;
          if (pkgName.includes('Essencial')) pkgName = 'Essencial';
          if (pkgName.includes('Premium')) pkgName = 'Premium';
          if (pkgName.includes('Elite')) pkgName = 'Elite';

          const val = PLAN_PRICES[pkgName] || 0;

          // Agregações
          totalRevenue += val;
          const d = new Date(order.criado_em);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthRevenue += val;
          }

          if (order.user_email) {
            userSet.add(order.user_email);
            clientSpending[order.user_email] = (clientSpending[order.user_email] || 0) + val;
          }

          planCounts[pkgName] = (planCounts[pkgName] || 0) + 1;

          const mName = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
          if (monthlyRev[mName] !== undefined) {
            monthlyRev[mName] += val;
          }

          return { ...order, pacote: pkgName, valor: val };
        });

        setOrders(ordersWithValues);
        setFilteredOrders(ordersWithValues);

        setMetrics({
          allTimeRevenue: totalRevenue,
          monthRevenue: monthRevenue,
          averageTicket: ordersWithValues.length > 0 ? (totalRevenue / ordersWithValues.length) : 0,
          totalClients: userSet.size
        });

        // Formata os dados para os Gráficos
        setChartData(Object.keys(monthlyRev).map(k => ({ month: k, value: monthlyRev[k] })));

        const colors = ['#D4AF37', '#A0842A', '#6B581C']; // Tons de Dourado
        setPlanData(Object.keys(planCounts).map((k, idx) => ({
          name: k,
          count: planCounts[k],
          pct: Math.round((planCounts[k] / ordersWithValues.length) * 100),
          color: colors[idx % colors.length]
        })).sort((a, b) => b.count - a.count));

        setTopClients(Object.keys(clientSpending).map(email => ({
          email,
          name: email.split('@')[0],
          spent: clientSpending[email]
        })).sort((a, b) => b.spent - a.spent).slice(0, 4));
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

  // Filtro de Pesquisa da Tabela
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
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cálculos do Gráfico SVG
  const maxVal = Math.max(...chartData.map(d => d.value), 100);
  const getY = (val: number) => 180 - (val / maxVal) * 140;
  const getX = (idx: number, len: number) => 50 + (idx * (400 / Math.max(1, len - 1)));

  let pathD = "";
  let pathFill = "";
  if (chartData.length > 0) {
    pathD = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i, chartData.length)},${getY(d.value)}`).join(' ');
    pathFill = `M50,180 L${chartData.map((d, i) => `${getX(i, chartData.length)},${getY(d.value)}`).join(' L')} L${getX(chartData.length - 1, chartData.length)},180 Z`;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-y-auto bg-[#121212]">
        <AdminHeader />

        <div className="p-8 space-y-8 mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-display uppercase tracking-widest font-bold mb-2">Painel Financeiro</h1>
              <p className="text-slate-500 text-xs tracking-widest uppercase">Inteligência de Vendas e Faturamento</p>
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 border border-studio-gold/20 hover:border-studio-gold hover:text-studio-gold bg-transparent text-slate-400 rounded-none font-bold text-[10px] uppercase tracking-widest transition-all font-display">
              <FileText size={16} /> Exportar Relatório PDF
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Receita Total (All-Time)', value: formatCurrency(metrics.allTimeRevenue), icon: Wallet },
              { label: 'Receita Mês Atual', value: formatCurrency(metrics.monthRevenue), icon: Activity },
              { label: 'Ticket Médio', value: formatCurrency(metrics.averageTicket), icon: Ticket },
              { label: 'Clientes Únicos', value: metrics.totalClients.toString(), icon: UserPlus }
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={i} className="bg-studio-black border border-white/10 p-6 rounded-none shadow-xl flex flex-col gap-3 relative overflow-hidden group hover:border-studio-gold/40 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-20">
                    <Icon size={48} className="text-studio-gold" />
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest relative z-10">{kpi.label}</p>
                  <div className="flex items-end justify-between mt-1 relative z-10">
                    <h3 className="font-display text-2xl text-white tracking-wide font-bold">{isLoading ? '-' : kpi.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico de Linha (Receita) */}
            <div className="lg:col-span-2 bg-studio-black border border-white/10 shadow-xl rounded-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-display text-lg text-slate-100 uppercase tracking-wide font-bold">Receita Mensal</h4>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Performance dos últimos 6 meses</p>
                </div>
              </div>
              <div className="h-[250px] w-full relative">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-studio-gold" size={32} /></div>
                ) : chartData.length > 0 ? (
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4"></stop>
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d={pathFill} fill="url(#chartGradient)"></path>
                    <path d={pathD} fill="none" stroke="#D4AF37" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>

                    {chartData.map((d, i) => (
                      <g key={i}>
                        <circle cx={getX(i, chartData.length)} cy={getY(d.value)} fill="#121212" r="5" stroke="#D4AF37" strokeWidth="2" className="hover:r-6 hover:fill-studio-gold transition-all cursor-crosshair"></circle>
                        {d.value > 0 && (
                          <text x={getX(i, chartData.length)} y={getY(d.value) - 15} fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">
                            {formatCurrency(d.value).replace(',00', '').replace('R$', '')}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold uppercase tracking-widest">Sem dados no período</div>
                )}
              </div>
              <div className="flex justify-between mt-4 px-2">
                {chartData.map(d => (
                  <span key={d.month} className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{d.month}</span>
                ))}
              </div>
            </div>

            {/* Distribuição de Pacotes & Top Clientes */}
            <div className="flex flex-col gap-8">
              <div className="bg-studio-black border border-white/10 shadow-xl rounded-none p-8 flex-1">
                <h4 className="font-display text-lg text-slate-100 uppercase tracking-wide font-bold mb-2">Vendas por Pacote</h4>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-6">Distribuição de vendas</p>
                {isLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-studio-gold" size={24} /></div>
                ) : planData.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Sem dados</p>
                ) : (
                  <div className="w-full grid grid-cols-1 gap-5">
                    {planData.map((plan, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star size={12} style={{ color: plan.color }} />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">{plan.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-100">{plan.pct}% ({plan.count})</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${plan.pct}%`, backgroundColor: plan.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-studio-black border border-white/10 shadow-xl rounded-none p-6">
                <h4 className="font-display text-xs text-slate-100 uppercase tracking-widest font-bold mb-4">Top Clientes</h4>
                <div className="flex flex-col gap-3">
                  {isLoading ? (
                    <div className="flex justify-center py-2"><Loader2 className="animate-spin text-slate-500" size={16} /></div>
                  ) : topClients.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center py-2">Sem dados</p>
                  ) : topClients.map((client, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5">
                      <div className="overflow-hidden pr-2">
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{client.name}</p>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest truncate">{client.email}</p>
                      </div>
                      <div className="text-studio-gold font-display text-xs font-bold shrink-0">{formatCurrency(client.spent)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Transações com Busca */}
          <div className="bg-studio-black border border-white/10 rounded-none shadow-2xl overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.02] gap-4">
              <h3 className="font-bold flex items-center gap-2 font-display uppercase tracking-widest text-sm text-white shrink-0">
                <Receipt size={18} className="text-studio-gold" />
                Histórico de Transações
              </h3>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-none py-2 pl-9 pr-3 focus:outline-none focus:border-studio-gold text-[10px] font-bold tracking-widest uppercase transition-all text-white placeholder:text-slate-600"
                    placeholder="Pesquisar pedido..."
                    type="text"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-studio-gold hover:border-studio-gold transition-colors uppercase tracking-widest shrink-0">
                  <Filter size={14} /> Filtro
                </button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
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
                          <span className="text-xs text-slate-400 font-mono tracking-wider">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white tracking-widest uppercase">{order.user_email ? order.user_email.split('@')[0] : 'Desconhecido'}</span>
                            <span className="text-[9px] text-slate-500 lowercase tracking-wider">{order.user_email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-studio-gold bg-studio-gold/10 px-2 py-1 border border-studio-gold/20 rounded">
                            {order.pacote}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${order.status === 'Pagamento em Análise' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
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