'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Home, Library, LogOut, ArrowRight, ShieldCheck, Zap, Star,
  CheckCircle2, X, Copy, QrCode, UploadCloud, FileImage, Sparkles, User
} from 'lucide-react';
import { motion } from 'motion/react';

// Chave Real do Bruno (Extraída do Payload antigo)
const CHAVE_PIX_REAL = '23333811-9c37-469e-8979-d1eaa57e781c';

// Legado para pedidos antigos
const PACOTES_INFO: Record<string, any> = {
  'basico': { nome: 'Essencial', preco: 89.90, fotos: 10, icon: User, qrCodeImg: '/pix-essencial.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c520400005303986540589.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B78D' },
  'popular': { nome: 'Premium', preco: 149.90, fotos: 25, icon: Star, qrCodeImg: '/pix-premium.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406149.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304F417' },
  'pro': { nome: 'Elite', preco: 247.90, fotos: 50, icon: Zap, qrCodeImg: '/pix-elite.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406247.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B4F6' },
  'essencial': { nome: 'Essencial', preco: 89.90, fotos: 10, icon: User, qrCodeImg: '/pix-essencial.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c520400005303986540589.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B78D' },
  'premium': { nome: 'Premium', preco: 149.90, fotos: 25, icon: Star, qrCodeImg: '/pix-premium.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406149.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304F417' },
  'elite': { nome: 'Elite', preco: 247.90, fotos: 50, icon: Zap, qrCodeImg: '/pix-elite.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c5204000053039865406247.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62170513VIRTUALSTUDIO6304B4F6' },
  'amostra': { nome: 'Amostra VIP', preco: 19.90, fotos: 1, icon: Sparkles, qrCodeImg: '/pix-amostra.png', copiaECola: '00020126580014br.gov.bcb.pix013623333811-9c37-469e-8979-d1eaa57e781c520400005303986540519.905802BR5924BRUNO ADRIANO COSTA REIS6008BRASILIA62180514AMOSTRAPREMIUM6304AD85' }
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
  const [dynamicPrices, setDynamicPrices] = useState<any>(null);
  const [infoCalculada, setInfoCalculada] = useState<any>(null);

  // Estados do Modal PIX
  const [showPixModal, setShowPixModal] = useState(false);
  const [isConfirmingPix, setIsConfirmingPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comprovante, setComprovante] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) { alert("Pedido não encontrado."); router.push('/dashboard'); return; }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        setUserId(session.user.id);
        setUserEmail(session.user.email ?? '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || null);

        const { data: orderData, error: orderError } = await supabase.from('pedidos').select('*').eq('id', orderId).single();
        if (orderError || !orderData || orderData.user_id !== session.user.id) throw new Error("Acesso negado.");

        setPedido(orderData);

        const { data: configData } = await supabase.from('plataforma_config').select('*').eq('id', 1).single();
        if (configData) setDynamicPrices(configData);

      } catch (error: any) {
        alert(error.message); router.push('/dashboard');
      } finally { setIsLoading(false); }
    };
    loadData();
  }, [orderId, router]);

  // Motor de Cálculo Inteligente
  useEffect(() => {
    if (!pedido) return;

    const parsePrice = (val: any, fallback: number) => {
      if (!val) return fallback;
      if (typeof val === 'number') return val;
      const num = parseFloat(String(val).replace(',', '.').replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? fallback : num;
    };

    const pkgNome = pedido.pacote?.toLowerCase() || '';
    const isLegacy = !pkgNome.includes('dinamico_') && !pkgNome.includes('sazonal') && !pkgNome.includes('extras');

    if (isLegacy) {
      // Regra Antiga (Usa QR Code estático e Preço Estático Fixo para não haver divergência)
      const baseInfo = PACOTES_INFO[pkgNome] || PACOTES_INFO['premium'];
      setInfoCalculada({ ...baseInfo, isLegacy: true });
    } else {
      // Regra Nova (À La Carte Dinâmico)
      const estilos = (pedido.fotos_selecionadas && pedido.fotos_selecionadas.length > 0) 
        ? pedido.fotos_selecionadas 
        : (pedido.estilos || []);
      const hasSobMedida = estilos.includes('ESTILO_SOBMEDIDA');
      
      // Filtra estilos normais (excluindo o Sob Medida)
      const estilosNormais = estilos.filter((s: string) => s !== 'ESTILO_SOBMEDIDA');
      const qtdNormais = estilosNormais.length;

      const pBase = parsePrice(dynamicPrices?.preco_amostra, 19.90);
      const pEssencial = parsePrice(dynamicPrices?.preco_essencial, 67.90) / 5;
      const pPremium = parsePrice(dynamicPrices?.preco_premium, 97.90) / 10;
      const pElite = parsePrice(dynamicPrices?.preco_elite, 147.90) / 20;

      let precoUnitarioNormais = pBase;
      let nomePlano = 'Amostra / Avulso';
      let icon = Sparkles;

      if (qtdNormais >= 20) { precoUnitarioNormais = pElite; nomePlano = 'Pack Elite'; icon = Zap; }
      else if (qtdNormais >= 10) { precoUnitarioNormais = pPremium; nomePlano = 'Pack Premium'; icon = Star; }
      else if (qtdNormais >= 5) { precoUnitarioNormais = pEssencial; nomePlano = 'Pack Essencial'; icon = User; }

      if (pkgNome.includes('sazonal')) nomePlano = 'Edição Especial';

      // Cálculo Final
      const valorNormais = qtdNormais * precoUnitarioNormais;
      const valorSobMedida = hasSobMedida ? 69.90 : 0;
      const totalFinal = valorNormais + valorSobMedida;

      // Nome do plano composto se houver ambos
      let nomeExibicao = nomePlano;
      if (hasSobMedida) {
        nomeExibicao = qtdNormais > 0 ? `${nomePlano} + Sob Medida` : 'Direção de Arte Sob Medida';
        icon = Sparkles;
      }

      setInfoCalculada({
        nome: nomeExibicao,
        preco: totalFinal,
        fotos: estilos.length,
        icon: icon,
        isLegacy: false,
        hasSobMedida: hasSobMedida,
        valorSobMedida: valorSobMedida,
        valorNormais: valorNormais
      });
    }
  }, [pedido, dynamicPrices]);

  // A FUNÇÃO QUE FALTAVA
  const handleOpenPix = () => { setShowPixModal(true); };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };
  const handleCopyPix = (codigo: string) => { navigator.clipboard.writeText(codigo); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) setComprovante(e.target.files[0]); };

  const handleConfirmPix = async () => {
    if (!comprovante) { alert("Anexe o comprovativo para continuarmos."); return; }
    setIsConfirmingPix(true);

    try {
      const fileExt = comprovante.name.split('.').pop();
      const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage.from('comprovantes_pix').upload(filePath, comprovante);
      if (uploadError) throw uploadError;

      await supabase.from('notificacoes_admin').insert({ user_id: userId, user_email: userEmail, order_id: orderId, pacote: pedido.pacote, mensagem: 'Novo PIX para análise!' });

      const { data: { publicUrl } } = supabase.storage.from('comprovantes_pix').getPublicUrl(filePath);
      await supabase.from('mensagens').insert({ user_id: userId, order_id: orderId, conteudo: publicUrl, tipo: 'comprovante' });

      const { error } = await supabase.from('pedidos').update({ status: 'Pagamento em Análise' }).eq('id', orderId);
      if (error) throw error;

      const discordWebhookUrl = 'https://discord.com/api/webhooks/1492131248091435170/l4cqtcHnLulXpEDka8bsSon81D2_8OY5e5vP3kxlbI6UcIb5KOSIHmhwivBqPsDmuHdU';
      const mensagemDiscord = `@everyone 💸 **NOVO PIX RECEBIDO!** 💸\n👤 **Cliente:** ${userEmail}\n💰 Verifique o comprovante no Painel Admin e libere as fotos em alta resolução!`;
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: mensagemDiscord })
        });
      } catch (e) {
        console.error("Falha ao notificar o Discord", e);
      }

      setShowPixModal(false);
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (error: any) {
      alert("Erro ao enviar: " + error.message);
    } finally { setIsConfirmingPix(false); }
  };

  if (isLoading || !infoCalculada) return <div className="min-h-screen bg-studio-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div></div>;

  const PacoteIcon = infoCalculada.icon;

  return (
    <div className="flex min-h-screen bg-studio-black text-white font-sans selection:bg-studio-gold selection:text-studio-black">

      {/* MODAL PIX */}
      {showPixModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-studio-gold/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] relative my-auto">
            <div className="bg-white/5 border-b border-white/10 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-studio-gold"><QrCode size={20} /><span className="font-display uppercase tracking-widest font-bold text-sm">Pagamento via PIX</span></div>
              <button onClick={() => setShowPixModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">Valor a pagar</h3>
              <p className="text-3xl font-display text-white mb-6">R$ {infoCalculada.preco.toFixed(2).replace('.', ',')}</p>

              {infoCalculada.isLegacy && infoCalculada.qrCodeImg ? (
                // UI PARA PEDIDOS ANTIGOS (COM QR CODE)
                <>
                  <div className="bg-white p-3 rounded-xl mb-4">
                    <div className="relative w-40 h-40"><Image src={infoCalculada.qrCodeImg} alt="QR Code PIX" fill className="object-contain" /></div>
                  </div>
                  <div className="w-full space-y-2 mb-6">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold text-left px-1">Ou use o Pix Copia e Cola:</p>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={infoCalculada.copiaECola} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] text-gray-400 outline-none" />
                      <button onClick={() => handleCopyPix(infoCalculada.copiaECola)} className="bg-studio-gold/10 border border-studio-gold/30 text-studio-gold px-4 rounded-lg hover:bg-studio-gold hover:text-black transition-all flex items-center justify-center shrink-0">{copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}</button>
                    </div>
                  </div>
                </>
              ) : (
                // UI PARA PEDIDOS NOVOS (DINÂMICOS) - CHAVE PIX DIRETA
                <div className="w-full space-y-4 mb-6 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl mb-2">
                    <div className="relative w-40 h-40"><Image src="/pix-geral.png" alt="QR Code PIX General" fill className="object-contain" /></div>
                  </div>
                  <div className="bg-studio-gold/10 border border-studio-gold/30 p-4 rounded-xl text-left w-full">
                    <p className="text-[10px] text-studio-gold uppercase tracking-widest font-bold mb-2">Instruções de Pagamento:</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-light mb-4">1. Escaneie o QR Code acima ou use a chave aleatória.<br />2. Se optar pela chave, cole-a no seu banco.<br />3. Digite o valor exato de <strong>R$ {infoCalculada.preco.toFixed(2).replace('.', ',')}</strong>.</p>

                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Chave PIX Aleatória:</p>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={CHAVE_PIX_REAL} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-gray-300 outline-none" />
                      <button onClick={() => handleCopyPix(CHAVE_PIX_REAL)} className="bg-studio-gold text-black px-3 rounded-lg hover:bg-studio-gold-light transition-all flex items-center justify-center shrink-0">{copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}</button>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-2">Favorecido: Bruno Adriano Costa Reis</p>
                  </div>
                </div>

              )}

              {/* Upload do Comprovante (com o nome também limpo) */}
              <div className="w-full mb-8">
                <input type="file" accept="image/*,.pdf" hidden ref={fileInputRef} onChange={handleFileChange} />
                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${comprovante ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-studio-gold/50 bg-white/5'}`}>
                  {comprovante ? (
                    <div className="flex items-center gap-2 text-emerald-400"><FileImage size={20} /><span className="text-xs font-bold truncate max-w-[200px]">{comprovante.name}</span></div>
                  ) : (
                    <><UploadCloud size={24} className="text-gray-400 mb-2" /><p className="text-xs font-bold text-white uppercase tracking-widest">Anexar Comprovante</p><p className="text-[9px] text-gray-500 mt-1">Obrigatório para liberação</p></>
                  )}
                </div>
              </div>

              <button onClick={handleConfirmPix} disabled={isConfirmingPix || !comprovante} className="w-full py-4 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest hover:bg-studio-gold-light transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {isConfirmingPix ? <div className="w-5 h-5 border-2 border-studio-black border-t-transparent rounded-full animate-spin"></div> : <>Finalizar Compra</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DO CLIENTE */}
      <aside className="w-64 border-r border-white/5 bg-studio-black flex flex-col sticky top-0 h-screen hidden md:flex shrink-0">
        <div className="p-6">
        <div className="p-8 flex flex-col items-center text-center border-b border-white/5 mb-4">
          <div className="flex flex-col items-center">
            <div className="relative w-[150px] h-[150px] -mt-[40px] -mb-[60px] flex items-center justify-center pointer-events-none">
              <Image src="/logo.2.png" alt="Virtual Studio Logo" fill className="object-contain" priority />
            </div>
            <div className="h-[1px] w-2/3 bg-gradient-to-r from-transparent via-studio-gold/50 to-transparent mt-2 mb-1"></div>
            <p className="text-studio-gold text-[14px] uppercase tracking-widest font-bold">Checkout</p>
          </div>
        </div>
          <nav className="flex flex-col gap-1">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-studio-gold transition-colors"><Home size={18} /><span className="text-sm font-medium">Home</span></button>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
              <img
                src={avatarUrl?.startsWith('http') ? avatarUrl : (avatarUrl ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}` : '')}
                alt="Perfil"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate font-display tracking-widest">{userEmail ? userEmail.split('@')[0] : 'Usuário'}</p></div>
            <button onClick={handleLogout} title="Sair da conta"><LogOut className="text-red-500 hover:text-red-400 transition-colors" size={18} /></button>
          </div>
        </div>
      </aside>

      {/* MAIN CHECKOUT CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#121212] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl bg-studio-black border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
          <div className="p-8 border-b border-white/5 bg-white/5 text-center relative z-10">
            <h2 className="text-3xl font-display uppercase tracking-widest mb-2 text-white">Finalizar Ensaio</h2>
            <p className="text-studio-gold font-bold uppercase tracking-widest text-xs">Pedido #{pedido?.id.slice(0, 8)}</p>
          </div>

          <div className="p-8 space-y-10 relative z-10">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-studio-gold/20 relative overflow-hidden text-center flex flex-col items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-studio-gold/10 rounded-full blur-3xl"></div>
              <div className="mb-6 relative">
                <img src="/logo.2.png" alt="Logo" className="w-[180px] h-auto object-contain mx-auto drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]" />
              </div>
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">{infoCalculada.isLegacy ? 'Pacote' : 'Combo'} Selecionado</h3>
              <p className="font-display text-3xl uppercase text-white mb-6">{infoCalculada.nome}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300 w-full text-left max-w-md mx-auto">
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> {infoCalculada.fotos} fotos HD Inclusas</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> Sem marca d'água</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> Uso comercial livre</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-studio-gold" /> Liberação via PIX</div>
              </div>
            </div>

            <div className="space-y-6">
              {infoCalculada.hasSobMedida && infoCalculada.valorNormais > 0 && (
                <div className="space-y-2 border-b border-white/5 pb-4">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    <span>{infoCalculada.nome.split(' + ')[0]}</span>
                    <span>R$ {infoCalculada.valorNormais.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-studio-gold font-bold">
                    <span>Direção de Arte Sob Medida 💎</span>
                    <span>R$ 69,90</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Investimento Total</span>
                <span className="text-white font-display text-4xl font-black">R$ {infoCalculada.preco.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="space-y-4">
                <button onClick={handleOpenPix} className="w-full py-6 bg-studio-gold text-studio-black font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-studio-gold-light hover:scale-[1.02] transition-all rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.3)] text-lg">
                  Pagar Agora via PIX <ArrowRight size={20} />
                </button>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] uppercase tracking-widest font-bold tracking-[0.2em]">Pagamento Seguro</span>
                  </div>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider leading-relaxed max-w-xs">As fotos em alta resolução serão liberadas após a confirmação do seu comprovante.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-studio-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-studio-gold border-t-transparent rounded-full animate-spin"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}