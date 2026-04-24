'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Search, Send, FileImage, User, MessageSquare,
  CheckCheck, Archive, Loader2, ArrowLeft, Clock, FileText, Paperclip
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

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
  const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const selectedOrderRef = useRef<string | null>(null);

  // Sync selected order ref and clear unread
  useEffect(() => {
    selectedOrderRef.current = selectedOrder?.id || null;
    if (selectedOrder) {
       localStorage.setItem('admin_read_chat_' + selectedOrder.id, new Date().toISOString());
       setUnreadMap(prev => { const p = { ...prev }; delete p[selectedOrder.id]; return p; });
    }
  }, [selectedOrder]);

  // Global channel listener on this page for incoming messages
  useEffect(() => {
    if (!adminId) return;
    const channel = supabase.channel('admin_inbox_ping')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, (payload) => {
        if (payload.new.user_id !== adminId) {
           const currentSelected = selectedOrderRef.current;
           if (currentSelected === payload.new.order_id) {
             localStorage.setItem('admin_read_chat_' + payload.new.order_id, new Date().toISOString());
           } else {
             setUnreadMap(prev => ({ ...prev, [payload.new.order_id]: true }));
           }
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [adminId]);

  // 1. Carrega o ID do Admin e a lista de contatos (Pedidos)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAdminId(session.user.id);
          
          // Carregar msgs recentes
          const { data: msgData } = await supabase.from('mensagens')
            .select('order_id, criado_em')
            .neq('user_id', session.user.id)
            .order('criado_em', { ascending: false });
            
          if (msgData) {
            const unread: Record<string, boolean> = {};
            msgData.forEach(msg => {
              if (unread[msg.order_id]) return;
              const lastSeen = localStorage.getItem('admin_read_chat_' + msg.order_id) || '2000-01-01T00:00:00.000Z';
              if (new Date(msg.criado_em) > new Date(lastSeen)) {
                unread[msg.order_id] = true;
              }
            });
            setUnreadMap(unread);
          }
        }

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

  // Atualizar o 'lido' do admin
  useEffect(() => {
    const updateSeen = () => {
      localStorage.setItem('admin_last_message_seen', new Date().toISOString());
      if (selectedOrder) {
        localStorage.setItem('admin_read_chat_' + selectedOrder.id, new Date().toISOString());
      }
    };
    updateSeen();
    const interval = setInterval(updateSeen, 10000);
    return () => clearInterval(interval);
  }, [selectedOrder]);

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
        user_id: adminId,
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

  // 6. NOVO: Enviar Imagens no Chat
  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder || !adminId) return;

    setIsSending(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `chat_admin_${Date.now()}.${fileExt}`;
      // Guarda na pasta do cliente para organização
      const filePath = `${selectedOrder.user_id}/chat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes_pix')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes_pix')
        .getPublicUrl(filePath);

      await supabase.from('mensagens').insert({
        user_id: adminId,
        order_id: selectedOrder.id,
        conteudo: publicUrl,
        tipo: 'imagem'
      });
    } catch (err: any) {
      alert('Erro ao enviar imagem: ' + err.message);
    } finally {
      setIsSending(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  const formatMessageTime = (dateString: string) => {
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = msgDate.toDateString() === today.toDateString();
    const isYesterday = msgDate.toDateString() === yesterday.toDateString();
    
    const time = msgDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Hoje, ${time}`;
    if (isYesterday) return `Ontem, ${time}`;
    
    const date = msgDate.toLocaleDateString('pt-BR');
    return `${date}, ${time}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">


        {/* Layout do Chat (Sidebar de Contatos + Área de Mensagens) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-0 md:p-6 gap-0 md:gap-6 pt-16 md:pt-16">

          {/* COLUNA ESQUERDA: Lista de Pedidos/Clientes */}
          <div className={`w-full md:w-80 h-full md:h-auto flex flex-col bg-[#121212] md:border md:border-white/5 md:rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 ${selectedOrder ? 'hidden md:flex' : 'flex'}`}>
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate text-white">{pedido.user_email?.split('@')[0]}</span>
                          {unreadMap[pedido.id] && (
                            <span className="size-1.5 bg-studio-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]"></span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-500">{new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate uppercase tracking-widest">Pedido #{pedido.id.slice(0, 8)}</div>
                      <div className="mt-1">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${pedido.status === 'Pagamento em Análise' ? 'text-rose-400 border-rose-400/30 bg-rose-400/10 animate-pulse' : 'text-gray-400 border-gray-400/30'}`}>
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
          <div className={`flex-1 flex flex-col bg-[#121212] md:border border-white/5 md:rounded-2xl overflow-hidden shadow-2xl relative ${!selectedOrder ? 'hidden md:flex' : 'flex h-full'}`}>
            {selectedOrder ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedOrder(null)} className="md:hidden size-8 flex items-center justify-center -ml-2 text-slate-400 hover:text-white transition-colors">
                      <ArrowLeft size={20} />
                    </button>
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
                      <p className="text-[10px]">As conversas deste pedido aparecerão aqui.</p>
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
                                  <FileImage size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">{msg.tipo === 'comprovante' ? 'Comprovante' : 'Imagem Anexada'}</span>
                                </div>
                                {msg.conteudo.includes('.pdf') ? (
                                  <a href={msg.conteudo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors text-xs font-bold">
                                    <FileText size={20} /> Baixar/Ver PDF
                                  </a>
                                ) : (
                                  <a href={msg.conteudo} target="_blank" rel="noopener noreferrer">
                                    <img src={msg.conteudo} alt="Anexo" className="rounded-lg w-full max-h-64 object-contain bg-black/20 cursor-pointer hover:opacity-90 transition-opacity" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.conteudo}</p>
                            )}

                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{formatMessageTime(msg.criado_em)}</span>
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

                    {/* Botão de Clipe (Upload) Admin */}
                    <input type="file" hidden ref={chatFileInputRef} onChange={handleSendImage} accept="image/*,.pdf" />
                    <button
                      type="button"
                      onClick={() => chatFileInputRef.current?.click()}
                      className="size-10 flex items-center justify-center text-gray-400 hover:text-studio-gold transition-colors shrink-0"
                      title="Anexar Imagem"
                    >
                      <Paperclip size={18} />
                    </button>

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
                <p className="text-xs uppercase tracking-widest text-gray-500">Selecione um pedido na lateral para ver as conversas</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}