'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
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
  Loader2,
  FileImage,
  CheckCircle
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    JSZip: any;
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<Record<string, boolean>>({});

  // Modais
  const [downloadModal, setDownloadModal] = useState<{ isOpen: boolean; files: any[]; orderId: string }>({ isOpen: false, files: [], orderId: '' });
  const [comprovanteModal, setComprovanteModal] = useState<{ isOpen: boolean; url: string; orderId: string }>({ isOpen: false, url: '', orderId: '' });

  const [uploadingOrder, setUploadingOrder] = useState<{ id: string; userId: string; isBonus?: boolean } | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState([
    { label: 'Total de Pedidos', value: '00', trend: '--', trendUp: true, icon: List, color: 'text-studio-gold bg-studio-gold/10' },
    { label: 'Pendentes', value: '00', trend: '--', trendUp: false, icon: Calendar, color: 'text-orange-600 bg-orange-100' },
    { label: 'PIX em Análise', value: '00', trend: '--', trendUp: true, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
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

        const total = data.length;
        const pending = data.filter((o: any) => o.status === 'Aguardando Produção').length;
        const pixAnalyse = data.filter((o: any) => o.status === 'Pagamento em Análise').length;

        setStats([
          { label: 'Total de Pedidos', value: total.toString().padStart(2, '0'), trend: '+0%', trendUp: true, icon: List, color: 'text-studio-gold bg-studio-gold/10' },
          { label: 'Pendentes de IA', value: pending.toString().padStart(2, '0'), trend: '+0%', trendUp: false, icon: Calendar, color: 'text-orange-600 bg-orange-100' },
          { label: 'PIX para Conferir', value: pixAnalyse.toString().padStart(2, '0'), trend: pixAnalyse > 0 ? 'AÇÃO NECESSÁRIA' : '+0%', trendUp: true, icon: DollarSign, color: pixAnalyse > 0 ? 'text-rose-600 bg-rose-100 border border-rose-500' : 'text-emerald-600 bg-emerald-100' },
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

    // ESCUTADOR REAL-TIME DA TABELA DE PEDIDOS
    const channel = supabase
      .channel('admin_pedidos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          // Atualiza a tabela imediatamente quando houver qualquer alteração no banco
          fetchOrders();
        }
      )
      .subscribe();

    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const actionKey = `status-${orderId}`;
    try {
      setActiveAction(prev => ({ ...prev, [actionKey]: true }));

      const { data, error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      } else {
        alert('Erro de permissão no banco.');
      }

      await fetchOrders();
    } catch (error: any) {
      alert('Erro ao atualizar status: ' + error.message);
    } finally {
      setActiveAction(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDownloadCustomerPhotos = async (userId: string, orderId: string) => {
    const actionKey = `download-${orderId}`;
    try {
      setActiveAction(prev => ({ ...prev, [actionKey]: true }));
      const folderPath = `${userId}/${orderId}`;
      const { data: files, error } = await supabase.storage.from('fotos_clientes').list(folderPath);

      if (error) throw error;
      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) {
        alert(`Nenhuma foto encontrada na pasta deste pedido.`);
        return;
      }

      const paths = validFiles.map(file => `${folderPath}/${file.name}`);
      const { data: signedData, error: signedError } = await supabase.storage.from('fotos_clientes').createSignedUrls(paths, 3600);

      if (signedError) throw signedError;

      await handleStatusChange(orderId, 'Em Produção');

      const filesWithUrls = validFiles.map((file, idx) => ({ name: file.name, url: signedData[idx].signedUrl }));
      setDownloadModal({ isOpen: true, files: filesWithUrls, orderId });

    } catch (error: any) {
      alert('Erro ao buscar fotos: ' + error.message);
    } finally {
      setActiveAction(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const triggerUploadPreview = (orderId: string, userId: string) => {
    setUploadingOrder({ id: orderId, userId, isBonus: false });
    fileInputRef.current?.click();
  };

  const triggerUploadBonus = (orderId: string, userId: string) => {
    setUploadingOrder({ id: orderId, userId, isBonus: true });
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadingOrder) return;

    const actionKey = `upload-${uploadingOrder.id}`;
    try {
      setActiveAction(prev => ({ ...prev, [actionKey]: true }));

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const prefix = uploadingOrder.isBonus ? 'bonus_' : '';
        const safeFileName = `${prefix}${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${uploadingOrder.userId}/${uploadingOrder.id}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage.from('previa_ensaios').upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
      }

      if (!uploadingOrder.isBonus) {
        await supabase.from('pedidos').update({ status: 'Prévia Disponível' }).eq('id', uploadingOrder.id);
        alert('Prévias enviadas com sucesso e status atualizado!');
      } else {
        alert('Fotos Bônus enviadas com sucesso!');
      }

      await fetchOrders();
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setActiveAction(prev => ({ ...prev, [actionKey]: false }));
      setUploadingOrder(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleViewComprovante = async (orderId: string, userId: string) => {
    const actionKey = `comprovante-${orderId}`;
    setActiveAction(prev => ({ ...prev, [actionKey]: true }));

    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('conteudo')
        .eq('order_id', orderId)
        .eq('tipo', 'comprovante')
        .order('criado_em', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        alert("Não foi possível encontrar o arquivo do comprovante.");
        return;
      }

      setComprovanteModal({ isOpen: true, url: data.conteudo, orderId });

    } catch (err: any) {
      alert('Erro ao buscar comprovante: ' + err.message);
    } finally {
      setActiveAction(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleApprovePix = async () => {
    setIsApproving(true);
    try {
      await handleStatusChange(comprovanteModal.orderId, 'Ensaio Concluído');
      setComprovanteModal({ isOpen: false, url: '', orderId: '' });
      alert('PIX Aprovado! O ensaio final foi liberado para o cliente.');
    } catch (err: any) {
      alert('Erro ao aprovar: ' + err.message);
    } finally {
      setIsApproving(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDownloadAll = async () => {
    if (!downloadModal.files.length) return;
    if (!window.JSZip) { alert('A biblioteca de compactação ainda está carregando.'); return; }
    setIsZipping(true);
    try {
      const zip = new window.JSZip();
      const folderName = `pedido_${downloadModal.orderId.slice(0, 8).toUpperCase()}`;
      const folder = zip.folder(folderName);
      const downloadPromises = downloadModal.files.map(async (file) => {
        try { const response = await fetch(file.url); const blob = await response.blob(); folder?.file(file.name, blob); }
        catch (err) { console.error(`Erro ao baixar ${file.name}:`, err); }
      });
      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      const href = URL.createObjectURL(content);
      const a = document.createElement('a'); a.href = href; a.download = `VIRTUAL_STUDIO_${folderName}.zip`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(href);
    } catch (error: any) { alert('Erro ao gerar arquivo ZIP: ' + error.message); }
    finally { setIsZipping(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} multiple />

      {/* MODAL DE APROVAÇÃO DO PIX */}
      {comprovanteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#121212] border border-emerald-500/30 w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-bold font-display uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <DollarSign size={18} /> Conferência de PIX
              </h3>
              <button onClick={() => setComprovanteModal({ ...comprovanteModal, isOpen: false })} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 bg-studio-black/50 flex flex-col items-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Comprovante anexado pelo cliente:</p>
              <div className="relative w-full max-w-sm h-[400px] border border-white/10 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                {comprovanteModal.url.includes('.pdf') ? (
                  <iframe src={comprovanteModal.url} className="w-full h-full" title="PDF do Comprovante" />
                ) : (
                  <img src={comprovanteModal.url} alt="Comprovante" className="max-w-full max-h-full object-contain" />
                )}
              </div>
            </div>

            <div className="px-6 py-6 border-t border-white/5 bg-white/5 flex items-center justify-between gap-4">
              <button
                onClick={() => setComprovanteModal({ ...comprovanteModal, isOpen: false })}
                className="flex-1 py-4 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprovePix}
                disabled={isApproving}
                className="flex-1 py-4 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {isApproving ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Aprovar PIX</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Download de Fotos */}
      {downloadModal.isOpen && (
        <div className="fixed inset-0 z-[40] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-bold font-display uppercase tracking-widest text-studio-gold">Fotos do Cliente</h3>
              <div className="flex items-center gap-4">
                <button onClick={handleDownloadAll} disabled={isZipping} className={`text-[10px] font-bold uppercase tracking-widest text-studio-gold hover:text-studio-gold-light transition-colors border-b border-studio-gold/30 hover:border-studio-gold flex items-center gap-2 ${isZipping ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isZipping ? <><Loader2 size={12} className="animate-spin" /> Zipando...</> : 'Baixar Tudo (ZIP)'}
                </button>
                <button onClick={() => setDownloadModal({ ...downloadModal, isOpen: false })} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>
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
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-studio-gold hover:text-studio-gold-light transition-colors">Download <ExternalLink size={12} /></a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">


        <div className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 bg-[#121212]">
          <div className="grid grid-cols-3 gap-2 md:grid-cols-3 md:gap-6 mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-studio-black border border-white/5 p-3 md:p-6 rounded-none shadow-2xl flex flex-col justify-center aspect-square md:aspect-auto">
                  <div className="flex flex-col md:flex-row items-center md:justify-between mb-2 md:mb-4 gap-2 md:gap-0">
                    <div className={`size-6 md:size-8 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}><Icon size={14} className="md:w-[18px] md:h-[18px]" /></div>
                    <span className="text-slate-500 text-[9px] md:text-sm font-medium text-center md:text-left leading-tight">{stat.label}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-1 md:gap-2 mt-auto">
                    <span className="text-xl md:text-3xl font-bold font-display uppercase tracking-widest leading-none">{stat.value}</span>
                    <span className={`text-[8px] md:text-[10px] font-bold md:mb-1.5 flex items-center ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-studio-black border border-white/5 rounded-none shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Fila de Produção</h2>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div></div>
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
                      <th className="px-6 py-4">Pacote & Estilos</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${order.status === 'Pagamento em Análise' ? 'bg-emerald-900/10' : ''}`}>
                        <td className="px-6 py-4 text-[10px] font-bold text-studio-gold font-display tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-studio-gold/10 flex items-center justify-center overflow-hidden border border-studio-gold/20"><User size={16} className="text-studio-gold" /></div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold truncate max-w-[150px]">{order.user_email?.split('@')[0]}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{order.user_email}</span>
                            </div>
                          </div>
                        </td>

                        {/* A MÁGICA DOS ESTILOS ACONTECE AQUI */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">{order.pacote}</span>
                            {order.estilos && order.estilos.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {order.estilos.map((estilo: string, i: number) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-studio-gold/10 border border-studio-gold/30 text-studio-gold rounded text-[8px] uppercase tracking-wider whitespace-nowrap">
                                    {estilo}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {activeAction[`status-${order.id}`] ? (
                            <div className="flex items-center gap-2 text-studio-gold"><Loader2 size={14} className="animate-spin" /><span className="text-[10px] font-bold uppercase tracking-widest">Atualizando...</span></div>
                          ) : (
                            <select
                              value={order.status === 'Processing' ? 'Em Produção' : order.status === 'Completed' ? 'Ensaio Concluído' : order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`bg-studio-black border px-2 py-1 text-[10px] font-bold uppercase tracking-widest font-display outline-none cursor-pointer focus:ring-1 focus:ring-studio-gold transition-all ${(order.status === 'Ensaio Concluído' || order.status === 'Completed') ? 'text-emerald-400 border-emerald-400/30' :
                                (order.status === 'Pagamento em Análise') ? 'text-rose-400 border-rose-400/30 bg-rose-900/10 animate-pulse' :
                                  (order.status === 'Em Produção' || order.status === 'Processing') ? 'text-blue-400 border-blue-400/20 bg-blue-900/10' :
                                    (order.status === 'Prévia Disponível') ? 'text-studio-gold border-studio-gold/30' :
                                      'text-orange-400 border-orange-400/30'
                                }`}
                            >
                              <option value="Aguardando Produção">Aguardando Produção</option>
                              <option value="Em Produção">Em Produção</option>
                              <option value="Prévia Disponível">Prévia Disponível</option>
                              <option value="Pagamento em Análise">Pagamento em Análise</option>
                              <option value="Ensaio Concluído">Ensaio Concluído</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 tabular-nums">{formatDate(order.criado_em)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'Pagamento em Análise' ? (
                              <button
                                onClick={() => handleViewComprovante(order.id, order.user_id)}
                                disabled={activeAction[`comprovante-${order.id}`]}
                                className="h-9 px-3 flex items-center gap-2 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] disabled:opacity-50"
                              >
                                {activeAction[`comprovante-${order.id}`] ? <Loader2 size={16} className="animate-spin" /> : <FileImage size={16} />}
                                <span className="text-[10px] font-bold uppercase tracking-widest">Ver PIX</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleDownloadCustomerPhotos(order.user_id, order.id)}
                                  disabled={activeAction[`download-${order.id}`]}
                                  className="size-9 flex items-center justify-center rounded border border-white/10 text-slate-400 hover:border-studio-gold hover:text-studio-gold transition-all disabled:opacity-50"
                                  title="Download fotos do cliente"
                                >
                                  {activeAction[`download-${order.id}`] ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                </button>
                                <button
                                  onClick={() => triggerUploadBonus(order.id, order.user_id)}
                                  disabled={activeAction[`upload-${order.id}`]}
                                  className="size-9 flex items-center justify-center rounded border border-white/10 text-emerald-400 hover:border-emerald-500 hover:text-emerald-500 transition-all disabled:opacity-50"
                                  title="Upload foto bônus 🎁"
                                >
                                  {activeAction[`upload-${order.id}`] && uploadingOrder?.isBonus ? <Loader2 size={18} className="animate-spin" /> : <span>🎁</span>}
                                </button>
                                <button
                                  onClick={() => triggerUploadPreview(order.id, order.user_id)}
                                  disabled={activeAction[`upload-${order.id}`]}
                                  className="size-9 flex items-center justify-center rounded border border-white/10 text-slate-400 hover:border-studio-gold hover:text-studio-gold transition-all disabled:opacity-50"
                                  title="Upload prévia para o cliente"
                                >
                                  {activeAction[`upload-${order.id}`] && !uploadingOrder?.isBonus ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}