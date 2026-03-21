'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Search, Send, FileImage, User, MessageSquare,
  CheckCheck, Archive, Loader2, ArrowLeft, Clock, FileText
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { supabase } from '@/lib/supabaseClient';

export default function AdminMessages() {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Carrega o ID do Admin e a lista de contatos (Pedidos)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setAdminId(session.user.id);

        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .order('criado_em', { ascending: false });

        if (error) throw error;
        if (data) {
          setPedidos(data);
          setFilteredPedidos(data);
        }
      } catch (error) {
        console.error('Erro ao carregar contatos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 2. Filtro de pesquisa na barra lateral
  useEffect(() => {
    const filtered = pedidos.filter(p =>
      p.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPedidos(filtered);
  }, [searchQuery, pedidos]);

  // 3. Carrega as mensagens quando clica em um pedido
  useEffect(() => {
    if (!selectedOrder) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('order_id', selectedOrder.id)
        .order('criado_em', { ascending: true });

      if (error) console.error('Erro ao buscar mensagens', error);
      else setMessages(data || []);

      scrollToBottom();
    };

    fetchMessages();

    // 4. Escutador Real-time para novas mensagens NESTE chat
    const channel = supabase
      .channel(`chat_${selectedOrder.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `order_id=eq.${selectedOrder.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedOrder]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 5. Enviar nova mensagem de texto para o cliente
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOrder || !adminId) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from('mensagens').insert({
        user_id: adminId, // Identifica que foi o Admin que mandou
        order_id: selectedOrder.id,
        conteudo: newMessage.trim(),
        tipo: 'texto'
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      alert("Erro ao enviar mensagem: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
        <AdminHeader />

        {/* Layout do Chat (Sidebar de Contatos + Área de Mensagens) */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">

          {/* COLUNA ESQUERDA: Lista de Pedidos/Clientes */}
          <div className="w-80 flex flex-col bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h2 className="font-display font-bold uppercase tracking-widest text-studio-gold text-sm flex items-center gap-2 mb-4">
                <MessageSquare size={16} /> Caixa de Entrada
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Buscar cliente ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-studio-gold transition-colors text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-studio-gold" /></div>
              ) : filteredPedidos.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">Nenhum pedido encontrado.</div>
              ) : (
                filteredPedidos.map(pedido => (
                  <button
                    key={pedido.id}
                    onClick={() => setSelectedOrder(pedido)}
                    className={`w-full text-left p-4 border-b border-white/5 transition-all hover:bg-white/5 flex gap-3 ${selectedOrder?.id === pedido.id ? 'bg-studio-gold/10 border-l-2 border-l-studio-gold' : 'border-l-2 border-l-transparent'}`}
                  >
                    <div className="size-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold truncate text-white">{pedido.user_email?.split('@')[0]}</span>
                        <span className="text-[9px] text-gray-500">{new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate uppercase tracking-widest">Pedido #{pedido.id.slice(0, 8)}</div>
                      <div className="mt-1">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${pedido.status === 'Pagamento em Análise' ? 'text-rose-400 border-rose-400/30 bg-rose-400/10' : 'text-gray-400 border-gray-400/30'}`}>
                          {pedido.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: Área do Chat */}
          <div className="flex-1 flex flex-col bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
            {selectedOrder ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 z-10">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-studio-gold/10 border border-studio-gold/30 flex items-center justify-center">
                      <User size={18} className="text-studio-gold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{selectedOrder.user_email?.split('@')[0]}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Pedido #{selectedOrder.id.slice(0, 8)} • Pacote {selectedOrder.pacote}</p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0a0a0a]">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <MessageSquare size={48} className="opacity-20" />
                      <p className="text-xs uppercase tracking-widest font-bold">Nenhuma mensagem ainda</p>
                      <p className="text-[10px]">O comprovante de PIX do cliente aparecerá aqui.</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isAdmin = msg.user_id === adminId;
                      return (
                        <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl p-4 shadow-xl ${isAdmin ? 'bg-studio-gold text-black rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/5'}`}>

                            {/* Renderizar Comprovante, Imagem ou Texto */}
                            {msg.tipo === 'comprovante' || msg.tipo === 'imagem' ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2 opacity-60">
                                  <FileImage size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Comprovante Recebido</span>
                                </div>
                                {msg.conteudo.includes('.pdf') ? (
                                  <a href={msg.conteudo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors text-xs font-bold">
                                    <FileText size={20} /> Baixar/Ver PDF
                                  </a>
                                ) : (
                                  <a href={msg.conteudo} target="_blank" rel="noopener noreferrer">
                                    <img src={msg.conteudo} alt="Comprovante" className="rounded-lg w-full max-h-64 object-contain bg-black/20 cursor-pointer hover:opacity-90 transition-opacity" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.conteudo}</p>
                            )}

                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{formatDate(msg.criado_em)}</span>
                            {isAdmin && <CheckCheck size={12} className="text-studio-gold" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.02] border-t border-white/5">
                  <div className="flex items-end gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl p-2 focus-within:border-studio-gold/50 transition-colors">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite uma mensagem para o cliente..."
                      className="flex-1 bg-transparent border-none outline-none text-sm p-2 resize-none max-h-32 min-h-[44px] text-white custom-scrollbar"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                      className="size-10 bg-studio-gold text-black rounded-lg flex items-center justify-center hover:bg-studio-gold-light transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                    >
                      {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-2 text-center uppercase tracking-widest">Pressione Enter para enviar. As mensagens ficarão salvas no histórico do pedido.</p>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <MessageSquare size={32} className="text-gray-600" />
                </div>
                <h3 className="font-display uppercase tracking-widest text-lg text-white font-bold mb-1">Central de Mensagens</h3>
                <p className="text-xs uppercase tracking-widest text-gray-500">Selecione um pedido na lateral para ver os comprovantes</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}