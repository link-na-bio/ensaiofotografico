'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Camera, Home, Library, PlusCircle, User, CloudUpload, Check, CheckCheck,
  Archive, X, Send, Sparkles, LogOut, Clock, LayoutGrid, CheckCircle2,
  ChevronRight, ChevronLeft, Info, Eye, Download, Zap, MessageSquare, FileImage, Loader2, FileText, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

declare global { interface Window { JSZip: any; } }

export default function Dashboard() {
  const router = useRouter();

  // Memória de Aba (Não perde ao dar F5)
  const [activeTab, setActiveTab] = useState<'home' | 'ensaios' | 'novo' | 'perfil' | 'mensagens'>('home');
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);

  // Filtro de Gênero
  const [genderFilter, setGenderFilter] = useState<'Feminino' | 'Masculino'>('Feminino');
  // Filtro de Categoria
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');

  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<null | 'essencial' | 'premium' | 'elite'>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const stylesScrollRef = useRef<HTMLDivElement>(null);

  const scrollStyles = (direction: 'left' | 'right') => {
    if (stylesScrollRef.current) {
      const scrollAmount = 300;
      stylesScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Estados do Perfil
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [dbStyles, setDbStyles] = useState<any[]>([]);

  // Função para buscar estilos no Supabase
  const fetchDbStyles = async () => {
    const { data, error } = await supabase.from('estilos').select('*').order('criado_em', { ascending: false });
    if (data) setDbStyles(data);
  };

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Estados do Chat (Mensagens e Imagens)
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTab = sessionStorage.getItem('activeTab');
    const savedOrderChat = sessionStorage.getItem('chatOrderId');
    if (savedTab) setActiveTab(savedTab as any);
    if (savedOrderChat) setChatOrderId(savedOrderChat);
  }, []);

  const changeTab = (tab: 'home' | 'ensaios' | 'novo' | 'perfil' | 'mensagens') => {
    setActiveTab(tab);
    sessionStorage.setItem('activeTab', tab);
  };

  const changeChatOrder = (id: string | null) => {
    setChatOrderId(id);
    if (id) sessionStorage.setItem('chatOrderId', id);
    else sessionStorage.removeItem('chatOrderId');
  };

  const getOffset = (index: number) => {
    let offset = index - activePreview;
    const total = previewPhotos.length;
    if (total === 0) return 0;
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;
    return offset;
  };

  const nextPreview = () => { if (previewPhotos.length > 0) setActivePreview((prev) => (prev + 1) % previewPhotos.length); };
  const prevPreview = () => { if (previewPhotos.length > 0) setActivePreview((prev) => (prev - 1 + previewPhotos.length) % previewPhotos.length); };

  const fetchPedidos = async (uid: string) => {
    try {
      const { data, error } = await supabase.from('pedidos').select('*').eq('user_id', uid).order('criado_em', { ascending: false });
      if (error) throw error;
      setPedidos(data || []);
    } catch (error) { console.error('Erro ao buscar pedidos:', error); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else if (session.user.email === 'brunomeueditor@gmail.com') {
        // Se você logou pelo Google e caiu no painel de cliente, o sistema te joga pro Admin na mesma hora!
        router.push('/admin/orders');
      } else {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || null);
        setIsLoading(false);
        fetchPedidos(session.user.id);
        fetchDbStyles();
      }
    };
    checkUser();

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', () => setWindowWidth(window.innerWidth));
    }
    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('cliente_pedidos_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `user_id=eq.${userId}` }, (payload) => {
        fetchPedidos(userId);
        if (payload.new.status === 'Ensaio Concluído') {
          setAlertMessage("Pagamento Aprovado! O seu ensaio está liberado para download em Meus Ensaios.");
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 8000);
          if (typeof window !== 'undefined') {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(() => { });
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // LÓGICA DO CHAT REAL-TIME
  useEffect(() => {
    if (!chatOrderId) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('mensagens').select('*').eq('order_id', chatOrderId).order('criado_em', { ascending: true });
      setMessages(data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    fetchMessages();

    const channel = supabase.channel(`client_chat_${chatOrderId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `order_id=eq.${chatOrderId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatOrderId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatOrderId || !userId) return;

    setIsSendingMessage(true);
    try {
      await supabase.from('mensagens').insert({
        user_id: userId,
        order_id: chatOrderId,
        conteudo: newMessage.trim(),
        tipo: 'texto'
      });
      setNewMessage('');
    } catch (err: any) {
      alert('Erro ao enviar mensagem: ' + err.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatOrderId || !userId) return;

    setIsSendingMessage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `chat_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/chat/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('comprovantes_pix').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('comprovantes_pix').getPublicUrl(filePath);

      await supabase.from('mensagens').insert({
        user_id: userId,
        order_id: chatOrderId,
        conteudo: publicUrl,
        tipo: 'imagem'
      });
    } catch (err: any) {
      alert('Erro ao enviar imagem: ' + err.message);
    } finally {
      setIsSendingMessage(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const getStyleLimit = () => { if (selectedPackage === 'essencial') return 1; if (selectedPackage === 'premium') return 3; if (selectedPackage === 'elite') return 5; return 0; };
  const toggleStyle = (style: string) => { const limit = getStyleLimit(); if (selectedStyles.includes(style)) { setSelectedStyles(selectedStyles.filter(s => s !== style)); } else if (selectedStyles.length < limit) { setSelectedStyles([...selectedStyles, style]); } else { alert(`O pacote ${selectedPackage} permite apenas ${limit} estilos.`); } };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) { const newFiles = Array.from(e.target.files); setSelectedFiles([...selectedFiles, ...newFiles].slice(0, 10)); } };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); if (e.dataTransfer.files) { const newFiles = Array.from(e.dataTransfer.files); setSelectedFiles([...selectedFiles, ...newFiles].slice(0, 10)); } };
  const removeFile = (index: number) => { setSelectedFiles(prev => prev.filter((_, i) => i !== index)); };

  const handleSendToProduction = async () => {
    if (!selectedPackage || selectedStyles.length === 0 || selectedFiles.length < 5) { alert("Preencha todos os campos obrigatórios e envie no mínimo 5 fotos."); return; }
    setIsUploading(true);
    try {
      const { data: orderData, error: dbError } = await supabase.from('pedidos').insert({ user_id: userId, user_email: userEmail, pacote: selectedPackage, estilos: selectedStyles, status: 'Aguardando Produção' }).select().single();
      if (dbError) throw dbError;
      const orderId = orderData.id;

      for (const file of selectedFiles) {
        const filePath = `${userId}/${orderId}/${Date.now()}_${file.name}`;
        const { error: storageError } = await supabase.storage.from('fotos_clientes').upload(filePath, file);
        if (storageError) throw storageError;
      }
      setAlertMessage("Pedido enviado com sucesso!"); setShowSuccessAlert(true); changeTab('home'); setSelectedPackage(null); setSelectedStyles([]); setSelectedFiles([]); fetchPedidos(userId!); setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error: any) { alert(`Falha no envio: ${error.message}`); } finally { setIsUploading(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { alert("As senhas não coincidem!"); return; }
    if (newPassword.length < 6) { alert("A senha deve ter pelo menos 6 caracteres."); return; }
    setIsUpdatingProfile(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { alert("Erro ao atualizar senha: " + error.message); } else { setAlertMessage("Senha atualizada com sucesso!"); setShowSuccessAlert(true); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setShowSuccessAlert(false), 5000); }
    setIsUpdatingProfile(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUpdatingProfile(true);
    try {
      const fileName = `avatar_${Date.now()}_${file.name}`;
      const filePath = `${userEmail}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl); setAlertMessage("Foto de perfil atualizada!"); setShowSuccessAlert(true); setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error: any) { alert("Erro ao atualizar avatar: " + error.message); } finally { setIsUpdatingProfile(false); }
  };

  const handleOpenPreview = async (orderId: string) => {
    setIsFetchingPreview(true);
    try {
      const path = `${userId}/${orderId}/`;
      const { data: files, error } = await supabase.storage.from('previa_ensaios').list(path);
      if (error) throw error;
      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) { alert("Nenhuma prévia encontrada."); return; }
      const urlPromises = validFiles.map(async (file) => {
        const { data, error } = await supabase.storage.from('previa_ensaios').createSignedUrl(`${path}${file.name}`, 3600);
        if (error) throw error; return data.signedUrl;
      });
      setPreviewPhotos(await Promise.all(urlPromises)); setSelectedOrderId(orderId); setActivePreview(0); setIsPreviewOpen(true);
    } catch (error: any) { alert("Erro ao carregar prévia: " + error.message); } finally { setIsFetchingPreview(false); }
  };

  const handleDownloadFinal = async (orderId: string) => {
    setIsDownloading(orderId);
    try {
      const path = `${userId}/${orderId}/`;
      const { data: files, error } = await supabase.storage.from('previa_ensaios').list(path);
      if (error) throw error;

      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) { alert("Ficheiros não encontrados no servidor."); return; }

      const urlPromises = validFiles.map(async (file) => {
        const { data, error: urlError } = await supabase.storage.from('previa_ensaios').createSignedUrl(`${path}${file.name}`, 3600);
        if (urlError) throw urlError;
        return { name: file.name, url: data.signedUrl };
      });

      const fileData = await Promise.all(urlPromises);
      if (!window.JSZip) { alert("A carregar sistema de ficheiros ZIP, aguarde um instante..."); return; }

      const zip = new window.JSZip();
      const folder = zip.folder(`Virtual_Studio_Ensaio_${orderId.slice(0, 8)}`);

      const downloadPromises = fileData.map(async (f) => {
        const res = await fetch(f.url);
        const blob = await res.blob();
        folder.file(f.name, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });

      const href = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = href;
      a.download = `VIRTUAL_STUDIO_ENSAIO_${orderId.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    } catch (e: any) {
      alert("Erro ao baixar fotos: " + e.message);
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-studio-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div></div>;

  const renderActionButtons = (pedido: any) => {
    if (pedido.status === 'Prévia Disponível') {
      return (
        <button onClick={() => handleOpenPreview(pedido.id)} disabled={isFetchingPreview} className="relative z-50 w-full py-3 bg-studio-gold text-studio-black font-bold uppercase tracking-widest text-[10px] hover:bg-studio-gold-light transition-all flex items-center justify-center gap-2 group/btn cursor-pointer disabled:opacity-50 rounded-xl">
          {isFetchingPreview && selectedOrderId === pedido.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />} Visualizar Prévia
        </button>
      );
    }
    if (pedido.status === 'Pagamento em Análise') {
      return (
        <button disabled className="relative w-full py-3 bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-not-allowed rounded-xl">
          <Clock size={14} /> Analisando Pagamento...
        </button>
      );
    }
    if (pedido.status === 'Ensaio Concluído' || pedido.status === 'Finalizado') {
      return (
        <button
          onClick={() => handleDownloadFinal(pedido.id)}
          disabled={isDownloading === pedido.id}
          className="relative z-50 w-full py-3 bg-emerald-500 text-black font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer rounded-xl"
        >
          {isDownloading === pedido.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Baixar Fotos em Alta
        </button>
      );
    }
    return null;
  };

  // Categorias Dinâmicas
  const availableCategories = ['Todos', ...Array.from(new Set(dbStyles.map(s => s.categoria).filter(Boolean)))];

  // Filtragem dos estilos baseada no Gênero e Categoria
  const displayStyles = dbStyles.filter(s =>
    (s.genero === genderFilter || s.genero === 'Ambos') &&
    (categoryFilter === 'Todos' || s.categoria === categoryFilter)
  );

  return (
    <div className="flex min-h-screen bg-studio-black text-white relative">
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-studio-black/50">
              <div><h3 className="text-2xl font-display uppercase tracking-widest text-studio-gold font-bold">Prévia do Ensaio</h3><p className="text-gray-400 text-xs mt-1">Protegido com marca de água. Aprove para libertar a versão final em alta resolução sem marcas.</p></div>
              <button onClick={() => setIsPreviewOpen(false)} className="text-white hover:text-studio-gold transition-colors p-2 bg-white/5 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 relative flex items-center justify-center overflow-hidden py-12 px-4 select-none">
              <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center">
                {previewPhotos.map((url, idx) => {
                  const offset = getOffset(idx);
                  const absOffset = Math.abs(offset);
                  const isActive = absOffset <= 2;
                  const isCenter = offset === 0;
                  return (
                    <motion.div key={idx} onClick={() => !isCenter && setActivePreview(idx)} className={`absolute w-[220px] h-[400px] md:w-[280px] md:h-[500px] rounded-2xl overflow-hidden bg-[#121212] ${isCenter ? 'border-2 border-studio-gold shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'border border-white/10 opacity-60'} ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`} initial={false} animate={{ x: offset * (windowWidth < 768 ? 160 : 320), scale: isActive ? 1 - absOffset * 0.15 : 0.5, zIndex: 20 - absOffset, opacity: isActive ? (1 - absOffset * 0.3) : 0, }} transition={{ type: "spring", stiffness: 260, damping: 25 }}>
                      <img src={url} alt={`Prévia ${idx + 1}`} className="w-full h-full object-contain filter blur-[1px] brightness-[0.9] contrast-[1.1] pointer-events-none select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                      <div className="absolute inset-0 z-10 cursor-not-allowed" onContextMenu={(e) => e.preventDefault()}></div>
                      <div className="absolute inset-0 z-20 pointer-events-none opacity-25 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cstyle%3E .watermark { font-family: 'sans-serif'; font-size: 10px; font-weight: 900; fill: %23ffffff; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.6; } %3C/style%3E%3Ctext x='50' y='50' transform='rotate(-45 50 50)' text-anchor='middle' className='watermark'%3EVIRTUAL STUDIO%3C/text%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '80px 80px' }}></div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center items-center gap-2 pb-8">
              {previewPhotos.map((_, i) => (
                <button key={i} onClick={() => setActivePreview(i)} className={`transition-all duration-300 rounded-full h-1.5 ${activePreview === i ? 'w-8 bg-studio-gold shadow-[0_0_10px_rgba(195,157,93,0.5)]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
            <div className="p-6 border-t border-white/10 bg-studio-black/90 flex justify-center">
              <button onClick={() => router.push(`/checkout?orderId=${selectedOrderId}`)} className="w-full max-w-lg py-5 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest text-sm md:text-base hover:bg-studio-gold-light transition-all rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3"><CheckCircle2 size={24} /> Aprovar e Libertar Alta Resolução</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3">
            <CheckCircle2 size={20} /><span>{alertMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-64 border-r border-white/5 bg-studio-black flex flex-col sticky top-0 h-screen hidden md:flex shrink-0">
        <div className="p-8 flex flex-col items-center text-center border-b border-white/5 mb-4">
          <div className="flex flex-col items-center">
            <div className="relative w-[150px] h-[150px] -mt-[40px] -mb-[60px] flex items-center justify-center pointer-events-none">
              <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
            </div>
            <div className="h-[1px] w-2/3 bg-gradient-to-r from-transparent via-studio-gold/50 to-transparent mt-2 mb-1"></div>
            <p className="text-[10px] text-studio-gold font-bold uppercase tracking-[0.3em] opacity-80">
              Painel do Cliente
            </p>
          </div>
        </div>
          <nav className="flex flex-col gap-1">
            <button onClick={() => changeTab('home')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'home' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><Home size={18} /><span className="text-sm font-medium">Home</span></button>
            <button onClick={() => changeTab('ensaios')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'ensaios' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><Library size={18} /><span className="text-sm font-medium">Os Meus Ensaios</span></button>
            <button onClick={() => changeTab('novo')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'novo' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><PlusCircle size={18} /><span className="text-sm font-semibold">Novo Pedido</span></button>
            <button onClick={() => changeTab('mensagens')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'mensagens' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><MessageSquare size={18} /><span className="text-sm font-medium">Mensagens</span></button>
            <button onClick={() => changeTab('perfil')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'perfil' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><User size={18} /><span className="text-sm font-medium">Perfil</span></button>
          </nav>
        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-studio-gold/20 flex items-center justify-center overflow-hidden relative border border-studio-gold/30">
              {avatarUrl ? <Image src={avatarUrl} alt="Avatar" fill className="object-cover" /> : <div className="w-full h-full bg-studio-gold text-studio-black flex items-center justify-center font-bold text-lg">{userEmail?.charAt(0).toUpperCase()}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate font-display tracking-widest">{userEmail ? userEmail.split('@')[0] : 'Utilizador'}</p>
            </div>
            <div className="relative flex gap-2">
              <button onClick={handleLogout} title="Sair da conta"><LogOut className="text-red-500 cursor-pointer hover:text-red-400 transition-colors" size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#121212] pt-20 pb-24 md:pt-8 md:pb-8 relative">
        <header className="fixed top-0 left-0 right-0 h-16 bg-studio-black/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2"><div className="relative w-8 h-8"><Image src="/logo.png" alt="Logo" fill className="object-contain" priority /></div><h1 className="text-white text-xs font-bold font-display tracking-widest leading-none">VIRTUAL STUDIO</h1></div>
          <button onClick={handleLogout} className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-500"><LogOut size={16} /></button>
        </header>

        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="home" className="px-8">
            <header className="mb-10"><h2 className="text-3xl font-bold font-display uppercase tracking-wider">Bem-vindo ao Virtual Studio, <span className="text-studio-gold">{userEmail?.split('@')[0]}</span></h2><p className="text-gray-500 mt-2">A sua jornada para a imagem profissional perfeita começa aqui.</p></header>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Clock className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Aguardando Produção').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Aguardando IA</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Zap className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Em Produção').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Em Produção</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><LayoutGrid className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Prévia Disponível').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Prévia Disponível</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><CheckCircle2 className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Ensaio Concluído' || p.status === 'Finalizado').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Concluídos</p></div>
            </div>
            {pedidos.length > 0 && (
              <section className="mb-12">
                <h3 className="text-lg font-bold font-display uppercase tracking-widest mb-6 flex items-center gap-3"><Clock size={18} className="text-studio-gold" /> Pedidos Recentes</h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10"><tr><th className="px-6 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Pacote</th><th className="px-6 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Data</th><th className="px-6 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Status</th></tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {pedidos.slice(0, 3).map((pedido) => (
                        <tr key={pedido.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-studio-gold">{pedido.pacote}</td>
                          <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(pedido.criado_em)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${(pedido.status === 'Ensaio Concluído' || pedido.status === 'Finalizado') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              (pedido.status === 'Pagamento em Análise') ? 'bg-blue-900/20 text-blue-400 border-blue-400/30' :
                                (pedido.status === 'Prévia Disponível') ? 'bg-studio-gold/10 text-studio-gold border-studio-gold/20' :
                                  'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              }`}>
                              {pedido.status === 'Finalizado' ? 'Ensaio Concluído' : pedido.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </motion.div>
        )}

        {activeTab === 'ensaios' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="ensaios" className="px-8">
            <header className="mb-8"><h2 className="text-3xl font-bold font-display uppercase tracking-wider">Os Meus Ensaios</h2></header>
            {pedidos.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-studio-gold/10 text-studio-gold flex items-center justify-center mb-6"><Archive size={32} /></div>
                <h3 className="text-xl font-bold font-display uppercase tracking-widest">Ainda não possui ensaios</h3>
                <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Inicie um novo pedido para começar a transformar as suas fotos com a nossa tecnologia.</p>
                <button onClick={() => changeTab('novo')} className="mt-8 px-8 py-3 bg-studio-gold text-studio-black font-bold uppercase tracking-widest hover:bg-studio-gold-light transition-all flex items-center gap-2"><PlusCircle size={18} /> Novo Pedido</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className={`relative bg-white/5 border rounded-2xl overflow-hidden flex flex-col transition-all ${pedido.status === 'Ensaio Concluído' ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/10 hover:border-studio-gold/30'}`}>
                    <div className="p-6 flex-1 flex flex-col relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${(pedido.status === 'Ensaio Concluído') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          (pedido.status === 'Pagamento em Análise') ? 'bg-blue-900/20 text-blue-400 border-blue-400/30 animate-pulse' :
                            (pedido.status === 'Prévia Disponível') ? 'bg-studio-gold/10 text-studio-gold border-studio-gold/20' :
                              'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                          {pedido.status === 'Finalizado' ? 'Ensaio Concluído' : pedido.status}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{formatDate(pedido.criado_em)}</span>
                      </div>

                      <h4 className="text-lg font-bold font-display uppercase tracking-widest text-studio-gold mb-2">{pedido.pacote}</h4>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {pedido.estilos?.map((estilo: string) => (
                          <span key={estilo} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase tracking-wider text-gray-400">{estilo}</span>
                        ))}
                      </div>

                      <div className="mt-auto relative z-50">
                        {renderActionButtons(pedido)}
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold"><Camera size={14} className="text-studio-gold" /> ID: {pedido.id.slice(0, 8)}</div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-studio-gold group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'mensagens' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="mensagens" className="px-4 md:px-8 h-full flex flex-col pb-8">
            <header className="mb-6 shrink-0">
              <h2 className="text-2xl font-bold font-display uppercase tracking-wider">Central de Suporte</h2>
              <p className="text-gray-500 text-sm mt-1">Fale com a nossa equipa sobre os seus pedidos.</p>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-[500px] max-h-[70vh]">

              <div className={`w-full md:w-80 flex-col bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 ${chatOrderId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <h2 className="font-display font-bold uppercase tracking-widest text-studio-gold text-sm flex items-center gap-2">
                    <MessageSquare size={16} /> Meus Pedidos
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {pedidos.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">Nenhum pedido encontrado.</div>
                  ) : (
                    pedidos.map(pedido => (
                      <button
                        key={pedido.id}
                        onClick={() => changeChatOrder(pedido.id)}
                        className={`w-full text-left p-4 border-b border-white/5 transition-all hover:bg-white/5 flex gap-3 ${chatOrderId === pedido.id ? 'bg-studio-gold/10 border-l-2 border-l-studio-gold' : 'border-l-2 border-l-transparent'}`}
                      >
                        <div className="size-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                          <Archive size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold truncate text-white">Pedido #{pedido.id.slice(0, 8)}</span>
                            <span className="text-[9px] text-gray-500">{new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 truncate uppercase tracking-widest">Pacote {pedido.pacote}</div>
                          <div className="mt-1">
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${pedido.status === 'Pagamento em Análise' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' : 'text-gray-400 border-gray-400/30'}`}>
                              {pedido.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className={`flex-1 flex-col bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative ${!chatOrderId ? 'hidden md:flex' : 'flex'}`}>
                {!chatOrderId ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
                      <MessageSquare size={32} className="text-gray-600" />
                    </div>
                    <h3 className="font-display uppercase tracking-widest text-lg text-white font-bold">Suporte Online</h3>
                    <p className="text-xs uppercase tracking-widest text-gray-500">Selecione um pedido na lateral para iniciar o chat</p>
                  </div>
                ) : (
                  <>
                    <div className="h-16 border-b border-white/10 bg-white/5 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
                      <div className="flex items-center gap-3">
                        <button onClick={() => changeChatOrder(null)} className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                          <ChevronLeft size={20} />
                        </button>
                        <div className="size-10 rounded-full bg-studio-gold/10 border border-studio-gold/30 hidden md:flex items-center justify-center">
                          <User size={18} className="text-studio-gold" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white uppercase tracking-widest">Pedido #{chatOrderId.slice(0, 8)}</h3>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Suporte Online</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#0a0a0a] custom-scrollbar">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                          <MessageSquare size={40} className="mb-2" />
                          <p className="text-xs uppercase tracking-widest font-bold">Inicie a conversa</p>
                          <p className="text-[10px] mt-2">A nossa equipa responderá o mais rápido possível.</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const isMe = msg.user_id === userId;
                          return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-xl ${isMe ? 'bg-studio-gold text-black rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/5'}`}>
                                {msg.tipo === 'comprovante' || msg.tipo === 'imagem' ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2 opacity-60">
                                      <FileImage size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">{msg.tipo === 'comprovante' ? 'Comprovativo' : 'Imagem'}</span>
                                    </div>
                                    {msg.conteudo.includes('.pdf') ? (
                                      <a href={msg.conteudo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors text-xs font-bold"><FileText size={16} /> Ver Ficheiro</a>
                                    ) : (
                                      <a href={msg.conteudo} target="_blank" rel="noopener noreferrer">
                                        <img src={msg.conteudo} alt="Anexo" className="rounded-lg w-full max-h-48 object-cover bg-black/20" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.conteudo}</p>
                                )}
                              </div>
                              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mt-1 px-1">{new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white/5 border-t border-white/10">
                      <div className="flex items-end gap-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-1.5 focus-within:border-studio-gold/50 transition-colors">
                        <input type="file" hidden ref={chatFileInputRef} onChange={handleSendImage} accept="image/*,.pdf" />
                        <button
                          type="button"
                          onClick={() => chatFileInputRef.current?.click()}
                          className="size-10 flex items-center justify-center text-gray-400 hover:text-studio-gold transition-colors shrink-0"
                        >
                          <Paperclip size={18} />
                        </button>

                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escreva a sua mensagem..."
                          className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm p-2 resize-none max-h-24 min-h-[40px] text-white custom-scrollbar"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                          }}
                        />

                        <button
                          type="submit"
                          disabled={isSendingMessage || !newMessage.trim()}
                          className="size-10 bg-studio-gold text-black rounded-lg flex items-center justify-center hover:bg-studio-gold-light transition-all disabled:opacity-50 shrink-0"
                        >
                          {isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'novo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="novo" className="px-8">
            <header className="mb-8"><h2 className="text-2xl font-bold font-display uppercase tracking-widest">Configurar Novo Ensaio</h2><p className="text-gray-500">Personalize o seu pedido para obter o melhor resultado.</p></header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-12 pb-20">
                <section>
                  <div className="flex items-center gap-4 mb-8"><span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">1</span><h3 className="text-xl font-bold font-display uppercase tracking-widest">Escolha o seu Pacote</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'essencial', title: 'Essencial', styles: '1 Estilo', price: 'R$ 89,90', icon: User },
                      { id: 'premium', title: 'Premium', styles: '3 Estilos', price: 'R$ 149,90', icon: Sparkles, popular: true },
                      { id: 'elite', title: 'Elite', styles: '5 Estilos', price: 'R$ 247,90', icon: Zap },
                    ].map((pkg) => (
                      <button key={pkg.id} onClick={() => { setSelectedPackage(pkg.id as any); setSelectedStyles([]); }} className={`p-6 border text-left rounded-xl transition-all relative overflow-hidden group ${selectedPackage === pkg.id ? 'border-studio-gold bg-studio-gold/5 shadow-lg' : 'border-white/10 hover:border-studio-gold/30'}`}>
                        {pkg.popular && <div className="absolute top-0 right-0 bg-studio-gold text-studio-black text-[8px] font-bold px-2 py-0.5 uppercase tracking-tighter">Mais Vendido</div>}
                        {selectedPackage === pkg.id && <div className="absolute top-2 right-2 text-studio-gold"><CheckCircle2 size={16} /></div>}
                        <pkg.icon className={`mb-4 transition-colors ${selectedPackage === pkg.id ? 'text-studio-gold' : 'text-gray-500'}`} size={24} />
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-1">{pkg.title}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">{pkg.styles}</p>
                        <p className={`text-xs font-bold ${selectedPackage === pkg.id ? 'text-studio-gold' : 'text-gray-400'}`}>{pkg.price}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {selectedPackage && (
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-end mb-4">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">2</span>
                        <h3 className="text-xl font-bold font-display uppercase tracking-widest">Escolha o seu Estilo visual</h3>
                      </div>
                      <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Selecionados: <span className={selectedStyles.length === getStyleLimit() ? 'text-studio-gold' : 'text-white'}>{selectedStyles.length}/{getStyleLimit()}</span></span>
                    </div>

                    <div className="mb-6 p-4 bg-studio-gold/5 border border-studio-gold/20 rounded-xl flex items-start gap-3">
                      <Info size={18} className="text-studio-gold shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-300 leading-relaxed font-light">
                        <strong className="text-studio-gold uppercase tracking-wider text-[10px] block mb-1">Dica: Direção de Arte</strong>
                        Você não escolhe uma simples "pose rígida". A IA atua como um fotógrafo real: ela <strong>manterá a estética e o cenário</strong> do estilo, mas gerará variações de iluminação, ângulos e expressões (olhares focados, sorrisos).
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex bg-[#121212] border border-white/10 rounded-lg p-1 w-fit shrink-0">
                        <button onClick={() => setGenderFilter('Feminino')} className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${genderFilter === 'Feminino' ? 'bg-studio-gold text-black' : 'text-gray-400 hover:text-white'}`}>Feminino</button>
                        <button onClick={() => setGenderFilter('Masculino')} className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${genderFilter === 'Masculino' ? 'bg-studio-gold text-black' : 'text-gray-400 hover:text-white'}`}>Masculino</button>
                      </div>

                      <div className="relative w-full sm:max-w-[240px]">
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full h-full min-h-[44px] px-4 pr-10 bg-[#121212] border border-white/10 rounded-lg focus:border-studio-gold outline-none text-[10px] font-bold uppercase tracking-widest text-white transition-colors appearance-none cursor-pointer"
                        >
                          {availableCategories.map((cat: any) => (
                            <option key={cat} value={cat}>{cat?.toLowerCase()?.includes('executivo') ? 'Executivo/Corporativo' : cat}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-studio-gold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <button type="button" onClick={() => scrollStyles('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-10 h-10 bg-[#121212] border border-white/10 rounded-full flex items-center justify-center text-white hover:text-studio-gold hover:border-studio-gold transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex"><ChevronLeft size={20} className="pr-[2px] pt-[1px]" /></button>

                      <div ref={stylesScrollRef} className="flex overflow-x-auto snap-x gap-4 pb-6 no-scrollbar scroll-smooth">
                        {displayStyles.length === 0 ? (
                          <p className="text-gray-500 text-xs italic p-4">Nenhum estilo disponível nesta categoria.</p>
                        ) : (
                          displayStyles.map((style) => (
                            <div key={style.id} onClick={() => toggleStyle(style.titulo)} className={`min-w-[180px] h-[240px] snap-start relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedStyles.includes(style.titulo) ? 'border-studio-gold scale-[0.98]' : 'border-white/5 hover:border-studio-gold/40'}`}>
                              <Image src={style.img_url} alt={style.titulo} fill className="object-contain" unoptimized />
                              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-4 transition-all ${selectedStyles.includes(style.titulo) ? 'bg-studio-gold/20' : 'opacity-80'}`}>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white">{style.titulo}</p>
                                {selectedStyles.includes(style.titulo) && <div className="absolute top-2 right-2 bg-studio-gold text-studio-black rounded-full p-1"><Check size={10} strokeWidth={4} /></div>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <button type="button" onClick={() => scrollStyles('right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-10 h-10 bg-[#121212] border border-white/10 rounded-full flex items-center justify-center text-white hover:text-studio-gold hover:border-studio-gold transition-all shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex"><ChevronRight size={20} className="pl-[2px] pt-[1px]" /></button>
                    </div>

                    {selectedStyles.length > 0 && (
                      <div className="mt-2 mb-4 p-5 border border-white/10 bg-[#121212] rounded-xl">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Info size={14} className="text-studio-gold" /> Detalhes dos Estilos Escolhidos
                        </h4>
                        <div className="space-y-3">
                          {selectedStyles.map(st => {
                            const styleInfo = dbStyles.find(d => d.titulo === st);
                            if (!styleInfo?.descricao) return null;
                            return (
                              <div key={st} className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col gap-1">
                                <strong className="text-white uppercase tracking-widest">{st}</strong>
                                <p>{styleInfo.descricao}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </motion.section>
                )}

                <section>
                  <div className="flex items-center gap-4 mb-6"><span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">3</span><h3 className="text-xl font-bold font-display uppercase tracking-widest">suas Fotos de Referência</h3></div>

                  <input type="file" multiple accept="image/jpeg, image/png, image/webp" hidden ref={fileInputRef} onChange={handleFileChange} />
                  <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center bg-white/5 hover:border-studio-gold/30 transition-all cursor-pointer group rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-studio-gold/5 text-studio-gold flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-studio-gold/10 transition-all"><CloudUpload size={32} /></div>
                    <h4 className="text-lg font-bold font-display uppercase tracking-widest">Arraste aqui as suas fotos</h4>
                    <p className="text-gray-500 text-xs mt-2 max-w-xs">Precisamos de 5 a 10 fotos nítidas do seu rosto para o treinamento perfeito.</p>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-8">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                          <Image src={URL.createObjectURL(file)} alt={`Preview ${index}`} fill className="object-cover" />
                          <button onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-8">
                  <h3 className="text-lg font-bold mb-6 font-display uppercase tracking-widest border-b border-white/5 pb-4">Resumo do Pedido</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-xs"><span className="text-gray-500 uppercase tracking-widest">Pacote</span><span className="font-bold text-white uppercase">{selectedPackage || 'Não selecionado'}</span></div>
                    <div className="flex justify-between items-center text-xs"><span className="text-gray-500 uppercase tracking-widest">Estilos</span><span className={`font-bold ${selectedStyles.length === getStyleLimit() ? 'text-studio-gold' : 'text-white'}`}>{selectedStyles.length}/{getStyleLimit()}</span></div>
                    <div className="flex justify-between items-center text-xs"><span className="text-gray-500 uppercase tracking-widest">Fotos Env.</span><span className={`font-bold ${selectedFiles.length >= 5 ? 'text-emerald-400' : 'text-red-500'}`}>{selectedFiles.length}/10</span></div>
                  </div>
                  <button onClick={handleSendToProduction} disabled={isUploading} className="w-full py-4 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest hover:bg-studio-gold-light transition-all disabled:opacity-50 rounded-lg shadow-xl shadow-studio-gold/10">
                    {isUploading ? 'A enviar...' : 'Enviar para Produção'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="perfil" className="max-w-4xl px-8">
            <header className="mb-10"><h2 className="text-3xl font-bold font-display uppercase tracking-wider">O Meu Perfil</h2><p className="text-gray-500 mt-2">Gira as suas informações e a segurança da conta.</p></header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="w-full h-full rounded-full bg-studio-gold/10 flex items-center justify-center overflow-hidden border-2 border-studio-gold/30">
                      {avatarUrl ? <Image src={avatarUrl} alt="Avatar" fill className="object-cover" /> : <User size={64} className="text-studio-gold opacity-50" />}
                    </div>
                    <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 w-10 h-10 bg-studio-gold text-studio-black rounded-full flex items-center justify-center border-4 border-[#121212] hover:scale-110 transition-transform"><Camera size={18} /></button>
                    <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                  <h3 className="font-bold text-lg font-display uppercase tracking-widest">{userEmail?.split('@')[0]}</h3><p className="text-gray-500 text-xs truncate mt-1">{userEmail}</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-6">
                <form onSubmit={handleUpdatePassword} className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                  <h3 className="text-lg font-bold font-display uppercase tracking-widest mb-6 flex items-center gap-3"><Zap size={18} className="text-studio-gold" /> Segurança da Conta</h3>
                  <div className="space-y-6">
                    <div><label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">Nova Senha</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-studio-gold transition-colors rounded-lg" /></div>
                    <div><label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">Confirmar Nova Senha</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-studio-gold transition-colors rounded-lg" /></div>
                    <button type="submit" disabled={isUpdatingProfile || !newPassword} className="w-full py-4 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest hover:bg-studio-gold-light transition-all disabled:opacity-50 rounded-lg shadow-xl shadow-studio-gold/10 flex items-center justify-center gap-2">
                      {isUpdatingProfile ? <div className="w-5 h-5 border-2 border-studio-black border-t-transparent rounded-full animate-spin"></div> : <><CheckCheck size={18} /> Atualizar Senha</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-studio-black/90 backdrop-blur-2xl border-t border-white/5 z-[100] flex items-center justify-around px-2 md:hidden">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'ensaios', icon: Library, label: 'Ensaios' },
          { id: 'novo', icon: PlusCircle, label: 'Novo', primary: true },
          { id: 'mensagens', icon: MessageSquare, label: 'Chat' },
          { id: 'perfil', icon: User, label: 'Perfil' },
        ].map((item) => (
          <button key={item.id} onClick={() => changeTab(item.id as any)} className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${item.primary ? 'w-14 h-14 -mt-10 bg-studio-gold text-studio-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]' : activeTab === item.id ? 'text-studio-gold' : 'text-gray-500'}`}>
            <item.icon size={item.primary ? 28 : 22} strokeWidth={item.primary ? 3 : 2} />{!item.primary && <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}