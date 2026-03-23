'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Wallet, 
  Activity, 
  Ticket, 
  UserPlus, 
  TrendingUp, 
  Minus,
  Receipt,
  Star,
  Loader2
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

import { supabase } from '@/lib/supabaseClient';

const PLAN_PRICES: Record<string, number> = {
  'Essencial': 89.90,
  'Premium': 149.90,
  'Elite': 247.90
};

export default function AdminReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    allTimeRevenue: 0,
    monthRevenue: 0,
    averageTicket: 0,
    totalClients: 0
  });
  
  const [chartData, setChartData] = useState<{ month: string, value: number }[]>([]);
  const [planData, setPlanData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('pedidos').select('*').order('criado_em', { ascending: false });
        if (error) throw error;
        
        if (data) {
          let totalRevenue = 0;
          let monthRevenue = 0;
          const userSet = new Set();
          
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          const planCounts: Record<string, number> = {};
          let totalCount = 0;

          const monthlyRev: Record<string, number> = {};
          // Pegar ultimos 6 meses
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mName = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
            monthlyRev[mName] = 0;
          }

          const clientSpending: Record<string, number> = {};

          data.forEach(order => {
            let pkgName = order.pacote;
            if (pkgName.includes('Essencial')) pkgName = 'Essencial';
            if (pkgName.includes('Premium')) pkgName = 'Premium';
            if (pkgName.includes('Elite')) pkgName = 'Elite';
            
            const val = PLAN_PRICES[pkgName] || 0;
            
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
            totalCount++;

            const mName = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
            if (monthlyRev[mName] !== undefined) {
              monthlyRev[mName] += val;
            }
          });

          setMetrics({
            allTimeRevenue: totalRevenue,
            monthRevenue: monthRevenue,
            averageTicket: totalCount > 0 ? (totalRevenue / totalCount) : 0,
            totalClients: userSet.size
          });

          const cData = Object.keys(monthlyRev).map(k => ({ month: k, value: monthlyRev[k] }));
          setChartData(cData);

          const colors = ['#c39d5d', '#8a8a8a', '#4a4a4a'];
          const pData = Object.keys(planCounts).map((k, idx) => ({
            name: k,
            count: planCounts[k],
            pct: Math.round((planCounts[k] / totalCount) * 100),
            color: colors[idx % colors.length]
          })).sort((a,b) => b.count - a.count);
          setPlanData(pData);

          const rOrders = data.slice(0, 5).map(o => {
            let pkgName = o.pacote;
            if (pkgName.includes('Essencial')) pkgName = 'Essencial';
            if (pkgName.includes('Premium')) pkgName = 'Premium';
            if (pkgName.includes('Elite')) pkgName = 'Elite';
            return {
              id: '#' + o.id.slice(0, 5).toUpperCase(),
              date: new Date(o.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year:'numeric' }),
              client: o.user_email ? o.user_email.split('@')[0] : 'Desconhecido',
              plan: pkgName,
              status: o.status,
              val: PLAN_PRICES[pkgName] || 0
            };
          });
          setRecentOrders(rOrders);

          const tClients = Object.keys(clientSpending).map(email => ({
            email,
            name: email.split('@')[0],
            spent: clientSpending[email]
          })).sort((a, b) => b.spent - a.spent).slice(0, 4);
          setTopClients(tClients);
        }
      } catch(e) { console.error(e); } finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Valores para montar o gráfico dinâmico simples usando SVG paths
  const maxVal = Math.max(...chartData.map(d => d.value), 100);
  const getY = (val: number) => 180 - (val / maxVal) * 140; // max Y = 180, min Y = 40
  const getX = (idx: number, len: number) => 50 + (idx * (400 / Math.max(1, len - 1)));
  
  let pathD = "";
  let pathFill = "";
  if (chartData.length > 0) {
    pathD = chartData.map((d, i) => `${i===0?'M':'L'}${getX(i, chartData.length)},${getY(d.value)}`).join(' ');
    pathFill = `M50,180 L${chartData.map((d,i) => `${getX(i, chartData.length)},${getY(d.value)}`).join(' L')} L${getX(chartData.length-1, chartData.length)},180 Z`;
  }

  // Dashboard spinner
  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-studio-black text-white">
        <AdminSidebar />
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#121212]">

          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-studio-gold" size={48} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#121212]">
        


        {/* Dashboard Body */}
        <div className="p-8 space-y-8 mx-auto w-full">
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-display uppercase tracking-widest font-bold mb-2">Relatórios Gerenciais</h1>
              <p className="text-slate-500 text-xs tracking-widest uppercase">Análise de Performance e BI</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#1a1a1a] border border-studio-gold/20 rounded-none px-4 py-3 gap-3 text-slate-300">
                <Calendar size={16} className="text-studio-gold" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Últimos 6 Meses</span>
              </div>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 border border-studio-gold/20 hover:border-studio-gold hover:text-studio-gold bg-transparent text-slate-400 rounded-none font-bold text-[10px] uppercase tracking-widest transition-all font-display">
                <FileText size={16} />
                Exportar PDF
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Receita Total All-Time', value: formatCurrency(metrics.allTimeRevenue), icon: Wallet },
              { label: 'Receita Mês Atual', value: formatCurrency(metrics.monthRevenue), icon: Activity },
              { label: 'Ticket Médio', value: formatCurrency(metrics.averageTicket), icon: Ticket, neutral: true },
              { label: 'Clientes Únicos', value: metrics.totalClients.toString(), icon: UserPlus }
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={i} className="bg-studio-black border border-white/10 p-6 rounded-none shadow-xl flex flex-col gap-3 relative overflow-hidden group hover:border-studio-gold/40 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-30">
                    <Icon size={48} className="text-studio-gold" />
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{kpi.label}</p>
                  <div className="flex items-end justify-between mt-1">
                    <h3 className="font-display text-2xl text-slate-100 tracking-wide font-bold">{kpi.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Line Chart Dinâmico SVG */}
            <div className="lg:col-span-2 bg-studio-black border border-white/10 shadow-xl rounded-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-display text-lg text-slate-100 uppercase tracking-wide font-bold">Receita Mensal</h4>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Performance dos últimos 6 meses</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-studio-gold"></span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Receita Bruta</span>
                </div>
              </div>
              <div className="h-[250px] w-full relative">
                {chartData.length > 0 ? (
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#c39d5d" stopOpacity="0.4"></stop>
                        <stop offset="100%" stopColor="#c39d5d" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d={pathFill} fill="url(#chartGradient)"></path>
                    <path d={pathD} fill="none" stroke="#c39d5d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                    
                    {/* Pontos */}
                    {chartData.map((d, i) => (
                      <g key={i}>
                        <circle cx={getX(i, chartData.length)} cy={getY(d.value)} fill="#121212" r="5" stroke="#c39d5d" strokeWidth="2" className="hover:r-6 hover:fill-studio-gold transition-all cursor-crosshair"></circle>
                        {/* Tooltip escondida no SVG puro ou texto condicional, aqui um valor puro pra base */}
                        {d.value > 0 && (
                          <text x={getX(i, chartData.length)} y={getY(d.value) - 15} fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">
                            {formatCurrency(d.value).replace(',00','').replace('R$','')}
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

            {/* Plan Distribution Placeholder/Bars */}
            <div className="bg-studio-black border border-white/10 shadow-xl rounded-none p-8 flex flex-col">
              <h4 className="font-display text-lg text-slate-100 uppercase tracking-wide font-bold mb-2">Vendas por Pacote</h4>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-8">Distribuição de assinaturas ativas</p>
              
              <div className="flex-1 flex flex-col justify-center">
                
                {planData.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Sem dados</p>
                ) : (
                  <div className="w-full grid grid-cols-1 gap-6">
                    {planData.map((plan, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star size={12} style={{color: plan.color}} />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">{plan.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-100">{plan.pct}% ({plan.count})</span>
                        </div>
                        {/* Progess Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${plan.pct}%`, backgroundColor: plan.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Lower Sections Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Top Clientes */}
            <div className="lg:col-span-1 bg-studio-black shadow-xl border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star size={18} className="text-studio-gold" />
                <h4 className="font-display text-base text-slate-100 uppercase tracking-wide font-bold">Top Clientes</h4>
              </div>
              <div className="flex flex-col gap-4">
                {topClients.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center py-4">Sem dados</p>
                ) : topClients.map((client, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5">
                    <div className="overflow-hidden pr-2">
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{client.name}</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest truncate">{client.email}</p>
                    </div>
                    <div className="text-studio-gold font-display text-sm font-bold shrink-0">{formatCurrency(client.spent)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="lg:col-span-3 bg-studio-black shadow-xl border border-white/10 rounded-none p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-studio-gold" />
                  <h4 className="font-display text-base text-slate-100 uppercase tracking-wide font-bold">Transações Mais Recentes</h4>
                </div>
              </div>
              <div className="overflow-x-auto">
                {recentOrders.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs font-bold py-10 uppercase tracking-widest">Nenhuma transação encontrada</p>
                ) : (
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Data</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Cliente</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Pacote</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Status</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentOrders.map((tx, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</td>
                          <td className="py-4 px-2">
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">{tx.client}</span>
                          </td>
                          <td className="py-4 px-2 text-[10px] font-bold text-studio-gold tracking-widest uppercase">{tx.plan}</td>
                          <td className="py-4 px-2">
                            <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider border ${
                              tx.status === 'Ensaio Concluído' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-studio-gold/10 text-studio-gold border-studio-gold/30'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-sm font-display text-white font-bold text-right tracking-wider">{formatCurrency(tx.val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
