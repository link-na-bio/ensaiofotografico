'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Camera, Home, Library, PlusCircle, User, CloudUpload, Check, CheckCheck,
  Archive, X, Send, Sparkles, Heart, LogOut, Clock, LayoutGrid, CheckCircle2,
  ChevronRight, ChevronLeft, Info, Eye, Download, Zap, MessageSquare, FileImage, Loader2, FileText, Paperclip, Lock, Bot, Search, MessageCircle, Palette, ShoppingBag, QrCode, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { galleryData } from '@/app/galeria/data';

declare global { interface Window { JSZip: any; } }

const EVENTO_SAZONAL = {
  ativo: true, // LIGA O BANNER DE NOVO
  id: 'sazonal',
  titulo: 'Especial Dia das Mães 🌹',
  descricao: 'Surpreenda com uma foto perfeita! 1 Estilo Temático em altíssima resolução.',
  preco: 19.90,
  estilos: '1 Estilo Temático',
  nomeDoEstilo: 'Mãe VIP' // O nome do estilo que acabou de criar no painel
};

export default function Dashboard() {
  const router = useRouter();

  // Forçar renderização puramente client-side
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Memória de Aba (Não perde ao dar F5)
  const [activeTab, setActiveTab] = useState<'home' | 'ensaios' | 'novo' | 'perfil' | 'mensagens'>('home');
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);

  // Filtro de Categoria
  const [categoryFilter, setCategoryFilter] = useState<string>('Estúdio');

  const [showMaesCollection, setShowMaesCollection] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [reaproveitarFotos, setReaproveitarFotos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const stylesScrollRef = useRef<HTMLDivElement>(null);
  const maesScrollRef = useRef<HTMLDivElement>(null);
  const maesEsteiraScrollRef = useRef<HTMLDivElement>(null);

  const scrollStyles = (direction: 'left' | 'right') => {
    if (stylesScrollRef.current) {
      const scrollAmount = 300;
      stylesScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollMaesEsteira = (direction: 'left' | 'right') => {
    if (maesEsteiraScrollRef.current) {
      const scrollAmount = 300;
      maesEsteiraScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
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
  const [isRestricted, setIsRestricted] = useState(false);
  const [dynamicPrices, setDynamicPrices] = useState<any>(null);
  const [isMaintenanceGlobal, setIsMaintenanceGlobal] = useState(false);

  const fetchDbStyles = async () => {
    const { data, error } = await supabase.from('estilos').select('*').order('criado_em', { ascending: false });
    if (data) setDbStyles(data.filter(s => s.ativo !== false));
  };

  // Estados de Prévia e Galeria
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFilesMetadata, setPreviewFilesMetadata] = useState<{ name: string, url: string }[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // NOVOS ESTADOS PARA GALERIA
  const [selectedEnsaioForGallery, setSelectedEnsaioForGallery] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [fotosExtras, setFotosExtras] = useState<{ name: string, url: string }[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [isFetchingGallery, setIsFetchingGallery] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<string | null>(null);
  const [pendingSubOrder, setPendingSubOrder] = useState<any>(null);

  // Estados do Chat
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'mensagens' && userId) {
      setHasUnreadMessages(false);
      localStorage.setItem(`client_last_message_seen_${userId}`, new Date().toISOString());
    }
  }, [activeTab, userId, messages]);

  useEffect(() => {
    if (!userId || pedidos.length === 0) return;
    setHasUnreadMessages(pedidos.some(p => p.unread_messages));
  }, [userId, pedidos]);

  // FILTRO DE OURO: Oculta sub-pedidos de extras da tela principal
  const pedidosParaExibir = pedidos.filter(p => !p.pacote?.toLowerCase().includes('fotos_extras'));

  useEffect(() => {
    if (!userId || pedidos.length === 0) return;
    const lastSeen = localStorage.getItem(`client_last_message_seen_${userId}`) || '2000-01-01T00:00:00.000Z';
    const orderIds = pedidos.map(p => p.id);

    const checkUnread = async () => {
      const { data } = await supabase.from('mensagens')
        .select('id').in('order_id', orderIds)
        .gt('criado_em', lastSeen).neq('user_id', userId).limit(1);
      if (data && data.length > 0) setHasUnreadMessages(true);
    };
    checkUnread();

    const channel = supabase.channel(`client_unread_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, (payload) => {
        if (orderIds.includes(payload.new.order_id) && payload.new.user_id !== userId) {
          setHasUnreadMessages(true);
          playMessageBeep();
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, pedidos]);

  useEffect(() => {
    const savedTab = sessionStorage.getItem('activeTab');
    const savedOrderChat = sessionStorage.getItem('chatOrderId');
    if (savedTab) setActiveTab(savedTab as any);
    if (savedOrderChat) setChatOrderId(savedOrderChat);
  }, []);

  const changeTab = (tab: 'home' | 'ensaios' | 'novo' | 'perfil' | 'mensagens') => {
    if (tab === 'novo' && (isRestricted || isMaintenanceGlobal)) {
      alert(isMaintenanceGlobal ? "O sistema está em modo de manutenção." : "Acesso bloqueado, consulte o suporte.");
      return;
    }
    setActiveTab(tab);
    sessionStorage.setItem('activeTab', tab);
  };

  const changeChatOrder = (id: string | null) => {
    setChatOrderId(id);
    if (id) sessionStorage.setItem('chatOrderId', id);
    else sessionStorage.removeItem('chatOrderId');
  };

  const fetchPedidos = async (uid: string) => {
    try {
      const { data, error } = await supabase.from('pedidos').select('*').eq('user_id', uid).order('criado_em', { ascending: false });
      if (error) throw error;
      setPedidos(data || []);
    } catch (error) { console.error('Erro ao buscar pedidos:', error); }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else if (session.user.email === 'brunomeueditor@gmail.com') {
        router.push('/admin/orders');
      } else {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || null);
        setIsLoading(false);
        fetchPedidos(session.user.id);
        fetchDbStyles();

        if (session.user.email) {
          const { data } = await supabase.from('usuarios_restritos').select('email').eq('email', session.user.email).maybeSingle();
          if (data) {
            setIsRestricted(true);
            if (sessionStorage.getItem('activeTab') === 'novo') {
              setActiveTab('home');
              sessionStorage.setItem('activeTab', 'home');
            }
          }
        }

        const { data: configData } = await supabase.from('plataforma_config').select('*').eq('id', 1).single();
        if (configData) {
          setDynamicPrices(configData);
          setIsMaintenanceGlobal(configData.manutencao);
        }
      }
    };
    checkUser();

    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [router]);

  // Listener de Pedidos e Configurações
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

    const configChannel = supabase
      .channel('plataforma_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plataforma_config', filter: 'id=eq.1' }, (payload) => {
        if (payload.new) {
          setDynamicPrices(payload.new as any);
          setIsMaintenanceGlobal((payload.new as any).manutencao);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(configChannel);
    };
  }, [userId]);

  // ===== FILTROS DE SEGURANÇA MATEMÁTICA (Corrigem o Ecrã Branco) =====
  const parsePrice = (val: any, fallback: number) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'number') return val;
    // Transforma "R$ 19,90" em "19.90" e converte para número em segurança
    const strVal = String(val).replace(',', '.').replace(/[^0-9.-]/g, '');
    const num = parseFloat(strVal);
    return isNaN(num) ? fallback : num;
  };

  const getPrecoUnitario = (qtd: number) => {
    const pBase = parsePrice(dynamicPrices?.preco_amostra, 19.90);
    const pEssencial = parsePrice(dynamicPrices?.preco_essencial, 67.90) / 5;
    const pPremium = parsePrice(dynamicPrices?.preco_premium, 97.90) / 10;
    const pElite = parsePrice(dynamicPrices?.preco_elite, 147.90) / 20;

    if (qtd >= 20) return pElite;
    if (qtd >= 10) return pPremium;
    if (qtd >= 5) return pEssencial;
    return pBase;
  };

  const calcularTotalPrevia = () => {
    const qtdSelecionada = selectedPreviews.length;
    if (qtdSelecionada === 0) return { total: 0 };

    const getPreco = (qtd: number) => {
      const pBase = parsePrice(dynamicPrices?.preco_amostra, 19.90);
      const pEssencial = parsePrice(dynamicPrices?.preco_essencial, 67.90) / 5;
      const pPremium = parsePrice(dynamicPrices?.preco_premium, 97.90) / 10;
      const pElite = parsePrice(dynamicPrices?.preco_elite, 147.90) / 20;

      if (qtd >= 20) return qtd * pElite;
      if (qtd >= 10) return qtd * pPremium;
      if (qtd >= 5) return qtd * pEssencial;
      return qtd * pBase;
    };

    return { total: getPreco(qtdSelecionada) };
  };

  const calculateCurrentTotal = () => {
    const hasSobMedida = selectedStyles.includes('ESTILO_SOBMEDIDA');
    const estilosNormais = selectedStyles.filter(s => s !== 'ESTILO_SOBMEDIDA');
    const qtdNormais = estilosNormais.length;

    const valorNormais = qtdNormais * getPrecoUnitario(qtdNormais);
    const valorSobMedida = hasSobMedida ? 69.90 : 0;

    return valorNormais + valorSobMedida;
  };

  const currentTotal = calculateCurrentTotal();

  const getDynamicPackageName = (qtd: number) => {
    if (qtd >= 20) return 'dinamico_elite';
    if (qtd >= 10) return 'dinamico_premium';
    if (qtd >= 5) return 'dinamico_essencial';
    return 'dinamico_avulso';
  };

  const getDisplayPackageName = (qtd: number) => {
    if (qtd >= 20) return 'Pack Elite';
    if (qtd >= 10) return 'Pack Premium';
    if (qtd >= 5) return 'Pack Essencial';
    if (qtd > 0) return 'Avulso';
    return 'Não selecionado';
  };
  // ====================================================================

  // ===== SISTEMA DE NOTIFICAÇÃO SONORA (BEEP VIA CÓDIGO) =====
  const playMessageBeep = () => {
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Som de notificação elegante (Sine wave a 880Hz)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

        // Envelope: Volume sobe rápido e desce suavemente (evita estalos)
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.05); // Pico de volume (100%)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); // Decay suave

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.warn("Erro ao gerar beep sonoro:", e);
      }
    }
  };
  // ===============================================

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

        if (payload.new.user_id !== userId) {
          playMessageBeep();
        }
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

  const handleWhatsAppSupport = () => {
    const phoneNumber = '556193314473';
    const text = `Olá suporte! Sou o cliente ${userEmail} e estou no meu painel do Virtual Studio. Preciso de ajuda.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };


  const toggleStyle = (style: string) => { if (selectedStyles.includes(style)) { setSelectedStyles(selectedStyles.filter(s => s !== style)); } else { setSelectedStyles([...selectedStyles, style]); } };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) { const newFiles = Array.from(e.target.files); setSelectedFiles([...selectedFiles, ...newFiles].slice(0, 10)); } };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); if (e.dataTransfer.files) { const newFiles = Array.from(e.dataTransfer.files); setSelectedFiles([...selectedFiles, ...newFiles].slice(0, 10)); } };
  const removeFile = (index: number) => { setSelectedFiles(prev => prev.filter((_, i) => i !== index)); };

  const handleSendToProduction = async () => {
    if (isRestricted || isMaintenanceGlobal) {
      alert(isMaintenanceGlobal ? "Sistema em manutenção, não é possível criar pedidos temporariamente." : "Operação bloqueada. A sua conta está suspensa para novos pedidos.");
      return;
    }

    // A validação agora foca-se em ter pelo menos 1 estilo e 5 fotos (ou se optar por reaproveitar as fotos).
    if (selectedStyles.length === 0 || (!reaproveitarFotos && selectedFiles.length < 5)) {
      alert("Por favor, escolha pelo menos 1 estilo e envie no mínimo 5 fotos.");
      return;
    }

    setIsUploading(true);
    try {
      // Define o nome dinâmico baseado na quantidade (Retrocompatibilidade)
      const getDynamicPackageName = (qtd: number) => {
        if (qtd >= 20) return 'dinamico_elite';
        if (qtd >= 10) return 'dinamico_premium';
        if (qtd >= 5) return 'dinamico_essencial';
        return 'dinamico_avulso';
      };

      // O Pacote Sazonal também é salvo com prefixo especial
      const isSazonal = selectedStyles.includes('Páscoa VIP') || selectedStyles.includes('Mãe VIP') || selectedStyles.includes('ESTILO_SOBMEDIDA');
      const finalPackageName = isSazonal ? 'sazonal' : getDynamicPackageName(selectedStyles.length);

      const { data: orderData, error: dbError } = await supabase.from('pedidos').insert({
        user_id: userId,
        user_email: userEmail,
        pacote: finalPackageName,
        estilos: selectedStyles,
        status: 'Aguardando Produção',
        ...(reaproveitarFotos ? { observacoes: "♻️ CLIENTE RECORRENTE: Utilizar selfies/modelo do pedido anterior." } : {})
      }).select().single();

      if (dbError) throw dbError;
      const orderId = orderData.id;

      const discordWebhookUrl = 'https://discord.com/api/webhooks/1492131248091435170/l4cqtcHnLulXpEDka8bsSon81D2_8OY5e5vP3kxlbI6UcIb5KOSIHmhwivBqPsDmuHdU';
      const shortId = orderData.id.split('-')[0].toUpperCase();
      const qtdFotos = orderData.estilos?.length || orderData.fotos_selecionadas?.length || selectedStyles.length;

      const estilosFormatados = selectedStyles.join(', ');
      const mensagemDiscord = `@everyone 🚨 **NOVO PEDIDO VIP NA ÁREA!** 🚨\n\n🆔 **ID do Pedido:** #${shortId}\n👤 **Cliente:** ${userEmail}\n📦 **Pacote:** ${finalPackageName || 'Estilos Selecionados'}\n🎨 **Estilos Escolhidos:** ${estilosFormatados}\n📸 **Quantidade:** ${qtdFotos} foto(s)\n💳 **Status:** ${orderData.status || 'Aguardando Produção'}\n\n⚡ Acesse o painel para acompanhar!`;
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: mensagemDiscord })
        });
      } catch (e) {
        console.error("Falha ao notificar o Discord", e);
      }

      // Loop de Upload com HIGIENIZAÇÃO DO NOME DO FICHEIRO
      if (!reaproveitarFotos) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          // Cria um nome 100% seguro: timestamp + código aleatório + extensão
          const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${userId}/${orderId}/${safeFileName}`;

          const { error: storageError } = await supabase.storage.from('fotos_clientes').upload(filePath, file);
          if (storageError) throw storageError;
        }
      }

      setAlertMessage("Pedido enviado com sucesso!");
      setShowSuccessAlert(true);
      changeTab('home');
      setSelectedStyles([]);
      setSelectedFiles([]);
      fetchPedidos(userId!);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error: any) {
      alert(`Falha no envio: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
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
    setSelectedPreviews([]);
    try {
      const path = `${userId}/${orderId}/`;
      const { data: files, error } = await supabase.storage.from('previa_ensaios').list(path);
      if (error) throw error;
      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) { alert("Nenhuma prévia encontrada."); return; }

      const fileData = await Promise.all(validFiles.map(async (file) => {
        const { data, error } = await supabase.storage.from('previa_ensaios').createSignedUrl(`${path}${file.name}`, 3600);
        if (error) throw error;
        return { name: file.name, url: data.signedUrl };
      }));

      setPreviewFilesMetadata(fileData);
      setSelectedOrderId(orderId);

      const { data: pedido } = await supabase.from('pedidos').select('fotos_selecionadas').eq('id', orderId).single();
      if (pedido?.fotos_selecionadas) {
        setSelectedPreviews(pedido.fotos_selecionadas);
      }

      setIsPreviewOpen(true);
    } catch (error: any) { alert("Erro ao carregar prévia: " + error.message); } finally { setIsFetchingPreview(false); }
  };

  const getSelectionLimit = (pedido: any) => {
    if (!pedido) return 0;
    const pkg = pedido.pacote?.toLowerCase();

    // NOVA REGRA (À La Carte): 1 Estilo = 1 Foto
    if (pkg?.includes('dinamico_')) {
      return pedido.estilos?.length || 1;
    }

    // REGRA LEGADO (Para não quebrar os pedidos antigos)
    if (pkg?.includes('amostra')) return 1;
    if (pkg?.includes('essencial')) return 10;
    if (pkg?.includes('premium')) return 25;
    if (pkg?.includes('elite')) return 50;
    if (pkg?.includes('sazonal')) return 1;

    return 0;
  };

  const togglePhotoSelection = (fileName: string) => {
    if (selectedPreviews.includes(fileName)) {
      setSelectedPreviews(prev => prev.filter(name => name !== fileName));
    } else {
      setSelectedPreviews(prev => [...prev, fileName]);
    }
  };

  const salvarEIrParaPagamento = async () => {
    if (!selectedOrderId || selectedPreviews.length === 0) return;

    setIsFetchingPreview(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          fotos_selecionadas: selectedPreviews,
          status: 'Aguardando Pagamento'
        })
        .eq('id', selectedOrderId);

      if (error) throw error;

      setIsPreviewOpen(false);
      router.push(`/checkout?orderId=${selectedOrderId}`);
    } catch (error: any) {
      alert("Erro ao salvar seleção: " + error.message);
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleViewGallery = async (orderId: string) => {
    setIsFetchingGallery(true);
    setSelectedEnsaioForGallery(orderId);
    setFotosExtras([]);
    setSelectedExtras([]);
    setPendingSubOrder(null); // Reset pending order

    try {
      // 1. Buscar todos os pedidos do utilizador para agregar fotos já pagas
      const { data: todosOsPedidos, error: listError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', userId);

      if (listError) throw listError;

      const currentOrder = todosOsPedidos?.find(p => p.id === orderId);
      if (!currentOrder) throw new Error("Pedido não encontrado.");

      // 2. Determinar o ID Raiz (para o Storage)
      const rootOrderId = orderId;

      // 3. Coletar todas as fotos compradas (do pedido raiz e de extras já pagos)
      let fotosCompradasTotal: string[] = [];
      let pendingUpsell: any = null;

      const ordersInSession = todosOsPedidos?.filter(p => {
        const pId = p.id?.toLowerCase();
        const rId = rootOrderId?.toLowerCase();
        const pkg = p.pacote?.toLowerCase() || '';
        const obs = p.observacoes?.toLowerCase() || '';

        return pId === rId || pkg.includes(`|${rId}`) || obs === rId;
      }) || [];

      ordersInSession.forEach(p => {
        const s = p.status;
        // Lógica de Liberação: Finalizado, Concluído, Em Análise (para extras) ou Prévia Disponível (para o original)
        const isReleased = s === 'Ensaio Concluído' || s === 'Finalizado' || s === 'Pagamento em Análise' || s === 'Prévia Disponível';

        if (isReleased) {
          if (p.id === rootOrderId) {
            // Do pedido raiz, pegamos o que foi selecionado inicialmente
            fotosCompradasTotal = [...fotosCompradasTotal, ...(p.fotos_selecionadas || [])];
          } else if (p.pacote?.toLowerCase().includes('fotos_extras')) {
            // De pedidos de extras pagos, pegamos os "estilos" (que são os nomes das fotos)
            fotosCompradasTotal = [...fotosCompradasTotal, ...(p.estilos || [])];
          }
        } else if (s === 'Aguardando Pagamento' && p.pacote?.toLowerCase().includes('fotos_extras')) {
          // Detecta se existe algum upsell pendente para mostrar o banner
          pendingUpsell = p;
        }
      });

      // Se existir um pendente, salvamos no estado
      if (pendingUpsell) setPendingSubOrder(pendingUpsell);

      // Remove duplicatas
      fotosCompradasTotal = Array.from(new Set(fotosCompradasTotal));

      // 4. Buscar arquivos no Storage usando o rootOrderId
      const path = `${userId}/${rootOrderId}/`;
      const { data: files, error: storageError } = await supabase.storage.from('previa_ensaios').list(path);
      if (storageError) throw storageError;

      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) { alert("Nenhuma foto encontrada no servidor."); return; }

      // 5. Separar em FINAL (compradas + bônus) e EXTRAS (não compradas)
      const arquivosFinais = validFiles.filter(f => f.name.toLowerCase().includes('bonus_') || fotosCompradasTotal.some((sel: string) => f.name.includes(sel) || sel.includes(f.name)));
      const arquivosExtras = validFiles.filter(f => !f.name.toLowerCase().includes('bonus_') && !fotosCompradasTotal.some((sel: string) => f.name.includes(sel) || sel.includes(f.name)));

      const urlPromisesFinais = arquivosFinais.map(async (file) => {
        const { data, error } = await supabase.storage.from('previa_ensaios').createSignedUrl(`${path}${file.name}`, 3600);
        if (error) throw error; return data.signedUrl;
      });

      const urlPromisesExtras = arquivosExtras.map(async (file) => {
        const { data, error } = await supabase.storage.from('previa_ensaios').createSignedUrl(`${path}${file.name}`, 3600);
        if (error) throw error; return { name: file.name, url: data.signedUrl };
      });

      setGalleryPhotos(await Promise.all(urlPromisesFinais));
      setFotosExtras(await Promise.all(urlPromisesExtras));
    } catch (error: any) {
      alert("Erro ao carregar galeria: " + error.message);
    } finally {
      setIsFetchingGallery(false);
    }
  };

  const toggleExtraSelection = (fileName: string) => {
    if (selectedExtras.includes(fileName)) {
      setSelectedExtras(prev => prev.filter(name => name !== fileName));
    } else {
      setSelectedExtras(prev => [...prev, fileName]);
    }
  };

  const comprarFotosExtras = async () => {
    if (selectedExtras.length === 0) return;
    setIsUploading(true);
    try {
      // 1. Vincular o pedido de extras ao pedido pai para facilitar a liberação e localização dos arquivos
      const parentId = selectedEnsaioForGallery;

      const insertData: any = {
        user_id: userId,
        user_email: userEmail,
        pacote: `fotos_extras|${parentId}`,
        estilos: selectedExtras,
        status: 'Aguardando Pagamento'
      };

      // Tenta adicionar observacoes apenas se a coluna existir (evita erro de cache do schema)
      // Se der erro de coluna inexistente, o Supabase ignora se mandarmos apenas as colunas certas no insert final
      const { data: newOrder, error } = await supabase.from('pedidos').insert(insertData).select().single();

      if (error) throw error;

      const discordWebhookUrl = 'https://discord.com/api/webhooks/1492131248091435170/l4cqtcHnLulXpEDka8bsSon81D2_8OY5e5vP3kxlbI6UcIb5KOSIHmhwivBqPsDmuHdU';
      const shortId = newOrder.id.split('-')[0].toUpperCase();
      const qtdFotos = newOrder.estilos?.length || newOrder.fotos_selecionadas?.length || selectedExtras.length;

      const extrasFormatados = selectedExtras.map(e => e.split('.')[0]).join(', ');
      const mensagemDiscord = `@everyone 🚨 **NOVA COMPRA DE EXTRAS!** 🚨\n\n🆔 **ID do Pedido:** #${shortId}\n👤 **Cliente:** ${userEmail}\n📦 **Pacote:** Fotos Extras\n🎨 **Fotos Escolhidas:** ${extrasFormatados}\n📸 **Quantidade:** ${qtdFotos} foto(s)\n💳 **Status:** Aguardando Pagamento\n\n⚡ Acesse o painel para acompanhar!`;
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: mensagemDiscord })
        });
      } catch (e) {
        console.error("Falha ao notificar o Discord", e);
      }

      router.push(`/checkout?orderId=${newOrder.id}`);
    } catch (error: any) {
      alert("Erro ao gerar pedido extra: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSinglePhoto = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    } catch (e: any) {
      alert("Erro ao baixar foto: " + e.message);
    }
  };

  const handleDownloadFinal = async (orderId: string) => {
    setIsDownloading(orderId);
    try {
      const { data: pedido, error: dbError } = await supabase
        .from('pedidos')
        .select('fotos_selecionadas')
        .eq('id', orderId)
        .single();

      if (dbError) throw dbError;
      const selecionadas = pedido?.fotos_selecionadas || [];

      const path = `${userId}/${orderId}/`;
      const { data: files, error: storageError } = await supabase.storage.from('previa_ensaios').list(path);
      if (storageError) throw storageError;

      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) { alert("Ficheiros não encontrados no servidor."); return; }

      let arquivosFinais = validFiles;
      if (selecionadas.length > 0) {
        arquivosFinais = validFiles.filter(f => f.name.toLowerCase().includes('bonus_') || selecionadas.some((sel: string) => f.name.includes(sel) || sel.includes(f.name)));
        if (arquivosFinais.length === 0) {
          alert("Erro: As fotos selecionadas não puderam ser descarregadas. Contacte o suporte.");
          setIsDownloading(null);
          return;
        }
      }


      const urlPromises = arquivosFinais.map(async (file) => {
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

  const handleCloseGallery = () => {
    setSelectedEnsaioForGallery(null);
    setGalleryPhotos([]);
    setFotosExtras([]);
    setSelectedExtras([]);
  };

  if (!isMounted) return null;

  if (isLoading) return <div className="min-h-screen bg-studio-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div></div>;

  const renderActionButtons = (pedido: any) => {
    if (pedido.status === 'Prévia Disponível') {
      return (
        <button
          onClick={() => handleOpenPreview(pedido.id)}
          disabled={isFetchingPreview}
          className="relative z-50 w-full py-3 bg-studio-gold text-studio-black font-bold uppercase tracking-widest text-[10px] hover:bg-studio-gold-light transition-all flex items-center justify-center gap-2 group/btn cursor-pointer disabled:opacity-50 rounded-xl"
        >
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
      const isSelected = selectedEnsaioForGallery === pedido.id;
      return (
        <button
          onClick={() => handleViewGallery(pedido.id)}
          disabled={isFetchingGallery && selectedEnsaioForGallery === pedido.id}
          className={`relative z-50 w-full py-3 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer rounded-xl ${isSelected
            ? 'bg-studio-gold text-studio-black shadow-[0_0_15px_rgba(212,175,55,0.2)]'
            : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
        >
          {isFetchingGallery && selectedEnsaioForGallery === pedido.id ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Eye size={14} />
          )}
          {isSelected ? 'Visualizando Ensaio' : 'Visualizar Ensaio'}
        </button>
      );
    }
    return null;
  };

  const availableCategories = ['Todos', ...Array.from(new Set(dbStyles.map(s => s.categoria).filter(Boolean)))];

  const displayStyles = dbStyles.filter(s =>
    (categoryFilter === 'Todos' || s.categoria === categoryFilter)
  );

  const renderDiscountTip = () => {
    const qtd = selectedStyles.length;
    if (qtd === 0) return null;

    let msg = '';
    if (qtd < 5) msg = `DICA: ADICIONE MAIS ${5 - qtd} FOTO(S) PARA LIBERAR O DESCONTO DO PACK ESSENCIAL!`;
    else if (qtd < 10) msg = `🔥 DESCONTO ESSENCIAL ATIVO! ADICIONE MAIS ${10 - qtd} FOTO(S) PARA O DESCONTO PREMIUM!`;
    else if (qtd < 20) msg = `💎 DESCONTO PREMIUM ATIVO! ADICIONE MAIS ${20 - qtd} FOTO(S) PARA O DESCONTO MÁXIMO (ELITE)!`;
    else msg = `🏆 PARABÉNS! VOCÊ ATINGIU O DESCONTO MÁXIMO DA PLATAFORMA (PACK ELITE)!`;

    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 mb-6 rounded-lg flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-emerald-500" />
        <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">{msg}</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-studio-black text-white relative">

      {/* MODAL FOTO UNICA GALERIA */}
      <AnimatePresence>
        {selectedPhotoForModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="absolute top-6 right-6 z-[310]">
              <button
                onClick={() => setSelectedPhotoForModal(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all shadow-2xl"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={selectedPhotoForModal}
                alt="Foto em destaque"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-studio-gold/10"
              />
            </div>

            <div className="mt-8 w-full max-w-sm">
              <button
                onClick={() => handleDownloadSinglePhoto(selectedPhotoForModal!, `VIRTUAL_STUDIO_FOTO_${Date.now()}.jpg`)}
                className="w-full py-4 bg-studio-gold text-studio-black font-bold uppercase tracking-widest text-sm hover:bg-studio-gold-light transition-all rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
              >
                <Download size={20} /> Baixar Foto em Alta
              </button>
              <button
                onClick={() => setSelectedPhotoForModal(null)}
                className="w-full mt-4 py-3 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
              >
                Voltar à Galeria
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PREVIA COM MARCA D'AGUA */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-studio-black/50">
              <div>
                <h3 className="text-2xl font-display uppercase tracking-widest text-studio-gold font-bold">Curadoria de Fotos</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1 font-bold">
                  {(() => {
                    const pedido = pedidos.find(p => p.id === selectedOrderId);
                    let displayPacote = pedido?.pacote || '';
                    if (displayPacote.includes('dinamico_')) displayPacote = displayPacote.replace('dinamico_', 'À La Carte: ');
                    return `Selecionadas: ${selectedPreviews.length} (${displayPacote})`;
                  })()}
                </p>
                {/* MENSAGEM CHAMATIVA DE DESCONTO */}
                <div className="mt-2 flex items-center gap-2">
                  {selectedPreviews.length < 5 ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-studio-gold/10 border border-studio-gold/20 rounded text-[9px] font-black text-studio-gold uppercase tracking-widest animate-pulse">
                      <Sparkles size={10} /> Selecione {5 - selectedPreviews.length} mais para o DESCONTO de 5 fotos!
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                      <Zap size={10} /> {selectedPreviews.length >= 20 ? 'Desconto MÁXIMO (ELITE) Ativo!' : selectedPreviews.length >= 10 ? 'Desconto PREMIUM Ativo!' : 'Desconto ESSENCIAL Ativado!'}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="text-white hover:text-studio-gold transition-colors p-2 bg-white/5 rounded-full"><X size={24} /></button>
            </div>

            {(() => {
              const pedido = pedidos.find(p => p.id === selectedOrderId);
              const isLegacy = pedido && !pedido.pacote.includes('dinamico_') && !pedido.pacote.includes('sazonal');

              if (isLegacy) {
                return (
                  <div className="bg-studio-gold/10 border-l-4 border-studio-gold p-4 mb-4 mx-6 md:mx-10 mt-6 rounded-r-lg flex items-start gap-3">
                    <Info size={20} className="text-studio-gold shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-studio-gold font-bold text-xs uppercase tracking-widest mb-1">Benefício Exclusivo Garantido</h4>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        O Virtual Studio atualizou o seu modelo para vendas por unidade. No entanto, como iniciou o seu ensaio durante a nossa janela promocional, o seu pacote fechado de <strong>{getSelectionLimit(pedido)} fotos</strong> está 100% garantido! Conclua a sua seleção para aproveitar esta vantagem que já não está mais disponível para novos clientes.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#0a0a0a]">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {previewFilesMetadata.map((file, idx) => {
                    const isSelected = selectedPreviews.includes(file.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => togglePhotoSelection(file.name)}
                        className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-4 ${isSelected ? 'border-studio-gold ring-4 ring-studio-gold/20' : 'border-white/5 hover:border-studio-gold/30'}`}
                      >
                        <img
                          src={file.url}
                          alt={`Foto ${idx + 1}`}
                          className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'brightness-50 scale-105' : 'group-hover:scale-110'}`}
                          loading="lazy"
                        />

                        {/* Marca d'água robusta */}
                        <div className="absolute inset-0 z-10 pointer-events-none opacity-30 mix-blend-screen overflow-hidden" style={{ backgroundImage: `url("/FOTO PROTEGIDA - NÃO TIRE PRINT.png")`, backgroundRepeat: 'repeat', backgroundSize: '150px' }}></div>

                        {/* Overlay de Seleção */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-4 right-4 z-20"
                          >
                            <CheckCircle2 size={32} className="text-studio-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                          </motion.div>
                        )}

                        <div className="absolute bottom-3 left-3 z-20">
                          <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-tighter border border-white/10">
                            #{file.name.slice(-8)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BARRA FLUTUANTE DE CONFIRMAÇÃO (STICKY BOTTOM BAR) */}
            {selectedPreviews.length > 0 && (
              <div className="fixed bottom-0 left-0 w-full md:left-64 md:w-[calc(100%-16rem)] bg-[#121212]/95 backdrop-blur-md border-t border-studio-gold/30 p-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 z-50">
                <div className="text-center md:text-left">
                  <p className="text-white font-bold text-sm md:text-lg">{selectedPreviews.length} Foto(s) Selecionada(s)</p>
                  <p className="text-gray-400 text-[10px] md:text-xs">O pedido original era de {pedidos.find(p => p.id === selectedOrderId)?.estilos?.length || 1} foto(s).</p>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 border-t border-white/5 md:border-none pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] md:text-xs text-studio-gold uppercase tracking-widest font-bold">Total a Pagar</p>
                    <p className="text-xl md:text-2xl font-display text-white">R$ {calcularTotalPrevia().total.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <button
                    onClick={salvarEIrParaPagamento}
                    disabled={isFetchingPreview}
                    className="bg-studio-gold text-black px-6 md:px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-studio-gold-light transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs md:text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    {isFetchingPreview ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Confirmar e Pagar</>}
                  </button>
                </div>
              </div>
            )}
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

      {/* SIDEBAR ESQUERDA */}
      <aside className="w-64 border-r border-white/5 bg-studio-black flex flex-col sticky top-0 h-screen hidden md:flex shrink-0">
        <div className="p-8 flex flex-col items-center text-center border-b border-white/5 mb-4">
          <div className="flex flex-col items-center">
            <div className="relative w-[150px] h-[150px] -mt-[40px] -mb-[60px] flex items-center justify-center pointer-events-none">
              <Image src="/logo.2.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
            </div>
            <div className="h-[1px] w-2/3 bg-gradient-to-r from-transparent via-studio-gold/50 to-transparent mt-2 mb-1"></div>
            <p className="text-studio-gold text-[20px] uppercase tracking-widest">Área VIP</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <button onClick={() => changeTab('home')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'home' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><Home size={18} /><span className="text-sm font-medium">Home</span></button>
          <button onClick={() => changeTab('ensaios')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'ensaios' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><Library size={18} /><span className="text-sm font-medium">Os Meus Ensaios</span></button>
          <button onClick={() => changeTab('novo')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'novo' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><PlusCircle size={18} /><span className="text-sm font-semibold">Novo Pedido</span></button>
          <button onClick={() => changeTab('mensagens')} className={`relative flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'mensagens' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><MessageSquare size={18} /><span className="text-sm font-medium">Mensagens</span>{hasUnreadMessages && <span className="absolute right-4 size-2 bg-studio-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]"></span>}</button>
          <button onClick={() => changeTab('perfil')} className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'perfil' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}><User size={18} /><span className="text-sm font-medium">Perfil</span></button>
        </nav>
        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
              <img
                src={avatarUrl?.startsWith('http') ? avatarUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
                alt="Perfil"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate font-display tracking-widest text-white">{userEmail ? userEmail.split('@')[0] : 'Utilizador'}</p>
            </div>
            <div className="relative flex gap-2">
              <button onClick={handleLogout} title="Sair da conta"><LogOut className="text-red-500 cursor-pointer hover:text-red-400 transition-colors" size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-[#121212] pt-20 pb-24 md:pt-8 md:pb-8 relative">
        <header className="fixed top-0 left-0 right-0 h-16 bg-studio-black/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2"><div className="relative w-40 h-[60px]"><Image src="/logo.2.png" alt="Logo" fill className="object-contain object-left" priority /></div><h1 className="text-white text-xs font-bold font-display tracking-widest leading-none hidden sm:block">VIRTUAL STUDIO</h1></div>
          <button onClick={handleLogout} className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-500"><LogOut size={16} /></button>
        </header>

        {/* ----------------- ABA HOME ----------------- */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="home" className="px-8">
            <header className="mb-10"><h2 className="text-3xl font-bold font-display uppercase tracking-wider">Bem-vindo(a) ao Virtual Studio, <span className="text-studio-gold">{userEmail?.split('@')[0]}</span></h2><p className="text-gray-500 mt-2">A sua jornada para a imagem profissional perfeita começa aqui.</p></header>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Clock className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidosParaExibir.filter(p => p.status === 'Aguardando Produção').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Aguardando</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Bot className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidosParaExibir.filter(p => p.status === 'Em Produção').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Em Produção</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Eye className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidosParaExibir.filter(p => p.status === 'Prévia Disponível').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Prévia Disponível</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><CheckCircle2 className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidosParaExibir.filter(p => p.status === 'Ensaio Concluído' || p.status === 'Finalizado').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Concluídos</p></div>
            </div>
            {pedidos.length > 0 && (
              <section className="mb-12">
                <h3 className="text-lg font-bold font-display uppercase tracking-widest mb-6 flex items-center gap-3"><Clock size={18} className="text-studio-gold" /> Pedidos Recentes</h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-3 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Pacote</th>
                        <th className="px-3 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Data</th>
                        <th className="px-3 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Status</th>
                        <th className="px-3 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px] text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pedidosParaExibir.slice(0, 3).map((pedido) => (
                        <tr key={pedido.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-3 py-4 font-bold uppercase tracking-widest text-xs text-studio-gold">
                            {pedido.pacote}
                          </td>
                          <td className="px-3 py-4 text-gray-500 text-xs">{formatDate(pedido.criado_em)}</td>
                          <td className="px-3 py-4">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-normal border whitespace-nowrap ${(pedido.status === 'Ensaio Concluído' || pedido.status === 'Finalizado') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              (pedido.status === 'Pagamento em Análise') ? 'bg-blue-900/20 text-blue-400 border-blue-400/30' :
                                (pedido.status === 'Prévia Disponível') ? 'bg-studio-gold/10 text-studio-gold border-studio-gold/20' :
                                  'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              }`}>
                              {pedido.status === 'Finalizado' ? 'Ensaio Concluído' : pedido.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <button
                              onClick={() => {
                                if (pedido.status === 'Prévia Disponível') handleOpenPreview(pedido.id);
                                else if (pedido.status === 'Ensaio Concluído' || pedido.status === 'Finalizado') {
                                  changeTab('ensaios');
                                  handleViewGallery(pedido.id);
                                }
                              }}
                              className="text-studio-gold hover:text-white transition-colors p-2"
                            >
                              <ChevronRight size={18} />
                            </button>
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

        {/* ----------------- ABA ENSAIOS / GALERIA ----------------- */}
        {activeTab === 'ensaios' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="ensaios" className="px-8">
            <header className="mb-8 flex justify-between items-center">
              <h2 className="text-3xl font-bold font-display uppercase tracking-wider">Os Meus Ensaios</h2>
              {selectedEnsaioForGallery && (
                <button
                  onClick={handleCloseGallery}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <X size={14} /> Fechar Galeria
                </button>
              )}
            </header>

            {pedidos.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-studio-gold/10 text-studio-gold flex items-center justify-center mb-6"><Archive size={32} /></div>
                <h3 className="text-xl font-bold font-display uppercase tracking-widest">Ainda não possui ensaios</h3>
                <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Inicie um novo pedido para começar a transformar as suas fotos com a nossa tecnologia.</p>
                <button onClick={() => changeTab('novo')} className="mt-8 px-8 py-3 bg-studio-gold text-studio-black font-bold uppercase tracking-widest hover:bg-studio-gold-light transition-all flex items-center gap-2"><PlusCircle size={18} /> Novo Pedido</button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* LISTA DE ENSAIOS */}
                <div className={selectedEnsaioForGallery ? "w-full lg:w-80 shrink-0" : "w-full"}>
                  <div className={selectedEnsaioForGallery ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                    {pedidosParaExibir.map((pedido) => (
                      <div key={pedido.id} className={`relative bg-white/5 border rounded-2xl overflow-hidden flex flex-col transition-all ${selectedEnsaioForGallery === pedido.id ? 'border-studio-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] bg-studio-gold/5' : (pedido.status === 'Ensaio Concluído' ? 'border-emerald-500/30' : 'border-white/10 hover:border-studio-gold/30')}`}>
                        <div className="p-6 flex-1 flex flex-col relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${(pedido.status === 'Ensaio Concluído') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              (pedido.status === 'Pagamento em Análise') ? 'bg-blue-900/20 text-blue-400 border-blue-400/30 animate-pulse' :
                                (pedido.status === 'Prévia Disponível') ? 'bg-studio-gold/10 text-studio-gold border-studio-gold/20' :
                                  'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              }`}>
                              {pedido.status === 'Finalizado' ? 'Ensaio Concluído' : pedido.status}
                            </span>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{formatDate(pedido.criado_em)}</span>
                          </div>

                          <h4 className="text-sm font-bold font-display uppercase tracking-widest text-studio-gold mb-2">
                            {pedido.pacote?.toLowerCase().startsWith('fotos_extras|')
                              ? 'Fotos Extras Adquiridas'
                              : pedido.pacote?.replace('dinamico_', 'Pack ')?.replace('_', ' ')?.toUpperCase() || 'Ensaio'}
                          </h4>

                          {!selectedEnsaioForGallery && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {(pedido.pacote?.toLowerCase().startsWith('fotos_extras|')
                                ? []
                                : (pedido.estilos || [])
                              ).map((estilo: string) => (
                                <span key={estilo} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase tracking-wider text-gray-400">
                                  {estilo}
                                </span>
                              ))}
                              {pedido.pacote?.toLowerCase().startsWith('fotos_extras|') && (
                                <span className="px-2 py-1 bg-studio-gold/10 border border-studio-gold/20 rounded text-[9px] uppercase tracking-wider text-studio-gold font-bold">
                                  {pedido.fotos_selecionadas?.length || 0} Foto(s) Liberada(s)
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-auto relative z-50">
                            {renderActionButtons(pedido)}
                          </div>
                        </div>

                        {!selectedEnsaioForGallery && (
                          <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-2 text-[8px] text-gray-500 uppercase tracking-widest font-bold"><Camera size={12} className="text-studio-gold" /> ID: {pedido.id.slice(0, 8)}</div>
                            <ChevronRight size={14} className="text-gray-600 group-hover:text-studio-gold group-hover:translate-x-1 transition-all" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* GALERIA DE FOTOS */}
                {selectedEnsaioForGallery && (
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
                    <div className="p-6 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                      <div>
                        <h3 className="font-display font-bold uppercase tracking-widest text-studio-gold flex items-center gap-2">
                          <LayoutGrid size={18} /> Galeria do Ensaio
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Pedido #{selectedEnsaioForGallery.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => handleDownloadFinal(selectedEnsaioForGallery)}
                          disabled={isDownloading === selectedEnsaioForGallery}
                          className="flex-1 md:flex-none px-6 py-2 bg-emerald-500 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isDownloading === selectedEnsaioForGallery ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                          Baixar Tudo (ZIP)
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto max-h-[70vh] custom-scrollbar bg-[#0a0a0a]">
                      {isFetchingGallery ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                          <Loader2 size={40} className="animate-spin text-studio-gold" />
                          <p className="text-xs uppercase tracking-widest font-bold">Gerando sua galeria...</p>
                        </div>
                      ) : (
                        <>
                          {/* Banner de Pagamento Pendente (Lógica de Ouro) */}
                          {pendingSubOrder && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-studio-gold/10 border border-studio-gold shadow-[0_0_20px_rgba(212,175,55,0.1)] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between mb-8 gap-6 group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-studio-gold text-studio-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                                  <QrCode size={24} />
                                </div>
                                <div className="text-center md:text-left">
                                  <h4 className="text-studio-gold font-bold font-display uppercase tracking-widest">Você tem fotos extras aguardando pagamento!</h4>
                                  <p className="text-xs text-gray-300 font-light mt-1">Conclua o seu PIX para liberar o download imediato destas fotos.</p>
                                </div>
                              </div>
                              <button
                                onClick={() => router.push(`/checkout?orderId=${pendingSubOrder.id}`)}
                                className="w-full md:w-auto bg-studio-gold text-black px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-studio-gold-light transition shadow-xl shrink-0 flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
                              >
                                Pagar Agora <ArrowRight size={16} />
                              </button>
                            </motion.div>
                          )}

                          {/* Banner de Escassez (Urgência) */}
                          {fotosExtras.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 mb-8">
                              <Clock className="text-red-500 animate-pulse shrink-0" size={24} />
                              <p className="text-red-400 text-xs md:text-sm font-medium leading-relaxed">
                                <span className="font-bold uppercase tracking-widest">⚠️ Atenção:</span> Suas prévias não adquiridas serão excluídas permanentemente em 15 dias para liberar espaço em nossos servidores. Garanta suas fotos favoritas antes que desapareçam!
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {galleryPhotos.map((url, idx) => (
                              <div key={idx} className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-white/5 border border-white/5 shadow-xl cursor-zoom-in">
                                <img
                                  src={url}
                                  alt={`Foto ${idx + 1}`}
                                  onClick={() => setSelectedPhotoForModal(url)}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center pointer-events-none md:pointer-events-auto">
                                  <button
                                    onClick={() => handleDownloadSinglePhoto(url, `VIRTUAL_STUDIO_${selectedEnsaioForGallery.slice(0, 8)}_${idx + 1}.jpg`)}
                                    className="w-12 h-12 bg-studio-gold text-studio-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)] pointer-events-auto"
                                    title="Baixar Foto"
                                  >
                                    <Download size={22} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {fotosExtras.length > 0 && (
                            <>
                              <h3 className="text-lg md:text-xl font-display text-studio-gold mt-12 mb-6 uppercase tracking-widest md:tracking-[0.2em] font-bold flex items-center gap-3">
                                <ShoppingBag size={20} /> Fotos Não Adquiridas (Compre Agora)
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-32 md:pb-20">
                                {fotosExtras.map((file, idx) => {
                                  const isSelected = selectedExtras.includes(file.name);
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => toggleExtraSelection(file.name)}
                                      className={`group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-4 ${isSelected ? 'border-studio-gold ring-4 ring-studio-gold/20' : 'border-white/5 hover:border-studio-gold/30'}`}
                                    >
                                      <img
                                        src={file.url}
                                        alt={`Extra ${idx + 1}`}
                                        className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'brightness-50 scale-105' : 'group-hover:scale-110'}`}
                                        loading="lazy"
                                      />
                                      {/* Marca d'água robusta (Igual à prévia) */}
                                      <div className="absolute inset-0 z-10 pointer-events-none opacity-30 mix-blend-screen overflow-hidden" style={{ backgroundImage: `url("/FOTO PROTEGIDA - NÃO TIRE PRINT.png")`, backgroundRepeat: 'repeat', backgroundSize: '150px' }}></div>

                                      {isSelected && (
                                        <div className="absolute top-4 right-4 z-20">
                                          <CheckCircle2 size={32} className="text-studio-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                                        </div>
                                      )}

                                      <div className="absolute bottom-3 left-3 z-20">
                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-tighter border border-white/10">
                                          R$ {parsePrice(dynamicPrices?.preco_amostra, 19.90).toFixed(2).replace('.', ',')}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {fotosExtras.length === 0 && !isFetchingGallery && (
                            <div className="mt-12 text-center p-8 bg-white/5 border border-dashed border-white/10 rounded-2xl opacity-40">
                              <CheckCheck size={32} className="mx-auto text-studio-gold mb-3" />
                              <p className="text-xs uppercase tracking-widest font-bold">Todas as fotos disponíveis foram adquiridas!</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* BARRA FLUTUANTE DE UPSELL EXTRA */}
                    {selectedExtras.length > 0 && (
                      <div className="fixed md:absolute bottom-[80px] md:bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-studio-gold/30 p-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 z-50">
                        <div className="text-center md:text-left">
                          <p className="text-white font-bold text-sm md:text-lg">{selectedExtras.length} Foto(s) Extra(s)</p>
                          <p className="text-gray-400 text-[10px] md:text-xs">Clique no botão para liberar as fotos em alta.</p>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 border-t border-white/5 md:border-none pt-4 md:pt-0">
                          <div className="text-left md:text-right">
                            <p className="text-[9px] md:text-xs text-studio-gold uppercase tracking-widest font-bold">Total Extra</p>
                            <p className="text-xl md:text-2xl font-display text-white">R$ {(selectedExtras.length * parsePrice(dynamicPrices?.preco_amostra, 19.90)).toFixed(2).replace('.', ',')}</p>
                          </div>
                          <button
                            onClick={comprarFotosExtras}
                            disabled={isUploading}
                            className="bg-studio-gold text-black px-6 md:px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-studio-gold-light transition flex items-center justify-center gap-2 text-xs md:text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                          >
                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Liberar Agora</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ----------------- ABA MENSAGENS ----------------- */}
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
                  {pedidosParaExibir.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">Nenhum pedido encontrado.</div>
                  ) : (
                    pedidosParaExibir.map(pedido => (
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

        {/* ----------------- ABA NOVO PEDIDO ----------------- */}
        {activeTab === 'novo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="novo" className="px-8 flex-1 flex flex-col">
            {isRestricted ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-rose-500/5 border border-dashed border-rose-500/20 rounded-2xl">
                <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6"><Lock size={40} /></div>
                <h3 className="text-2xl font-bold font-display uppercase tracking-widest text-rose-500 mb-3">Geração de Pedidos Suspensa</h3>
                <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                  A sua conta foi impedida temporariamente de realizar novos pedidos na plataforma. Se acredita tratar-se de um engano ou deseja regularizar a sua situação, entre em contacto via Suporte.
                </p>
                <button onClick={() => changeTab('mensagens')} className="mt-8 px-8 py-4 bg-[#121212] border border-white/10 text-white font-bold uppercase tracking-widest hover:border-white/30 transition-all flex items-center gap-3"><MessageSquare size={18} /> Falar com Suporte</button>
              </div>
            ) : (
              <>
                <header className="mb-8"><h2 className="text-2xl font-bold font-display uppercase tracking-widest">Configurar Novo Ensaio</h2><p className="text-gray-500">Personalize o seu pedido para obter o melhor resultado.</p></header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-12 pb-20">
                    <section>
                      <div className="flex justify-between items-end mb-4">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">1</span>
                          <h3 className="text-xl font-bold font-display uppercase tracking-widest">Monte o seu Ensaio (Escolha os Estilos)</h3>
                        </div>
                        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Selecionados: <span className="text-studio-gold">{selectedStyles.length} fotos</span></span>
                      </div>

                      {renderDiscountTip()}

                      <div className="mb-6 p-4 bg-studio-gold/5 border border-studio-gold/20 rounded-xl flex items-start gap-3">
                        <Info size={18} className="text-studio-gold shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-300 leading-relaxed font-light">
                          <strong className="text-studio-gold uppercase tracking-wider text-[10px] block mb-1">Dica: O Seu Combo Personalizado</strong>
                          Cada estilo selecionado equivale a <strong>1 Foto Final de Alta Resolução</strong>. A nossa IA aplicará o seu rosto mantendo a estética, a iluminação e o cenário exatos do estilo escolhido. Quanto mais estilos adicionar, maior será o seu desconto!
                        </p>
                      </div>

                      {/* BANNER SAZONAL / TEMÁTICO COMO ADD-TO-CART RÁPIDO */}
                      {EVENTO_SAZONAL.ativo && (
                        <div
                          onClick={() => {
                            setShowMaesCollection(prev => {
                              const show = !prev;
                              if (show) {
                                setTimeout(() => {
                                  maesScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                              }
                              return show;
                            });
                          }}
                          className="mb-8 w-full border-2 rounded-2xl p-6 relative overflow-hidden transition-all group cursor-pointer border-rose-500/30 hover:border-rose-500/80 bg-gradient-to-r from-rose-900/40 to-studio-black hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] opacity-100"
                        >
                          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-[0.2em] rounded-bl-xl shadow-lg z-20 animate-pulse">NOVIDADE</div>

                          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full">
                            <div className="flex items-center gap-5 flex-1">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 bg-rose-500/20 text-rose-400 border-rose-500/40 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white">
                                <Heart size={28} className="animate-heart-glow text-rose-500" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-lg md:text-xl font-black font-display uppercase tracking-widest text-white">{EVENTO_SAZONAL.titulo}</h4>
                                <p className="text-[10px] md:text-xs text-gray-300 mt-1 max-w-md leading-relaxed font-medium">{EVENTO_SAZONAL.descricao}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-0.5 bg-studio-gold/10 border border-studio-gold/20 rounded text-[8px] font-bold text-studio-gold uppercase tracking-wider">{EVENTO_SAZONAL.estilos}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end shrink-0">
                              <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-widest bg-rose-500 hover:bg-rose-600 px-6 py-3 rounded-xl shadow-lg transition-colors">
                                {showMaesCollection ? <><X size={18} /> Fechar</> : <><PlusCircle size={18} /> Ver Coleção</>}
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-studio-gold/5 blur-[80px] pointer-events-none opacity-50"></div>
                        </div>
                      )}

                      {/* ESTEIRA DE ALTA CONVERSÃO - DIA DAS MÃES */}
                      <AnimatePresence>
                        {showMaesCollection && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div ref={maesScrollRef} className="mb-12">
                              <div className="flex items-center gap-3 mb-6">
                                <Heart className="text-rose-500 animate-heart-glow" size={28} />
                                <div>
                                  <h3 className="text-2xl font-bold font-display uppercase tracking-widest text-white">Especial Dia das Mães</h3>
                                  <p className="text-gray-400 text-xs mt-1"></p>
                                </div>
                              </div>

                              <div className="relative group/esteira">
                                <button type="button" onClick={() => scrollMaesEsteira('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-12 h-12 bg-[#121212] border border-white/10 rounded-full flex items-center justify-center text-white hover:text-rose-500 hover:border-rose-500 transition-all shadow-xl opacity-0 group-hover/esteira:opacity-100 hidden md:flex"><ChevronLeft size={24} className="pr-[2px] pt-[1px]" /></button>

                                <div ref={maesEsteiraScrollRef} className="flex overflow-x-auto snap-x gap-6 pb-6 no-scrollbar scroll-smooth">
                                  {galleryData.filter(s => s.categoria === 'Especial Dia das Mães').map((style) => {
                                    const isSelected = selectedStyles.includes(style.titulo);
                                    return (
                                      <div key={style.id} onClick={() => toggleStyle(style.titulo)} className={`min-w-[240px] md:min-w-[280px] h-[360px] snap-start relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group/card ${isSelected ? 'border-rose-500 scale-[0.98] shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-white/10 hover:border-rose-500/50'}`}>
                                        <Image src={style.img_url} alt={style.titulo} fill className="object-cover transition-transform duration-700 group-hover/card:scale-110" unoptimized />

                                        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-5 transition-all ${isSelected ? 'bg-rose-500/10' : 'opacity-90'}`}>
                                          <div className="translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                                            <p className="text-sm font-bold uppercase tracking-widest text-white mb-2">{style.titulo}</p>

                                            <div className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all backdrop-blur-md border ${isSelected ? 'bg-rose-500 text-white border-rose-500' : 'bg-black/50 text-white border-white/20 group-hover/card:bg-rose-500/80 group-hover/card:border-rose-500'}`}>
                                              {isSelected ? <><CheckCircle2 size={16} /> Selecionado</> : <><PlusCircle size={16} /> Selecionar Estilo</>}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <button type="button" onClick={() => scrollMaesEsteira('right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-12 h-12 bg-[#121212] border border-white/10 rounded-full flex items-center justify-center text-white hover:text-rose-500 hover:border-rose-500 transition-all shadow-xl opacity-0 group-hover/esteira:opacity-100 hidden md:flex"><ChevronRight size={24} className="pl-[2px] pt-[1px]" /></button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="my-10 border-t border-white/5 opacity-50"></div>

                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative w-full sm:max-w-[320px]">
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



                      {/* CTA Serviço Sob Medida (Mobile) */}
                    </section>


                    <section>
                      <div className="flex items-center gap-4 mb-6"><span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">2</span><h3 className="text-xl font-bold font-display uppercase tracking-widest">Suas Fotos de Referência</h3></div>

                      {pedidos.length > 0 && (
                        <div
                          onClick={() => setReaproveitarFotos(!reaproveitarFotos)}
                          className={`mb-6 p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${reaproveitarFotos ? 'bg-studio-gold/10 border-studio-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-white/5 border-white/10 hover:border-studio-gold/30'}`}
                        >
                          <div className={`w-6 h-6 rounded flex items-center justify-center border ${reaproveitarFotos ? 'bg-studio-gold border-studio-gold text-studio-black' : 'border-white/20'}`}>
                            {reaproveitarFotos && <Check size={16} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">♻️ Quero reaproveitar as fotos/modelo do meu último ensaio</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Processamento em 1 clique. Mais rápido e sem necessidade de upload.</p>
                          </div>
                        </div>
                      )}

                      {!reaproveitarFotos && (
                        <>
                          <input type="file" multiple accept="image/jpeg, image/png, image/webp" hidden ref={fileInputRef} onChange={handleFileChange} />
                          <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center bg-white/5 hover:border-studio-gold/30 transition-all cursor-pointer group rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-studio-gold/5 text-studio-gold flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-studio-gold/10 transition-all"><CloudUpload size={32} /></div>
                            <h4 className="text-lg font-bold font-display uppercase tracking-widest">Arraste aqui as suas fotos</h4>
                            <p className="text-gray-500 text-xs mt-2 max-w-xs">Precisamos de 5 a 10 fotos nítidas do seu rosto para o treinamento perfeito.</p>
                          </div>
                        </>
                      )}
                      {!reaproveitarFotos && selectedFiles.length > 0 && (
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

                    {/* CTA Serviço Sob Medida (Mobile) */}
                    <div
                      onClick={() => toggleStyle('ESTILO_SOBMEDIDA')}
                      className={`mb-12 w-full border rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden text-left cursor-pointer lg:hidden ${selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'border-studio-gold bg-studio-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.3)]' : 'border-studio-gold/30 hover:border-studio-gold bg-[#121212]/80 backdrop-blur-sm shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]'}`}
                    >
                      <div className="absolute top-0 right-0 bg-studio-gold text-studio-black text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-bl-xl">PREMIUM</div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'bg-studio-gold text-studio-black border-studio-gold' : 'bg-studio-gold/10 text-studio-gold border-studio-gold/20 group-hover:scale-110'}`}>
                            <Palette size={20} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold font-display uppercase tracking-widest text-white group-hover:text-studio-gold transition-colors flex items-center gap-2">
                              Direção de Arte Sob Medida
                              {selectedStyles.includes('ESTILO_SOBMEDIDA') && <CheckCircle2 size={16} className="text-studio-gold animate-in zoom-in" />}
                              <span className="text-sm">💎</span>
                            </h4>
                            <p className="text-xs text-gray-400 mt-1 max-w-md leading-relaxed">Tem uma pose, roupa ou cenário específico em mente? Nossa equipe cria uma arte 100% exclusiva para você.</p>
                          </div>
                        </div>
                        <div className="shrink-0 bg-studio-gold/5 sm:bg-transparent p-4 sm:p-0 rounded-xl w-full sm:w-auto text-center sm:text-right border border-studio-gold/10 sm:border-none flex flex-col items-center sm:items-end gap-1">
                          <p className="text-2xl font-bold text-studio-gold tracking-wider">R$ 69,90</p>
                          <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-all ${selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'bg-studio-gold text-studio-black' : 'bg-white/5 text-gray-400 group-hover:bg-studio-gold group-hover:text-studio-black'}`}>
                            {selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'Selecionado' : 'Adicionar'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-8">
                      <h3 className="text-lg font-bold mb-6 font-display uppercase tracking-widest border-b border-white/5 pb-4">Resumo do Pedido</h3>
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-xs"><span className="text-gray-500 uppercase tracking-widest">Pacote</span><span className="font-bold text-white uppercase">{getDisplayPackageName(selectedStyles.length)}</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-gray-500 uppercase tracking-widest">Fotos/Estilos Comprados</span><span className="font-bold text-studio-gold">{selectedStyles.length} Unidades</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-gray-500 uppercase tracking-widest">Valor Unitário</span><span className="font-bold text-white uppercase">R$ {getPrecoUnitario(selectedStyles.length).toFixed(2).replace('.', ',')} / foto</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-gray-500 uppercase tracking-widest">Fotos Env.</span><span className={`font-bold ${reaproveitarFotos || selectedFiles.length >= 5 ? 'text-emerald-400' : 'text-red-500'}`}>{reaproveitarFotos ? 'Reaproveitadas' : `${selectedFiles.length}/10 (Mín. 5)`}</span></div>
                      </div>
                      <div className="p-6 bg-white/5 border-t border-white/10 -mx-6 -mb-6 rounded-b-2xl">
                        <div className="flex justify-between items-center font-bold font-display uppercase tracking-widest text-lg mb-6"><span>Total:</span><span className="text-studio-gold">R$ {currentTotal.toFixed(2).replace('.', ',')}</span></div>
                        <button onClick={handleSendToProduction} disabled={selectedStyles.length === 0 || (!reaproveitarFotos && selectedFiles.length < 5) || isUploading} className="w-full py-4 bg-studio-gold text-studio-black font-bold uppercase tracking-widest hover:bg-studio-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl">
                          {isUploading ? <><Loader2 size={18} className="animate-spin" /> Processando Imagens...</> : <><CheckCircle2 size={18} /> Confirmar Pedido</>}
                        </button>
                      </div>
                    </div>

                    {/* CTA Serviço Sob Medida (Desktop) */}
                    <div
                      onClick={() => toggleStyle('ESTILO_SOBMEDIDA')}
                      className={`w-full border rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden text-left cursor-pointer hidden lg:block ${selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'border-studio-gold bg-studio-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.3)]' : 'border-studio-gold/30 hover:border-studio-gold bg-[#121212]/80 backdrop-blur-sm shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]'}`}
                    >
                      <div className="absolute top-0 right-0 bg-studio-gold text-studio-black text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-bl-xl z-10">PREMIUM</div>
                      <div className="flex flex-col items-center justify-between gap-4 relative z-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'bg-studio-gold text-studio-black border-studio-gold' : 'bg-studio-gold/10 text-studio-gold border-studio-gold/20 group-hover:scale-110'}`}>
                          <Palette size={20} />
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold font-display uppercase tracking-widest text-white group-hover:text-studio-gold transition-colors flex flex-col items-center justify-center gap-2">
                            Direção de Arte Sob Medida
                            {selectedStyles.includes('ESTILO_SOBMEDIDA') && <CheckCircle2 size={16} className="text-studio-gold animate-in zoom-in" />}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">Tem uma pose, roupa ou cenário específico em mente? Nossa equipe cria uma arte 100% exclusiva para você.</p>
                        </div>
                        <div className="shrink-0 bg-studio-gold/5 p-4 rounded-xl w-full text-center border border-studio-gold/10 flex flex-col items-center gap-1 mt-2">
                          <p className="text-xl font-bold text-studio-gold tracking-wider">R$ 69,90</p>
                          <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-all ${selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'bg-studio-gold text-studio-black' : 'bg-white/5 text-gray-400 group-hover:bg-studio-gold group-hover:text-studio-black'}`}>
                            {selectedStyles.includes('ESTILO_SOBMEDIDA') ? 'Selecionado' : 'Adicionar este extra'}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ----------------- ABA PERFIL ----------------- */}
        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="perfil" className="max-w-4xl px-8">
            <header className="mb-10"><h2 className="text-3xl font-bold font-display uppercase tracking-wider">O Meu Perfil</h2><p className="text-gray-500 mt-2">Informações e a segurança da conta.</p></header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="w-full h-full rounded-full border-2 border-white/10 overflow-hidden relative">
                      <img
                        src={avatarUrl?.startsWith('http') ? avatarUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
                        alt="Preview Avatar"
                        className="w-full h-full object-cover"
                      />
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

      {/* BOTÃO WHATSAPP VIP */}
      <motion.button
        onClick={handleWhatsAppSupport}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed z-[90] bottom-24 right-4 md:bottom-8 md:right-8 bg-[#121212]/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </motion.button>

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