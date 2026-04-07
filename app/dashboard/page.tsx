'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Camera, Home, Library, PlusCircle, User, CloudUpload, Check, CheckCheck,
  Archive, X, Send, Sparkles, LogOut, Clock, LayoutGrid, CheckCircle2,
  ChevronRight, ChevronLeft, Info, Eye, Download, Zap, MessageSquare, FileImage, Loader2, FileText, Paperclip, Lock, Bot, Search, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

declare global { interface Window { JSZip: any; } }

export default function Dashboard() {
  const EVENTO_SAZONAL = {
    ativo: false,
    id: 'sazonal',
    titulo: 'Especial Dia da Mãe 🌹',
    descricao: 'Surpreenda com uma foto perfeita! 1 Estilo Temático em altíssima resolução.',
    preco: 19.90,
    estilos: '1 Estilo Temático',
    nomeDoEstilo: 'Mãe VIP' // O nome do estilo que acabou de criar no painel
  };

  const router = useRouter();

  // Forçar renderização puramente client-side
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Memória de Aba (Não perde ao dar F5)
  const [activeTab, setActiveTab] = useState<'home' | 'ensaios' | 'novo' | 'perfil' | 'mensagens'>('home');
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);

  // Filtro de Gênero e Categoria
  const [genderFilter, setGenderFilter] = useState<'Feminino' | 'Masculino'>('Feminino');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');

  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<null | 'amostra' | 'essencial' | 'premium' | 'elite' | 'sazonal'>(null);

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
  const [isRestricted, setIsRestricted] = useState(false);
  const [dynamicPrices, setDynamicPrices] = useState<any>(null);
  const [isMaintenanceGlobal, setIsMaintenanceGlobal] = useState(false);

  const fetchDbStyles = async () => {
    const { data, error } = await supabase.from('estilos').select('*').order('criado_em', { ascending: false });
    if (data) setDbStyles(data);
  };

  // Estados de Prévia e Galeria
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFilesMetadata, setPreviewFilesMetadata] = useState<{ name: string, url: string }[]>([]);
  const [selectedPreviewPhotos, setSelectedPreviewPhotos] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // NOVOS ESTADOS PARA GALERIA
  const [selectedEnsaioForGallery, setSelectedEnsaioForGallery] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [isFetchingGallery, setIsFetchingGallery] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<string | null>(null);

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

  const getPriceDisplay = (key: string, fallback: number) => {
    if (!dynamicPrices) return `R$ ${fallback.toFixed(2).replace('.', ',')}`;
    const preco = parsePrice(dynamicPrices[`preco_${key}`], fallback);
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
  };

  const getStyleLimit = () => {
    if (selectedPackage === 'sazonal') return 1;
    if (selectedPackage === 'amostra') return 1;
    if (selectedPackage === 'essencial') return 1;
    if (selectedPackage === 'premium') return 3;
    if (selectedPackage === 'elite') return 5;
    return 0;
  };

  const totalAmount = selectedPackage === 'sazonal' ? 19.90 :
    selectedPackage === 'amostra' ? parsePrice(dynamicPrices?.preco_amostra, 19.90) :
      selectedPackage === 'essencial' ? parsePrice(dynamicPrices?.preco_essencial, 89.90) :
        selectedPackage === 'premium' ? parsePrice(dynamicPrices?.preco_premium, 149.90) :
          selectedPackage === 'elite' ? parsePrice(dynamicPrices?.preco_elite, 247.90) : 0;
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


  const toggleStyle = (style: string) => { const limit = getStyleLimit(); if (selectedStyles.includes(style)) { setSelectedStyles(selectedStyles.filter(s => s !== style)); } else if (selectedStyles.length < limit) { setSelectedStyles([...selectedStyles, style]); } else { alert(`O pacote escolhido permite apenas ${limit} estilo(s).`); } };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) { const newFiles = Array.from(e.target.files); setSelectedFiles([...selectedFiles, ...newFiles].slice(0, 10)); } };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); if (e.dataTransfer.files) { const newFiles = Array.from(e.dataTransfer.files); setSelectedFiles([...selectedFiles, ...newFiles].slice(0, 10)); } };
  const removeFile = (index: number) => { setSelectedFiles(prev => prev.filter((_, i) => i !== index)); };

  const handleSendToProduction = async () => {
    if (isRestricted || isMaintenanceGlobal) {
      alert(isMaintenanceGlobal ? "Sistema em manutenção, não é possível criar pedidos temporariamente." : "Operação bloqueada. A sua conta está suspensa para novos pedidos.");
      return;
    }

    if (selectedPackage === 'amostra' && pedidos.length > 0) {
      alert("A Amostra VIP só está disponível para o seu primeiro pedido! Por favor, escolha um dos nossos pacotes completos.");
      return;
    }

    if (!selectedPackage || selectedStyles.length === 0 || selectedFiles.length < 5) {
      alert("Preencha todos os campos obrigatórios e envie no mínimo 5 fotos.");
      return;
    }

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
    setSelectedPreviewPhotos([]);
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
        setSelectedPreviewPhotos(pedido.fotos_selecionadas);
      }

      setIsPreviewOpen(true);
    } catch (error: any) { alert("Erro ao carregar prévia: " + error.message); } finally { setIsFetchingPreview(false); }
  };

  const getSelectionLimit = (packageName: string) => {
    const pkg = packageName?.toLowerCase();
    if (pkg?.includes('sazonal')) return 1;
    if (pkg?.includes('amostra')) return 1;
    if (pkg?.includes('essencial')) return 10;
    if (pkg?.includes('premium')) return 25;
    if (pkg?.includes('elite')) return 50;
    return 0;
  };

  const togglePhotoSelection = (fileName: string) => {
    const pedido = pedidos.find(p => p.id === selectedOrderId);
    const limit = getSelectionLimit(pedido?.pacote || '');

    if (selectedPreviewPhotos.includes(fileName)) {
      setSelectedPreviewPhotos(prev => prev.filter(name => name !== fileName));
    } else if (selectedPreviewPhotos.length < limit) {
      setSelectedPreviewPhotos(prev => [...prev, fileName]);
    } else {
      alert(`Você já selecionou o limite de ${limit} fotos para o seu pacote.`);
    }
  };

  const handleApproveSelection = async () => {
    if (!selectedOrderId) return;
    const pedido = pedidos.find(p => p.id === selectedOrderId);
    const limit = getSelectionLimit(pedido?.pacote || '');

    if (selectedPreviewPhotos.length !== limit) {
      alert(`Por favor, selecione exatamente ${limit} fotos para prosseguir.`);
      return;
    }

    setIsFetchingPreview(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({
          fotos_selecionadas: selectedPreviewPhotos
        })
        .eq('id', selectedOrderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("O banco de dados bloqueou a gravação da sua seleção. (Erro de permissão RLS).");
      }

      setIsPreviewOpen(false);
      router.push(`/checkout?orderId=${selectedOrderId}`);
    } catch (error: any) {
      alert("Erro Crítico ao salvar seleção: " + error.message);
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleViewGallery = async (orderId: string) => {
    setIsFetchingGallery(true);
    setSelectedEnsaioForGallery(orderId);
    try {
      const { data: pedido, error: dbError } = await supabase
        .from('pedidos')
        .select('fotos_selecionadas')
        .eq('id', orderId)
        .single();

      if (dbError) throw dbError;
      const selecionadas = pedido?.fotos_selecionadas;

      if (!selecionadas || selecionadas.length === 0) {
        alert("Erro de Segurança: A sua curadoria não foi gravada no sistema ou está vazia. O Cofre foi trancado por precaução.");
        setIsFetchingGallery(false);
        return;
      }

      const path = `${userId}/${orderId}/`;
      const { data: files, error: storageError } = await supabase.storage.from('previa_ensaios').list(path);
      if (storageError) throw storageError;

      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) { alert("Nenhuma foto encontrada no servidor."); return; }

      const arquivosFinais = validFiles.filter(f => {
        return selecionadas.some((sel: string) => f.name.includes(sel) || sel.includes(f.name));
      });

      if (arquivosFinais.length === 0) {
        alert("Erro de leitura: As fotos selecionadas não batem com os arquivos armazenados. Contacte o suporte.");
        setIsFetchingGallery(false);
        return;
      }

      const urlPromises = arquivosFinais.map(async (file) => {
        const { data, error } = await supabase.storage.from('previa_ensaios').createSignedUrl(`${path}${file.name}`, 3600);
        if (error) throw error; return data.signedUrl;
      });

      setGalleryPhotos(await Promise.all(urlPromises));
    } catch (error: any) { alert("Erro ao carregar galeria: " + error.message); } finally { setIsFetchingGallery(false); }
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
      const selecionadas = pedido?.fotos_selecionadas;

      if (!selecionadas || selecionadas.length === 0) {
        alert("Erro de Segurança: A sua curadoria não foi gravada no sistema. Operação Cancelada para proteção dos arquivos.");
        setIsDownloading(null);
        return;
      }

      const path = `${userId}/${orderId}/`;
      const { data: files, error: storageError } = await supabase.storage.from('previa_ensaios').list(path);
      if (storageError) throw storageError;

      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
      if (validFiles.length === 0) { alert("Ficheiros não encontrados no servidor."); return; }

      const arquivosFinais = validFiles.filter(f => {
        return selecionadas.some((sel: string) => f.name.includes(sel) || sel.includes(f.name));
      });

      if (arquivosFinais.length === 0) {
        alert("Erro: As fotos selecionadas não puderam ser descarregadas. Contacte o suporte.");
        setIsDownloading(null);
        return;
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

  const displayStyles = selectedPackage === 'sazonal'
    ? dbStyles.filter(s => s.titulo === EVENTO_SAZONAL.nomeDoEstilo)
    : dbStyles.filter(s =>
      s.titulo !== EVENTO_SAZONAL.nomeDoEstilo && // <- O CADEADO AQUI: Esconde o sazonal dos outros pacotes
      (s.genero === genderFilter || s.genero === 'Ambos') &&
      (categoryFilter === 'Todos' || s.categoria === categoryFilter)
    );

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
                    const limit = getSelectionLimit(pedido?.pacote || '');
                    return `Selecionadas: ${selectedPreviewPhotos.length} de ${limit} (${pedido?.pacote})`;
                  })()}
                </p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="text-white hover:text-studio-gold transition-colors p-2 bg-white/5 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#0a0a0a]">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {previewFilesMetadata.map((file, idx) => {
                    const isSelected = selectedPreviewPhotos.includes(file.name);
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
                            className="absolute inset-0 z-20 flex items-center justify-center bg-studio-gold/10"
                          >
                            <CheckCircle2 size={48} className="text-studio-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
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

            <div className="p-6 border-t border-white/10 bg-studio-black/90 flex justify-center">
              {(() => {
                const pedido = pedidos.find(p => p.id === selectedOrderId);
                const limit = getSelectionLimit(pedido?.pacote || '');
                const isReady = selectedPreviewPhotos.length === limit;

                return (
                  <button
                    onClick={handleApproveSelection}
                    disabled={!isReady || isFetchingPreview}
                    className={`w-full max-w-lg py-5 font-display font-black uppercase tracking-widest text-sm md:text-base transition-all rounded-xl flex items-center justify-center gap-3 shadow-2xl ${isReady
                      ? 'bg-studio-gold text-studio-black hover:bg-studio-gold-light shadow-studio-gold/20'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                      }`}
                  >
                    {isFetchingPreview ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={24} />
                        {isReady ? 'Aprovar Seleção e Libertar Alta Resolução' : `Selecione mais ${limit - selectedPreviewPhotos.length} fotos`}
                      </>
                    )}
                  </button>
                );
              })()}
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
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Clock className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Aguardando Produção').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Aguardando</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Bot className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Em Produção').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Em Produção</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><Eye className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Prévia Disponível').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Prévia Disponível</p></div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group"><div className="flex justify-between items-start mb-4"><CheckCircle2 className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} /><span className="text-2xl font-bold font-display text-white">{pedidos.filter(p => p.status === 'Ensaio Concluído' || p.status === 'Finalizado').length.toString().padStart(2, '0')}</span></div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Concluídos</p></div>
            </div>
            {pedidos.length > 0 && (
              <section className="mb-12">
                <h3 className="text-lg font-bold font-display uppercase tracking-widest mb-6 flex items-center gap-3"><Clock size={18} className="text-studio-gold" /> Pedidos Recentes</h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10"><tr><th className="px-3 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Pacote</th><th className="px-3 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Data</th><th className="px-3 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Status</th></tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {pedidos.slice(0, 3).map((pedido) => (
                        <tr key={pedido.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-3 py-4 font-bold uppercase tracking-widest text-xs text-studio-gold">{pedido.pacote}</td>
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
                    {pedidos.map((pedido) => (
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

                          <h4 className="text-sm font-bold font-display uppercase tracking-widest text-studio-gold mb-2">{pedido.pacote}</h4>

                          {!selectedEnsaioForGallery && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {pedido.estilos?.map((estilo: string) => (
                                <span key={estilo} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase tracking-wider text-gray-400">{estilo}</span>
                              ))}
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
                      )}
                    </div>
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
                      <div className="flex items-center gap-4 mb-8"><span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">1</span><h3 className="text-xl font-bold font-display uppercase tracking-widest">Escolha o seu Pacote</h3></div>

                      {/* ADICIONADO: Banner de Destaque para a Amostra VIP (SÓ APARECE NA 1ª VEZ) */}
                      {pedidos.length === 0 && (
                        <div
                          onClick={() => { setSelectedPackage('amostra'); setSelectedStyles([]); }}
                          className={`mb-6 border-2 rounded-2xl p-6 relative overflow-hidden transition-all group cursor-pointer ${selectedPackage === 'amostra' ? 'border-studio-gold bg-studio-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'border-white/10 bg-[#121212] hover:border-studio-gold/50'}`}
                        >
                          <div className="absolute top-0 right-0 bg-studio-gold text-studio-black text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-bl-xl">NOVO</div>
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-studio-gold/10 flex items-center justify-center text-studio-gold shrink-0 border border-studio-gold/20">
                                <Sparkles size={24} />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold font-display uppercase tracking-widest text-studio-gold flex items-center gap-2">Amostra VIP <span className="text-sm">💎</span></h4>
                                <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">Ainda na dúvida? Teste o poder da nossa IA com 1 Estilo (1 Foto de alta definição). <strong className="text-white font-normal">O valor é descontado caso faça um upgrade depois.</strong></p>
                              </div>
                            </div>
                            <div className="text-left md:text-right shrink-0 bg-white/5 md:bg-transparent p-4 md:p-0 rounded-xl w-full md:w-auto">
                              <p className="text-2xl font-bold text-white tracking-wider">{getPriceDisplay('amostra', 19.90)}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Teste de Confiança</p>
                            </div>
                          </div>
                          {selectedPackage === 'amostra' && <div className="absolute inset-0 border-2 border-studio-gold rounded-2xl pointer-events-none"></div>}
                        </div>
                      )}

                      {/* BANNER SAZONAL / TEMÁTICO */}
                      {EVENTO_SAZONAL.ativo && (
                        <div
                          onClick={() => {
                            setSelectedPackage('sazonal');
                            setSelectedStyles([EVENTO_SAZONAL.nomeDoEstilo]);
                          }}
                          className={`mb-8 w-full border-2 rounded-2xl p-6 relative overflow-hidden transition-all group cursor-pointer ${selectedPackage === 'sazonal'
                            ? 'border-studio-gold bg-gradient-to-r from-purple-900/40 to-studio-black shadow-[0_0_30px_rgba(212,175,55,0.3)] ring-2 ring-studio-gold/20'
                            : 'border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-studio-black hover:border-studio-gold transition-all'}`}
                        >
                          <div className="absolute top-0 right-0 bg-studio-gold text-studio-black text-[9px] font-black px-4 py-1.5 uppercase tracking-[0.2em] rounded-bl-xl shadow-lg z-20">TEMPO LIMITADO</div>

                          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full">
                            {/* LADO ESQUERDO: Ícone e Textos */}
                            <div className="flex items-center gap-5 flex-1">
                              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${selectedPackage === 'sazonal' ? 'bg-studio-gold text-studio-black border-white/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                <Sparkles size={28} className={selectedPackage === 'sazonal' ? 'animate-pulse' : ''} />
                              </div>
                              <div className="text-left">
                                <h4 className="text-lg md:text-xl font-black font-display uppercase tracking-widest text-white">{EVENTO_SAZONAL.titulo}</h4>
                                <p className="text-[10px] md:text-xs text-gray-300 mt-1 max-w-md leading-relaxed font-medium">{EVENTO_SAZONAL.descricao}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-0.5 bg-studio-gold/10 border border-studio-gold/20 rounded text-[8px] font-bold text-studio-gold uppercase tracking-wider">{EVENTO_SAZONAL.estilos}</span>
                                </div>
                              </div>
                            </div>

                            {/* LADO DIREITO: Preço e Check */}
                            <div className="flex flex-col items-center md:items-end shrink-0">
                              <p className="text-xl md:text-2xl font-black text-studio-gold tracking-tight drop-shadow-xl">R$ {EVENTO_SAZONAL.preco.toFixed(2).replace('.', ',')}</p>
                              <p className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Oferta Exclusiva</p>
                              {selectedPackage === 'sazonal' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3 w-8 h-8 bg-studio-gold text-studio-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.6)]">
                                  <Check size={16} strokeWidth={4} />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Efeito de brilho de fundo */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-studio-gold/5 blur-[80px] pointer-events-none opacity-50"></div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'essencial', title: 'Essencial (10 fotos)', styles: '1 Estilo', price: getPriceDisplay('essencial', 89.90), icon: User },
                          { id: 'premium', title: 'Premium (25 fotos)', styles: '3 Estilos', price: getPriceDisplay('premium', 149.90), icon: Sparkles, popular: true },
                          { id: 'elite', title: 'Elite (50 fotos)', styles: '5 Estilos', price: getPriceDisplay('elite', 247.90), icon: Zap },
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

                        {selectedPackage !== 'sazonal' && (
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
                        )}

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
                      <div className="p-6 bg-white/5 border-t border-white/10 -mx-6 -mb-6 rounded-b-2xl">
                        <div className="flex justify-between items-center font-bold font-display uppercase tracking-widest text-lg mb-6"><span>Total:</span><span className="text-studio-gold">R$ {totalAmount.toFixed(2).replace('.', ',')}</span></div>
                        <button onClick={handleSendToProduction} disabled={!selectedPackage || selectedStyles.length < getStyleLimit() || selectedFiles.length < 5 || isUploading} className="w-full py-4 bg-studio-gold text-studio-black font-bold uppercase tracking-widest hover:bg-studio-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl">
                          {isUploading ? <><Loader2 size={18} className="animate-spin" /> Processando Imagens...</> : <><Sparkles size={18} /> Confirmar Pedido</>}
                        </button>
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