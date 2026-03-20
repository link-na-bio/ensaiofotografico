'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Home,
  Library,
  PlusCircle,
  User,
  Settings,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  X,
  Copy,
  QrCode,
  UploadCloud,
  FileImage
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================================================
// ⚠️ CHAVES PIX REAIS DO VIRTUAL STUDIO ⚠️
// ============================================================================
const PACOTES_INFO: Record<string, { nome: string, preco: number, fotos: number, icon: any, qrCodeImg: string, copiaECola: string }> = {
  'basico': { nome: 'Essencial', preco: 89.90, fotos: 10, icon: User, qrCodeImg: '/pix-essencial.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c520400005303986540589.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B78D' },
  'popular': { nome: 'Premium', preco: 149.90, fotos: 25, icon: Star, qrCodeImg: '/pix-premium.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406149.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304F417' },
  'pro': { nome: 'Elite', preco: 247.90, fotos: 50, icon: Zap, qrCodeImg: '/pix-elite.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406247.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B4F6' },
  // Fallbacks:
  'essencial': { nome: 'Essencial', preco: 89.90, fotos: 10, icon: User, qrCodeImg: '/pix-essencial.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c520400005303986540589.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B78D' },
  'premium': { nome: 'Premium', preco: 149.90, fotos: 25, icon: Star, qrCodeImg: '/pix-premium.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406149.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304F417' },
  'elite': { nome: 'Elite', preco: 247.90, fotos: 50, icon: Zap, qrCodeImg: '/pix-elite.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406247.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B4F6' }
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pedido, setPedido] = useState<any>(null);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);

  // Estados do Modal PIX e Comprovante
  const [showPixModal, setShowPixModal] = useState(false);
  const [isConfirmingPix, setIsConfirmingPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comprovante, setComprovante] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) {
        alert("Pedido não encontrado.");
        router.push('/dashboard');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const currentUserId = session.user.id;
        setUserId(currentUserId);
        setUserEmail(session.user.email ?? '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || null);

        const { data: orderData, error: orderError } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError || !orderData) throw new Error("Erro ao buscar detalhes do pedido.");
        if (orderData.user_id !== currentUserId) throw new Error("Acesso negado.");

        setPedido(orderData);

        const path = `${currentUserId}/${orderId}/`;
        const { data: files, error: filesError } = await supabase.storage.from('previa_ensaios').list(path);
        if (filesError) throw filesError;

        const validFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];
        const urlPromises = validFiles.map(async (file) => {
          const { data, error } = await supabase.storage.from('previa_ensaios').createSignedUrl(`${path}${file.name}`, 3600);
          if (error) throw error;
          return data.signedUrl;
        });

        setPreviewPhotos(await Promise.all(urlPromises));
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderId, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleOpenPix = () => {
    setShowPixModal(true);
  };

  const handleCopyPix = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setComprovante(e.target.files[0]);
    }
  };

  // Confirmação de Pagamento PIX com Upload Obrigatório
  const handleConfirmPix = async () => {
    if (!comprovante) {
      alert("Por favor, anexe a foto ou PDF do comprovante para continuarmos.");
      return;
    }

    setIsConfirmingPix(true);

    try {
      // 1. Upload do comprovante no Bucket
      const fileExt = comprovante.name.split('.').pop();
      const fileName = `comprovante_${orderId}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes_pix')
        .upload(filePath, comprovante);

      if (uploadError) throw uploadError;

      // 2. Disparar a Notificação para o Admin
      await supabase.from('notificacoes_admin').insert({
        user_id: userId,
        user_email: userEmail,
        order_id: orderId,
        pacote: pedido.pacote,
        mensagem: 'Novo PIX para análise com comprovante!'
      });

      // 3. Salvar na tabela de mensagens (para histórico do admin ver o comprovante)
      const { data: { publicUrl } } = supabase.storage.from('comprovantes_pix').getPublicUrl(filePath);
      await supabase.from('mensagens').insert({
        user_id: userId,
        order_id: orderId,
        conteudo: publicUrl,
        tipo: 'comprovante'
      });

      // 4. Mudar o Status do Pedido para Análise
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'Pagamento em Análise' })
        .eq('id', orderId);

      if (error) throw error;

      setShowPixModal(false);
      alert("Comprovante enviado com sucesso! Nossa equipe financeira está conferindo o PIX. Assim que confirmado, suas fotos serão liberadas.");
      router.push('/dashboard');
    } catch (error: any) {
      alert("Erro ao enviar o comprovante: " + error.message);
    } finally {
      setIsConfirmingPix(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-studio-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pacoteInfo = pedido?.pacote ? PACOTES_INFO[pedido.pacote.toLowerCase()] : PACOTES_INFO['premium'];
  const PacoteIcon = pacoteInfo.icon;

  return (
    <div className="flex min-h-screen bg-studio-black text-white font-sans selection:bg-studio-gold selection:text-studio-black">

      {/* 🧭 MODAL PIX COM UPLOAD DE COMPROVANTE 🧭 */}
      {showPixModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-studio-gold/20 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] relative my-8">
            <div className="bg-white/5 border-b border-white/10 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-studio-gold">
                <QrCode size={20} />
                <span className="font-display uppercase tracking-widest font-bold text-sm">Pagamento via PIX</span>
              </div>
              <button onClick={() => setShowPixModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center text-center">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Valor a pagar</h3>
              <p className="text-4xl font-display text-white mb-8">R$ {pacoteInfo.preco.toFixed(2)}</p>

              <div className="bg-white p-4 rounded-xl mb-6">
                <div className="relative w-48 h-48">
                  <Image src={pacoteInfo.qrCodeImg} alt="QR Code PIX" fill className="object-contain" />
                </div>
              </div>

              <div className="w-full space-y-2 mb-8">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold text-left">Ou use o Pix Copia e Cola:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pacoteInfo.copiaECola}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-gray-400 outline-none"
                  />
                  <button
                    onClick={() => handleCopyPix(pacoteInfo.copiaECola)}
                    className="bg-studio-gold/10 border border-studio-gold/30 text-studio-gold px-4 rounded-lg hover:bg-studio-gold hover:text-black transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Área de Upload do Comprovante */}
              <div className="w-full mb-8">
                <input type="file" accept="image/*,.pdf" hidden ref={fileInputRef} onChange={handleFileChange} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${comprovante ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-studio-gold/50 bg-white/5'}`}
                >
                  {comprovante ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <FileImage size={20} />
                      <span className="text-xs font-bold truncate max-w-[200px]">{comprovante.name}</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-gray-400 mb-2" />
                      <p className="text-xs font-bold text-white uppercase tracking-widest">Anexar Comprovante</p>
                      <p className="text-[9px] text-gray-500 mt-1">Obrigatório para liberação do ensaio</p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirmPix}
                disabled={isConfirmingPix || !comprovante}
                className="w-full py-4 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest hover:bg-studio-gold-light transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConfirmingPix ? (
                  <div className="w-5 h-5 border-2 border-studio-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Enviar Comprovante e Finalizar</>
                )}
              </button>
              <p className="text-[9px] text-gray-500 mt-4 max-w-xs leading-relaxed uppercase tracking-widest">
                Após enviar o comprovante, nossa equipe financeira confirmará o recebimento e liberará seu ensaio em instantes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🧭 SIDEBAR DO CLIENTE */}
      <aside className="w-64 border-r border-white/5 bg-studio-black flex flex-col sticky top-0 h-screen hidden md:flex shrink-0">
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
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-studio-gold transition-colors">
              <Home size={18} />
              <span className="text-sm font-medium">Home</span>
            </button>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-studio-gold transition-colors">
              <Library size={18} />
              <span className="text-sm font-medium">Meus Ensaios</span>
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
              <p className="text-sm font-bold truncate font-display tracking-widest">{userEmail ? userEmail.split('@')[0] : 'Usuário'}</p>
            </div>
            <div className="relative flex gap-2">
              <button onClick={handleLogout} title="Sair da conta">
                <LogOut className="text-red-500 cursor-pointer hover:text-red-400 transition-colors" size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 🛒 MAIN CHECKOUT CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#121212] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-studio-black border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
        >
          {/* Header do Checkout */}
          <div className="p-8 border-b border-white/5 bg-white/5 text-center relative z-10">
            <h2 className="text-3xl font-display uppercase tracking-widest mb-2 text-white">Finalizar Ensaio</h2>
            <p className="text-studio-gold font-bold uppercase tracking-widest text-xs">Pedido #{pedido?.id.slice(0, 8)}</p>
          </div>

          <div className="p-8 space-y-10 relative z-10">
            {/* Pacote Selecionado */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-studio-gold/20 relative overflow-hidden text-center flex flex-col items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-studio-gold/10 rounded-full blur-3xl"></div>

              <div className="w-16 h-16 rounded-full bg-studio-gold/10 text-studio-gold flex items-center justify-center border border-studio-gold/30 mb-4">
                <PacoteIcon size={32} />
              </div>

              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Pacote Selecionado</h3>
              <p className="font-display text-3xl uppercase text-white mb-6">{pacoteInfo.nome}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300 w-full text-left max-w-md mx-auto">
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> Até {pacoteInfo.fotos} fotos HD</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> Sem marca d'água</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> Uso comercial livre</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> Entrega instantânea</div>
              </div>
            </div>

            {/* Resumo e Pagamento (PIX) */}
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Investimento Total</span>
                <span className="text-white font-display text-4xl font-black">R$ {pacoteInfo.preco.toFixed(2)}</span>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleOpenPix}
                  className="w-full py-6 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-studio-gold-light hover:scale-[1.02] transition-all rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.3)] text-lg"
                >
                  Pagar Agora via PIX
                  <ArrowRight size={20} />
                </button>

                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] uppercase tracking-widest font-bold tracking-[0.2em]">Pagamento Seguro direto na Conta</span>
                  </div>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider leading-relaxed max-w-xs">
                    As fotos em alta resolução serão liberadas após a confirmação do pagamento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decoração de fundo sutil */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-studio-gold/5 rounded-full blur-3xl -z-0"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-studio-gold/5 rounded-full blur-3xl -z-0"></div>
        </motion.div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-studio-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}