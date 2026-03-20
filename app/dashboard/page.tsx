'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Camera,
  Home,
  Library,
  PlusCircle,
  User,
  Settings,
  CloudUpload,
  Check,
  CheckCheck,
  Archive,
  HelpCircle,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Headset,
  LogOut,
  Clock,
  LayoutGrid,
  CheckCircle2,
  ChevronRight,
  Info,
  CreditCard,
  Zap,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'ensaios' | 'novo' | 'perfil'>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<null | 'basico' | 'popular' | 'pro'>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('Fotos enviadas! Em breve sua prévia estará disponível.');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Estados do Perfil
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Estados do Usuário Logado
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pedidos, setPedidos] = useState<any[]>([]);

  // Estados do Modal de Prévia Segura
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  // Buscar Pedidos do Usuário
  const fetchPedidos = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', userId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  };

  // Helper: Formata data para o padrão brasileiro
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // EFEITO DE BLINDAGEM: Roda assim que a página abre
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email ?? '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || null);
        setIsLoading(false);
        fetchPedidos(session.user.id);
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getStyleLimit = () => {
    if (selectedPackage === 'basico') return 2;
    if (selectedPackage === 'popular') return 5;
    if (selectedPackage === 'pro') return 10;
    return 0;
  };

  const toggleStyle = (style: string) => {
    const limit = getStyleLimit();
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else if (selectedStyles.length < limit) {
      setSelectedStyles([...selectedStyles, style]);
    } else {
      alert(`O pacote ${selectedPackage} permite apenas ${limit} estilos.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = [...selectedFiles, ...newFiles].slice(0, 10);
      setSelectedFiles(totalFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const totalFiles = [...selectedFiles, ...newFiles].slice(0, 10);
      setSelectedFiles(totalFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendToProduction = async () => {
    if (!selectedPackage) {
      alert("Selecione um pacote primeiro.");
      return;
    }
    if (selectedStyles.length === 0) {
      alert("Selecione pelo menos 1 estilo.");
      return;
    }
    if (selectedFiles.length < 5) {
      alert("Envie pelo menos 5 fotos de rosto para treinamento.");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Usuário não autenticado. Por favor, faça login novamente.");
      }

      const userId = user.id;
      const userEmail = user.email;

      const { data: orderData, error: dbError } = await supabase
        .from('pedidos')
        .insert({
          user_id: userId,
          user_email: userEmail,
          pacote: selectedPackage,
          estilos: selectedStyles,
          status: 'Aguardando Produção'
        })
        .select()
        .single();

      if (dbError) throw dbError;
      const orderId = orderData.id;

      for (const file of selectedFiles) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${userId}/${orderId}/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from('fotos_clientes')
          .upload(filePath, file);

        if (storageError) throw storageError;
      }

      setAlertMessage("Pedido enviado com sucesso! Em breve sua prévia estará disponível na aba Meus Ensaios.");
      setShowSuccessAlert(true);
      setActiveTab('home');

      setSelectedPackage(null);
      setSelectedStyles([]);
      setSelectedFiles([]);

      fetchPedidos(userId);

      setTimeout(() => setShowSuccessAlert(false), 5000);

    } catch (error: any) {
      console.error('Erro ao processar pedido:', error);
      alert(`Falha no envio: ${error.message || "Tente novamente em alguns instantes."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    if (newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsUpdatingProfile(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert("Erro ao atualizar senha: " + error.message);
    } else {
      setAlertMessage("Senha atualizada com sucesso!");
      setShowSuccessAlert(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowSuccessAlert(false), 5000);
    }
    setIsUpdatingProfile(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUpdatingProfile(true);

    try {
      const fileName = `avatar_${Date.now()}_${file.name}`;
      const filePath = `${userEmail}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setAlertMessage("Foto de perfil atualizada!");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error: any) {
      console.error('Erro no upload do avatar:', error);
      alert("Erro ao atualizar avatar: " + (error.message || "Tente novamente."));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Função para Abrir Prévia Segura (CORRIGIDA COM URL ASSINADA)
  const handleOpenPreview = async (orderId: string) => {
    setIsFetchingPreview(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const path = `${user.id}/${orderId}/`;
      const { data: files, error } = await supabase.storage
        .from('previa_ensaios')
        .list(path);

      if (error) throw error;

      // Filtra o placeholder invisível do Supabase
      const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];

      if (validFiles.length === 0) {
        alert("Nenhuma prévia encontrada. Nossa equipe está finalizando seu ensaio!");
        return;
      }

      // NOVO: Gerando URLs Assinadas (Temporárias e Seguras) para o cofre privado
      const urlPromises = validFiles.map(async (file) => {
        const { data, error } = await supabase.storage
          .from('previa_ensaios')
          .createSignedUrl(`${path}${file.name}`, 3600); // Válido por 1 hora (3600 segundos)

        if (error) throw error;
        return data.signedUrl;
      });

      // Espera todas as URLs serem geradas
      const urls = await Promise.all(urlPromises);

      setPreviewPhotos(urls);
      setSelectedOrderId(orderId);
      setIsPreviewOpen(true);
    } catch (error: any) {
      console.error('Erro ao buscar prévia:', error);
      alert("Erro ao carregar prévia: " + error.message);
    } finally {
      setIsFetchingPreview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-studio-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-studio-black text-white relative">
      {/* 🛡️ MODAL DE PRÉVIA BLINDADO 🛡️ */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col"
          >
            {/* Header do Modal */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-studio-black/50">
              <div>
                <h3 className="text-2xl font-display uppercase tracking-widest text-studio-gold font-bold">Prévia do Ensaio</h3>
                <p className="text-gray-400 text-xs mt-1">Protegido com marca d'água. Aprove para liberar a versão final em alta resolução sem marcas.</p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="text-white hover:text-studio-gold transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={24} />
              </button>
            </div>

            {/* Área das Fotos Blindadas */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center gap-12 select-none">
              {previewPhotos.map((url, idx) => (
                <div
                  key={idx}
                  // 📐 Tamanho Elegante e Premium: max-w-xs (aproximadamente 320px)
                  className="relative max-w-xs w-full shrink-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden bg-[#121212] border border-white/5"
                  onContextMenu={(e) => e.preventDefault()} // 🛡️ Bloqueio botão direito
                >
                  {/* A Foto */}
                  <img
                    src={url}
                    alt={`Prévia ${idx + 1}`}
                    className="w-full h-auto block pointer-events-none select-none"
                    draggable={false}
                  />

                  {/* 🛡️ Camada 1: Escudo Invisível anti-Drag & Drop e anti-clique */}
                  <div className="absolute inset-0 z-10 cursor-not-allowed"></div>

                  {/* 🛡️ Camada 2: A Blindagem Definitiva (Estilo Fotto 1:1 - Ultra-Branded Security Grid) 🛡️ */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none opacity-25 mix-blend-overlay"
                    style={{
                      // MULTI-LAYER CSS: Logotipo e Grid de Segurança independentes para máxima nitidez e branding
                      backgroundImage: `
                        url("/logo.2.png"), 
                        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cline x1='0' y1='0' x2='160' y2='160' stroke='white' stroke-width='0.5' opacity='0.2' /%3E%3Cline x1='160' y1='0' x2='0' y2='160' stroke='white' stroke-width='0.5' opacity='0.2' /%3E%3Ctext x='80' y='110' text-anchor='middle' fill='white' font-size='10' font-family='sans-serif' font-weight='900' opacity='0.6' letter-spacing='0.1em'%3EVIRTUAL STUDIO%3C/text%3E%3Ctext x='80' y='125' text-anchor='middle' fill='white' font-size='7' font-family='sans-serif' font-weight='700' opacity='0.4'%3EFOTO PROTEGIDA • NÃO TIRE PRINT%3C/text%3E%3C/svg%3E")
                      `,
                      backgroundRepeat: 'repeat, repeat',
                      backgroundSize: '40px 40px, 160px 160px',
                      backgroundPosition: '60px 40px, 0 0', // Centraliza o logo no meio do 'X' de 160px
                    }}
                  ></div>
                </div>
              ))}
            </div>

            {/* Footer Fixo: A grande conversão (Checkout) */}
            <div className="p-6 border-t border-white/10 bg-studio-black/90 backdrop-blur-md flex justify-center">
              <button
                onClick={() => router.push(`/checkout?orderId=${selectedOrderId}`)}
                className="w-full max-w-lg py-5 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest text-sm md:text-base hover:bg-studio-gold-light hover:scale-[1.02] transition-all rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={24} />
                Aprovar e Liberar Alta Resolução
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 🛡️ FIM DO MODAL BLINDADO 🛡️ */}

      {/* Success Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            <span>{alertMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-studio-black flex flex-col sticky top-0 h-screen hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Image src="/logo.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-white text-sm font-bold">VIRTUAL STUDIO</h1>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">Painel do Cliente</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'home' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}
            >
              <Home size={18} />
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('ensaios')}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'ensaios' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}
            >
              <Library size={18} />
              <span className="text-sm font-medium">Meus Ensaios</span>
            </button>
            <button
              onClick={() => setActiveTab('novo')}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'novo' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}
            >
              <PlusCircle size={18} />
              <span className="text-sm font-semibold">Novo Pedido</span>
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === 'perfil' ? 'bg-studio-gold/10 text-studio-gold border-r-2 border-studio-gold' : 'text-gray-400 hover:text-studio-gold'}`}
            >
              <User size={18} />
              <span className="text-sm font-medium">Perfil</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-studio-gold/20 flex items-center justify-center overflow-hidden relative border border-studio-gold/30">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-studio-gold text-studio-black flex items-center justify-center font-bold text-lg">
                  {userEmail?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate font-display tracking-widest">
                {userEmail ? userEmail.split('@')[0] : 'Usuário'}
              </p>
              <p className="text-gray-500 text-[10px] truncate">{userEmail}</p>
            </div>
            <div className="relative flex gap-2">
              <Settings className="text-gray-500 cursor-pointer hover:text-studio-gold transition-colors" size={18} />
              <button onClick={handleLogout} title="Sair da conta">
                <LogOut className="text-red-500 cursor-pointer hover:text-red-400 transition-colors" size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#121212] pt-20 pb-24 md:pt-8 md:pb-8 relative">

        {/* MOBILE HEADER (TOP) */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-studio-black/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <h1 className="text-white text-xs font-bold font-display tracking-widest leading-none">VIRTUAL STUDIO</h1>
          </div>
          <button onClick={handleLogout} className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-500">
            <LogOut size={16} />
          </button>
        </header>

        {/* Aba Home */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="home">
            <header className="mb-10">
              <h2 className="text-3xl font-bold font-display uppercase tracking-wider">Bem-vindo ao Virtual Studio, <span className="text-studio-gold">{userEmail?.split('@')[0]}</span></h2>
              <p className="text-gray-500 mt-2">Sua jornada para a imagem profissional perfeita começa aqui.</p>
            </header>

            {/* Grid de Status Dinâmico */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                {
                  label: 'Aguardando',
                  val: pedidos.filter(p => !p.status || p.status === 'Aguardando Produção').length.toString().padStart(2, '0'),
                  icon: Clock
                },
                {
                  label: 'Em Produção',
                  val: pedidos.filter(p => p.status === 'Em Produção' || p.status === 'Processing').length.toString().padStart(2, '0'),
                  icon: Zap
                },
                {
                  label: 'Prévia Disponível',
                  val: pedidos.filter(p => p.status === 'Prévia Disponível').length.toString().padStart(2, '0'),
                  icon: LayoutGrid
                },
                {
                  label: 'Ensaios Concluídos',
                  val: pedidos.filter(p => p.status === 'Ensaio Concluído' || p.status === 'Finalizado').length.toString().padStart(2, '0'),
                  icon: CheckCircle2
                },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-studio-gold/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className="text-gray-500 group-hover:text-studio-gold transition-colors" size={20} />
                    <span className="text-2xl font-bold font-display text-white">{stat.val}</span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Pedidos Recentes */}
            {pedidos.length > 0 && (
              <section className="mb-12">
                <h3 className="text-lg font-bold font-display uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Clock size={18} className="text-studio-gold" />
                  Pedidos Recentes
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Pacote</th>
                        <th className="px-6 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Data</th>
                        <th className="px-6 py-4 text-gray-400 font-medium uppercase tracking-wider text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pedidos.slice(0, 3).map((pedido) => (
                        <tr key={pedido.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-studio-gold">{pedido.pacote}</td>
                          <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(pedido.criado_em)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${(pedido.status === 'Ensaio Concluído' || pedido.status === 'Finalizado') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              pedido.status === 'Em Produção' ? 'bg-blue-900/20 text-blue-400 border-blue-400/30' :
                                pedido.status === 'Prévia Disponível' ? 'bg-studio-gold/10 text-studio-gold border-studio-gold/20' :
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

            {/* Como funciona o seu estúdio */}
            <section className="bg-studio-gold/5 border border-studio-gold/10 p-8 rounded-2xl">
              <h3 className="text-lg font-bold font-display uppercase tracking-widest mb-8 flex items-center gap-3">
                <Info size={18} className="text-studio-gold" />
                Como funciona o seu estúdio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { step: '01', title: 'Faça um pedido', desc: 'Escolha seu pacote e estilos favoritos para treinar nossa IA.' },
                  { step: '02', title: 'Curadoria VIP', desc: 'Aguarde a IA e nossa curadoria manual (24h-48h).' },
                  { step: '03', title: 'Liberação', desc: 'Escolha seu plano final, faça o pagamento e libere o download.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-studio-gold font-black text-2xl font-display opacity-40">{item.step}</span>
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-2">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* Aba Meus Ensaios */}
        {activeTab === 'ensaios' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="ensaios">
            <header className="mb-8">
              <h2 className="text-3xl font-bold font-display uppercase tracking-wider">Meus Ensaios</h2>
              <p className="text-gray-500">Acesse aqui todos os seus trabalhos finalizados.</p>
            </header>

            {pedidos.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-studio-gold/10 text-studio-gold flex items-center justify-center mb-6">
                  <Archive size={32} />
                </div>
                <h3 className="text-xl font-bold font-display uppercase tracking-widest">Você ainda não possui ensaios</h3>
                <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Inicie um novo pedido para começar a transformar suas fotos com nossa tecnologia.</p>
                <button
                  onClick={() => setActiveTab('novo')}
                  className="mt-8 px-8 py-3 bg-studio-gold text-studio-black font-bold uppercase tracking-widest hover:bg-studio-gold-light transition-all flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  Novo Pedido
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-studio-gold/30 transition-all flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${(pedido.status === 'Ensaio Concluído' || pedido.status === 'Finalizado') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          pedido.status === 'Em Produção' ? 'bg-blue-900/20 text-blue-400 border-blue-400/30' :
                            pedido.status === 'Prévia Disponível' ? 'bg-studio-gold/10 text-studio-gold border-studio-gold/20' :
                              'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                          {pedido.status === 'Finalizado' ? 'Ensaio Concluído' : pedido.status}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{formatDate(pedido.criado_em).split(',')[0]}</span>
                      </div>

                      <h4 className="text-lg font-bold font-display uppercase tracking-widest text-studio-gold mb-2">{pedido.pacote}</h4>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {pedido.estilos?.map((estilo: string) => (
                          <span key={estilo} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase tracking-wider text-gray-400">
                            {estilo}
                          </span>
                        ))}
                      </div>

                      {pedido.status === 'Prévia Disponível' && (
                        <button
                          onClick={() => handleOpenPreview(pedido.id)}
                          disabled={isFetchingPreview}
                          className="w-full mt-4 py-3 bg-studio-gold text-studio-black font-bold uppercase tracking-widest text-[10px] hover:bg-studio-gold-light transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          {isFetchingPreview && selectedOrderId === pedido.id ? (
                            <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                          )}
                          Visualizar Prévia
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        <Camera size={14} className="text-studio-gold" />
                        ID: {pedido.id.slice(0, 8)}
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-studio-gold group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Aba Novo Pedido */}
        {activeTab === 'novo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="novo">
            <header className="mb-8">
              <h2 className="text-2xl font-bold font-display uppercase tracking-widest">Configurar Novo Ensaio</h2>
              <p className="text-gray-500">Personalize seu pedido para obter o melhor resultado.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-12 pb-20">
                {/* Passo 1: Pacotes */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">1</span>
                    <h3 className="text-xl font-bold font-display uppercase tracking-widest">Escolha seu Pacote</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'basico', title: 'Básico', styles: '2 Estilos', price: 'Free Preview', icon: User },
                      { id: 'popular', title: 'Popular', styles: '5 Estilos', price: 'Most Choosen', icon: Sparkles },
                      { id: 'pro', title: 'Profissional', styles: '10 Estilos', price: 'Full Access', icon: Zap },
                    ].map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => {
                          setSelectedPackage(pkg.id as any);
                          setSelectedStyles([]);
                        }}
                        className={`p-6 border text-left rounded-xl transition-all relative overflow-hidden group ${selectedPackage === pkg.id ? 'border-studio-gold bg-studio-gold/5 shadow-lg' : 'border-white/10 hover:border-studio-gold/30'}`}
                      >
                        {selectedPackage === pkg.id && (
                          <div className="absolute top-2 right-2 text-studio-gold">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <pkg.icon className={`mb-4 transition-colors ${selectedPackage === pkg.id ? 'text-studio-gold' : 'text-gray-500'}`} size={24} />
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-1">{pkg.title}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">{pkg.styles}</p>
                        <p className={`text-xs font-bold ${selectedPackage === pkg.id ? 'text-studio-gold' : 'text-gray-400'}`}>{pkg.price}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Passo 2: Estilos (Carousel) */}
                {selectedPackage && (
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-end mb-8">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">2</span>
                        <h3 className="text-xl font-bold font-display uppercase tracking-widest">Selecione os Estilos</h3>
                      </div>
                      <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">
                        Selecionados: <span className={selectedStyles.length === getStyleLimit() ? 'text-studio-gold' : 'text-white'}>{selectedStyles.length}/{getStyleLimit()}</span>
                      </span>
                    </div>

                    <div className="flex overflow-x-auto snap-x gap-4 pb-6 no-scrollbar">
                      {[
                        { id: 'LinkedIn', title: 'LinkedIn Pro', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
                        { id: 'Cyber', title: 'Cyberpunk', img: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=400&q=80' },
                        { id: 'Casual', title: 'Casual', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' },
                        { id: 'Editorial', title: 'Moda Editorial', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
                        { id: 'PretoBranco', title: 'Fine Art P&B', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
                        { id: 'Vogue', title: 'Vogue Estilo', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
                        { id: 'Tech', title: 'Modern Tech', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
                        { id: 'Urban', title: 'Urban Lifestyle', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80' },
                      ].map((style) => (
                        <div
                          key={style.id}
                          onClick={() => toggleStyle(style.id)}
                          className={`min-w-[180px] h-[240px] snap-start relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedStyles.includes(style.id) ? 'border-studio-gold scale-[0.98]' : 'border-white/5 hover:border-studio-gold/40'}`}
                        >
                          <Image src={style.img} alt={style.title} fill className="object-cover" unoptimized />
                          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-4 transition-all ${selectedStyles.includes(style.id) ? 'bg-studio-gold/20' : 'opacity-80'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white">{style.title}</p>
                            {selectedStyles.includes(style.id) && (
                              <div className="absolute top-2 right-2 bg-studio-gold text-studio-black rounded-full p-1">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Passo 3: Fotos */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="w-8 h-8 rounded-full bg-studio-gold text-studio-black flex items-center justify-center font-bold">3</span>
                    <h3 className="text-xl font-bold font-display uppercase tracking-widest">Fotos de Referência</h3>
                  </div>

                  <input type="file" multiple accept="image/jpeg, image/png, image/webp" hidden ref={fileInputRef} onChange={handleFileChange} />

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center bg-white/5 hover:border-studio-gold/30 transition-all cursor-pointer group rounded-2xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-studio-gold/5 text-studio-gold flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-studio-gold/10 transition-all">
                      <CloudUpload size={32} />
                    </div>
                    <h4 className="text-lg font-bold font-display uppercase tracking-widest">Arraste aqui as suas fotos</h4>
                    <p className="text-gray-500 text-xs mt-2 max-w-xs">Precisamos de 5 a 10 fotos nítidas do seu rosto para o treinamento perfeito.</p>
                  </div>

                  {/* Preview Grid */}
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-8">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                          <Image src={URL.createObjectURL(file)} alt={`Preview ${index}`} fill className="object-cover" />
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar do Pedido */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-8">
                  <h3 className="text-lg font-bold mb-6 font-display uppercase tracking-widest border-b border-white/5 pb-4">Resumo do Pedido</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 uppercase tracking-widest">Pacote</span>
                      <span className="font-bold text-white uppercase">{selectedPackage || 'Não selecionado'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 uppercase tracking-widest">Estilos</span>
                      <span className={`font-bold ${selectedStyles.length === getStyleLimit() ? 'text-studio-gold' : 'text-white'}`}>
                        {selectedStyles.length}/{getStyleLimit()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 uppercase tracking-widest">Fotos Env.</span>
                      <span className={`font-bold ${selectedFiles.length >= 5 ? 'text-emerald-400' : 'text-red-500'}`}>
                        {selectedFiles.length}/10
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSendToProduction}
                    disabled={isUploading}
                    className="w-full py-4 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest hover:bg-studio-gold-light transition-all disabled:opacity-50 rounded-lg shadow-xl shadow-studio-gold/10"
                  >
                    {isUploading ? 'Enviando...' : 'Enviar para Produção'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba Perfil */}
        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="perfil" className="max-w-4xl">
            <header className="mb-10">
              <h2 className="text-3xl font-bold font-display uppercase tracking-wider">Meu Perfil</h2>
              <p className="text-gray-500 mt-2">Gerencie suas informações e segurança da conta.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coluna da Esquerda: Avatar e Info Básica */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="w-full h-full rounded-full bg-studio-gold/10 flex items-center justify-center overflow-hidden border-2 border-studio-gold/30">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <User size={64} className="text-studio-gold opacity-50" />
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-studio-gold text-studio-black rounded-full flex items-center justify-center border-4 border-[#121212] hover:scale-110 transition-transform"
                    >
                      <Camera size={18} />
                    </button>
                    <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                  <h3 className="font-bold text-lg font-display uppercase tracking-widest">{userEmail?.split('@')[0]}</h3>
                  <p className="text-gray-500 text-xs truncate mt-1">{userEmail}</p>

                  <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.1em]">
                      <span className="text-gray-500 text-xs">Status da Conta</span>
                      <span className="text-studio-gold font-bold">Premium VIP</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.1em]">
                      <span className="text-gray-500 text-xs">Membro desde</span>
                      <span className="text-white">Março 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna da Direita: Alterar Senha */}
              <div className="md:col-span-2 space-y-6">
                <form onSubmit={handleUpdatePassword} className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                  <h3 className="text-lg font-bold font-display uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Zap size={18} className="text-studio-gold" />
                    Segurança da Conta
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">Nova Senha</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-studio-gold transition-colors rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-studio-gold transition-colors rounded-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingProfile || !newPassword}
                      className="w-full py-4 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest hover:bg-studio-gold-light transition-all disabled:opacity-50 rounded-lg shadow-xl shadow-studio-gold/10 flex items-center justify-center gap-2"
                    >
                      {isUpdatingProfile ? (
                        <div className="w-5 h-5 border-2 border-studio-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCheck size={18} />
                          Atualizar Senha
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="bg-studio-gold/5 border border-studio-gold/10 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-studio-gold/10 flex items-center justify-center shrink-0">
                    <Info size={24} className="text-studio-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Dica de Segurança</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Use uma senha forte com pelo menos 8 caracteres, incluindo números e símbolos para proteger seus ensaios.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-studio-gold text-studio-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 transition-all font-bold"
      >
        <MessageSquare size={28} />
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-studio-black"></span>
        </span>
      </button>

      {/* Elegant Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-studio-black border border-studio-gold/30 shadow-2xl z-50 flex flex-col overflow-hidden rounded-2xl"
          >
            {/* Header */}
            <div className="bg-studio-gold p-4 flex justify-between items-center text-studio-black">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-studio-black flex items-center justify-center">
                  <Headset className="text-studio-gold" size={16} />
                </div>
                <div>
                  <h4 className="font-bold font-display uppercase text-sm tracking-wider">Suporte VIP</h4>
                  <p className="opacity-70 text-[10px] uppercase font-bold">Online agora</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>
            {/* Chat Content */}
            <div className="p-6 h-80 overflow-y-auto space-y-4 bg-[#121212]/50">
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-studio-gold/20 flex items-center justify-center shrink-0">
                  <Sparkles size={12} className="text-studio-gold" />
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <p className="text-xs text-gray-300">Olá! Sou seu assistente de estilo. Como posso ajudar com seu novo ensaio hoje?</p>
                </div>
              </div>
            </div>
            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-studio-black">
              <div className="relative">
                <input className="w-full bg-white/5 border border-studio-gold/20 py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-studio-gold placeholder-gray-600 rounded-lg" placeholder="Digite sua mensagem..." type="text" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-studio-gold hover:translate-x-1 transition-transform">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* MOBILE BOTTOM NAVIGATION (BOTTOM) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-studio-black/90 backdrop-blur-2xl border-t border-white/5 z-[100] flex items-center justify-around px-2 md:hidden">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'ensaios', icon: Library, label: 'Ensaios' },
          { id: 'novo', icon: PlusCircle, label: 'Novo', primary: true },
          { id: 'perfil', icon: User, label: 'Perfil' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${item.primary
                ? 'w-14 h-14 -mt-10 bg-studio-gold text-studio-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : activeTab === item.id ? 'text-studio-gold' : 'text-gray-500'
              }`}
          >
            {activeTab === item.id && !item.primary && (
              <motion.div layoutId="activeMobileTab" className="absolute -top-3 w-1.5 h-1.5 bg-studio-gold rounded-full" />
            )}
            <item.icon size={item.primary ? 28 : 22} strokeWidth={item.primary ? 3 : 2} />
            {!item.primary && <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}