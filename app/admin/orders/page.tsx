'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  List, 
  Calendar, 
  DollarSign, 
  Filter, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  Archive,
  CheckCircle2,
  Clock,
  Zap,
  Camera,
  User,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { supabase } from '@/lib/supabaseClient';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<Record<string, boolean>>({});
  const [downloadModal, setDownloadModal] = useState<{ isOpen: boolean; files: any[]; orderId: string }>({ 
    isOpen: false, 
    files: [], 
    orderId: '' 
  });
  const [uploadingOrder, setUploadingOrder] = useState<{ id: string; userId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState([
    { label: 'Total de Pedidos', value: '00', trend: '--', trendUp: true, icon: List, color: 'text-studio-gold bg-studio-gold/10' },
    { label: 'Pendentes', value: '00', trend: '--', trendUp: false, icon: Calendar, color: 'text-orange-600 bg-orange-100' },
    { label: 'Receita Mensal', value: 'R$ --', trend: '--', trendUp: true, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
  ]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      if (data) {
        setOrders(data);
        
        // Calcular Stats Reais
        const total = data.length;
        const pending = data.filter((o: any) => o.status === 'Aguardando Produção').length;
        
        setStats([
          { label: 'Total de Pedidos', value: total.toString().padStart(2, '0'), trend: '+0%', trendUp: true, icon: List, color: 'text-studio-gold bg-studio-gold/10' },
          { label: 'Pendentes', value: pending.toString().padStart(2, '0'), trend: '+0%', trendUp: false, icon: Calendar, color: 'text-orange-600 bg-orange-100' },
          { label: 'Receita Mensal', value: 'R$ --', trend: '+0%', trendUp: true, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
        ]);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handler: Alterar Status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const actionKey = `status-${orderId}`;
    try {
      setActiveAction(prev => ({ ...prev, [actionKey]: true }));
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      alert('Status atualizado com sucesso!');
      await fetchOrders();
    } catch (error: any) {
      alert('Erro ao atualizar status: ' + error.message);
    } finally {
      setActiveAction(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Handler: Download Fotos do Cliente
  const handleDownloadCustomerPhotos = async (userId: string, orderId: string) => {
    const actionKey = `download-${orderId}`;
    try {
      setActiveAction(prev => ({ ...prev, [actionKey]: true }));
      
      // Listar arquivos no bucket do cliente (usando userId como folder)
      const { data: files, error } = await supabase.storage
        .from('fotos_clientes')
        .list(userId);

      if (error) throw error;

      if (!files || files.length === 0) {
        alert('Nenhuma foto encontrada para este cliente no bucket.');
        return;
      }

      // Gerar URLs Públicas
      const filesWithUrls = files.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('fotos_clientes')
          .getPublicUrl(`${userId}/${file.name}`);
        
        return {
          name: file.name,
          url: publicUrl
        };
      });

      setDownloadModal({
        isOpen: true,
        files: filesWithUrls,
        orderId
      });

    } catch (error: any) {
      alert('Erro ao buscar fotos: ' + error.message);
    } finally {
      setActiveAction(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Handler: Iniciar Upload de Prévia
  const triggerUploadPreview = (orderId: string, userId: string) => {
    setUploadingOrder({ id: orderId, userId });
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadingOrder) return;

    const actionKey = `upload-${uploadingOrder.id}`;
    try {
      setActiveAction(prev => ({ ...prev, [actionKey]: true }));
      
      for (const file of Array.from(files)) {
        const filePath = `${uploadingOrder.userId}/${uploadingOrder.id}/${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('previa_ensaios')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;
      }

      // Atualizar status do pedido no banco após upload com sucesso
      const { error: statusError } = await supabase
        .from('pedidos')
        .update({ status: 'Processing' }) // Ou 'Completed', conforme preferência do admin
        .eq('id', uploadingOrder.id);

      if (statusError) throw statusError;

      alert('Prévias enviadas com sucesso e status atualizado!');
      await fetchOrders();

    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setActiveAction(prev => ({ ...prev, [actionKey]: false }));
      setUploadingOrder(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper: Formata data para DD/MM/YYYY
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />
      
      {/* Input de arquivo oculto para upload de prévias */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
        multiple
      />

      {/* Modal de Download de Fotos */}
      {downloadModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-bold font-display uppercase tracking-widest text-studio-gold">Fotos do Cliente</h3>
              <button 
                onClick={() => setDownloadModal({ ...downloadModal, isOpen: false })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {downloadModal.files.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum arquivo encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {downloadModal.files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-none group hover:border-studio-gold transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Camera size={16} className="text-studio-gold shrink-0" />
                        <span className="text-xs font-medium truncate text-slate-300">{file.name}</span>
                      </div>
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-studio-gold hover:text-studio-gold-light transition-colors"
                      >
                        Download
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex justify-end">
              <button 
                onClick={() => setDownloadModal({ ...downloadModal, isOpen: false })}
                className="px-6 py-2 bg-studio-gold text-studio-black text-[10px] font-bold uppercase tracking-widest hover:bg-studio-gold-light transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Profissional */}
        <header className="h-20 bg-studio-black border-b border-white/5 flex items-center justify-between px-8 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-display uppercase tracking-[0.2em] text-white">
              VIRTUAL <span className="text-studio-gold">STUDIO</span>
            </h1>
            <p className="text-[9px] text-studio-gold font-bold uppercase tracking-[0.2em] opacity-60">
              Painel de Controle Administrativo
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-none text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-studio-gold transition-all outline-none text-white placeholder:text-gray-600" 
                placeholder="Pesquisar pedidos..." 
                type="text"
              />
            </div>
            
            <div className="h-8 w-[1px] bg-white/10"></div>
            
            <div className="flex items-center gap-4">
              <button className="size-9 flex items-center justify-center rounded-none bg-white/5 border border-white/10 text-slate-400 relative hover:text-studio-gold transition-colors">
                <Bell size={18} />
                <span className="absolute top-2 right-2 size-1.5 bg-studio-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]"></span>
              </button>
              <button className="h-10 px-8 bg-studio-gold text-studio-black rounded-none text-[10px] font-bold font-display uppercase tracking-widest flex items-center gap-2 hover:bg-studio-gold-light transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <Plus size={14} />
                Novo Pedido
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#121212]">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-studio-black border border-white/5 p-6 rounded-none shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
                    <div className={`size-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold font-display uppercase tracking-widest">{stat.value}</span>
                    <span className={`text-xs font-bold mb-1.5 flex items-center ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {stat.trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Table Section */}
          <div className="bg-studio-black border border-white/5 rounded-none shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Fila de Produção</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded text-xs font-medium hover:bg-white/5 transition-colors text-slate-400">
                  <Filter size={14} />
                  Filtros
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded text-xs font-medium hover:bg-white/5 transition-colors text-slate-400">
                  <Download size={14} />
                  Exportar
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Archive className="text-gray-600 mb-4" size={48} />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="bg-white/5 text-gray-500 uppercase text-[10px] font-bold tracking-widest font-display">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Pacote</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-[10px] font-bold text-studio-gold font-display tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-studio-gold/10 flex items-center justify-center overflow-hidden border border-studio-gold/20">
                              <User size={16} className="text-studio-gold" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold truncate max-w-[150px]">{order.user_email?.split('@')[0]}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{order.user_email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">{order.pacote}</span>
                        </td>
                        <td className="px-6 py-4">
                          {activeAction[`status-${order.id}`] ? (
                            <div className="flex items-center gap-2 text-studio-gold">
                              <Loader2 size={14} className="animate-spin" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Atualizando...</span>
                            </div>
                          ) : (
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`bg-studio-black border px-2 py-1 text-[10px] font-bold uppercase tracking-widest font-display outline-none cursor-pointer focus:ring-1 focus:ring-studio-gold transition-all ${
                                order.status === 'Completed' ? 'text-emerald-400 border-emerald-400/30' :
                                order.status === 'Processing' ? 'text-blue-400 border-blue-400/30' :
                                'text-orange-400 border-orange-400/30'
                              }`}
                            >
                              <option value="Aguardando Produção">Aguardando Produção</option>
                              <option value="Processing">Processing</option>
                              <option value="Completed">Completed</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 tabular-nums">{formatDate(order.criado_em)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDownloadCustomerPhotos(order.user_id, order.id)}
                              disabled={activeAction[`download-${order.id}`]}
                              className="size-9 flex items-center justify-center rounded border border-white/10 text-slate-400 hover:border-studio-gold hover:text-studio-gold transition-all disabled:opacity-50" 
                              title="Download fotos do cliente"
                            >
                              {activeAction[`download-${order.id}`] ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            </button>
                            <button 
                              onClick={() => triggerUploadPreview(order.id, order.user_id)}
                              disabled={activeAction[`upload-${order.id}`]}
                              className="size-9 flex items-center justify-center rounded border border-white/10 text-slate-400 hover:border-studio-gold hover:text-studio-gold transition-all disabled:opacity-50" 
                              title="Upload prévia para o cliente"
                            >
                              {activeAction[`upload-${order.id}`] ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">Mostrando {orders.length} pedidos</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-white/10 rounded text-xs font-medium disabled:opacity-50 text-slate-400" disabled>Anterior</button>
                <button className="px-3 py-1.5 bg-studio-gold text-studio-black rounded text-xs font-bold">1</button>
                <button className="px-3 py-1.5 border border-white/10 rounded text-xs font-medium hover:bg-white/5 transition-colors text-slate-400" disabled>Próximo</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
