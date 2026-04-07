'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, Plus, Trash2, X, UploadCloud, Loader2, Sparkles, Copy, CheckCheck, Eye, EyeOff } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { supabase } from '@/lib/supabaseClient';

export default function AdminStyles() {
  const [styles, setStyles] = useState<any[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editingStyle, setEditingStyle] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Estado para feedback visual ao copiar o prompt
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const uniqueCategories = Array.from(new Set(styles.map(s => s.categoria))).filter(Boolean) as string[];
  const allCategories = uniqueCategories.sort();
  const filterCategories = ['Todos', ...allCategories];

  const fetchStyles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('estilos').select('*').order('criado_em', { ascending: false });
    if (!error && data) {
      setStyles(data);
      setFilteredStyles(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  useEffect(() => {
    let result = styles;
    if (activeCategory !== 'Todos') {
      result = result.filter(s => s.categoria === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(s => s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || s.descricao.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredStyles(result);
  }, [searchQuery, activeCategory, styles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddNew = () => {
    setEditingStyle(null);
    setIsAddingNew(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowNewCategoryInput(allCategories.length === 0);
  };

  const handleEdit = (style: any) => {
    setIsAddingNew(false);
    setEditingStyle(style);
    setSelectedFile(null);
    setPreviewUrl(style.img_url);
    setShowNewCategoryInput(false);
  };

  const closePanel = () => {
    setEditingStyle(null);
    setIsAddingNew(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowNewCategoryInput(false);
  };

  const handleCopyPrompt = (promptText: string, id: string) => {
    if (!promptText) {
      alert("Este estilo ainda não possui um prompt de IA salvo.");
      return;
    }
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const titulo = formData.get('titulo') as string;
    const categoriaSelect = formData.get('categoria_select') as string;
    const categoriaInput = formData.get('categoria_input') as string;
    const categoria = showNewCategoryInput ? categoriaInput.trim() : categoriaSelect;
    const descricao = formData.get('descricao') as string;
    const genero = formData.get('genero') as string;
    const dica_roupa = formData.get('dica_roupa') as string;
    const prompt = formData.get('prompt') as string; // NOVO CAMPO DE PROMPT

    try {
      let finalImgUrl = editingStyle?.img_url || '';

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('estilos_imagens').upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('estilos_imagens').getPublicUrl(fileName);
        finalImgUrl = publicUrl;
      }

      if (!finalImgUrl && isAddingNew) {
        alert("Por favor, adicione uma imagem para o novo estilo.");
        setIsSaving(false);
        return;
      }

      if (isAddingNew) {
        // Inserindo o novo campo 'prompt' no banco de dados
        const { error } = await supabase.from('estilos').insert([{ titulo, categoria, descricao, genero, dica_roupa, prompt, img_url: finalImgUrl }]);
        if (error) throw error;
        alert('Estilo adicionado com sucesso!');
      } else if (editingStyle) {
        // Atualizando o campo 'prompt' no banco de dados
        const { error } = await supabase.from('estilos').update({ titulo, categoria, descricao, genero, dica_roupa, prompt, img_url: finalImgUrl }).eq('id', editingStyle.id);
        if (error) throw error;
        alert('Estilo atualizado!');
      }

      closePanel();
      fetchStyles();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message + '\n\nVerifique se criou a coluna "prompt" na tabela estilos do Supabase!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este estilo do portfólio?')) return;
    try {
      const { error } = await supabase.from('estilos').delete().eq('id', id);
      if (error) throw error;
      fetchStyles();
      if (editingStyle?.id === id) closePanel();
    } catch (err: any) {
      alert('Erro ao apagar: ' + err.message);
    }
  };

  const handleDeleteCategory = async () => {
    if (activeCategory === 'Todos') return;

    const count = styles.filter(s => s.categoria === activeCategory).length;

    if (!confirm(`ATENÇÃO: Tem certeza que deseja apagar a categoria "${activeCategory}" e TODOS os seus ${count} estilos vinculados? Esta ação é irreversível e excluirá as imagens do portfólio.`)) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.from('estilos').delete().eq('categoria', activeCategory);
      if (error) throw error;

      alert(`Categoria e todos os seus estilos apagados com sucesso!`);
      setActiveCategory('Todos');
      fetchStyles();
    } catch (err: any) {
      alert('Erro ao apagar categoria: ' + err.message);
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('estilos').update({ ativo: !currentStatus }).eq('id', id);
      if (error) {
        if (error.message.includes("ativo")) {
          alert('Por favor, crie a coluna "ativo" (tipo boolean, default: true) na tabela "estilos" no Supabase!');
          return;
        }
        throw error;
      }
      fetchStyles();
    } catch (err: any) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-studio-black border-b border-white/5 flex items-center justify-between px-4 pr-16 md:px-8 bg-gradient-to-b from-white/[0.02] to-transparent sticky top-0 z-50">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-none text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-studio-gold transition-all outline-none text-white"
                placeholder="Pesquisar estilos..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleAddNew} className="h-10 px-6 bg-studio-gold text-studio-black rounded-none text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-studio-gold-light transition-all font-display shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Plus size={16} />
              Novo Estilo
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 bg-[#121212]">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-10">
                <h1 className="text-3xl font-display uppercase tracking-widest font-bold mb-2">Gestão de Estilos</h1>
                <p className="text-slate-500 text-xs tracking-widest uppercase">Curadoria de portfólio para a sua Inteligência Artificial</p>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-full sm:max-w-xs">
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full h-full min-h-[44px] px-4 pr-10 bg-[#121212] border border-white/10 rounded-none focus:border-studio-gold outline-none text-[10px] font-bold uppercase tracking-widest text-white transition-colors appearance-none cursor-pointer"
                  >
                    {filterCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat?.toLowerCase()?.includes('executivo') ? 'Executivo/Corporativo' : cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-studio-gold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {activeCategory !== 'Todos' && (
                  <button
                    onClick={handleDeleteCategory}
                    className="h-[44px] px-4 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-none text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                    title={`Excluir categoria ${activeCategory} e todos seus estilos`}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Excluir Categoria</span>
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-studio-gold" size={40} /></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredStyles.map((style) => (
                    <div key={style.id} className={`group bg-studio-black border border-white/10 rounded-none overflow-hidden hover:border-studio-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all flex flex-col ${style.ativo === false ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}>
                      <div className="aspect-[4/5] overflow-hidden relative">
                        {style.img_url ? (
                          <Image
                            src={style.img_url}
                            alt={style.titulo}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <span className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">Sem imagem</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {style.ativo === false && (
                            <span className="bg-rose-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1">Inativo</span>
                          )}
                          <span className="bg-studio-gold text-studio-black text-[8px] font-bold uppercase tracking-widest px-2 py-1">{style.categoria?.toLowerCase()?.includes('executivo') ? 'Executivo/Corporativo' : style.categoria}</span>
                          <span className="hidden sm:inline-block bg-black/60 backdrop-blur-md border border-white/10 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1">{style.genero}</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-display uppercase tracking-widest font-bold mb-3 truncate">{style.titulo}</h3>

                        {/* NOVO BOTÃO DE COPIAR PROMPT AQUI */}
                        <div className="mb-4 mt-auto">
                          <button
                            onClick={() => handleCopyPrompt(style.prompt, style.id)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 rounded-sm"
                          >
                            {copiedId === style.id ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} className="text-studio-gold" />}
                            {copiedId === style.id ? <span className="text-emerald-400">Prompt Copiado!</span> : 'Copiar Prompt da IA'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                          <button
                            onClick={() => handleEdit(style)}
                            className="flex-1 py-2 border border-studio-gold/30 text-studio-gold text-[9px] uppercase tracking-widest font-bold hover:bg-studio-gold hover:text-studio-black transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(style.id, style.ativo !== false)}
                            className={`p-2 border border-white/10 transition-all ${
                              style.ativo !== false
                                ? 'text-studio-gold hover:text-white hover:border-white hover:bg-white/10'
                                : 'text-slate-500 hover:text-studio-gold hover:border-studio-gold hover:bg-studio-gold/10'
                            }`}
                            title={style.ativo !== false ? "Desativar estilo (ocultar dos clientes)" : "Ativar estilo (visível aos clientes)"}
                          >
                            {style.ativo !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(style.id)}
                            className="p-2 border border-white/10 text-slate-400 hover:text-rose-500 hover:border-rose-500 hover:bg-rose-500/10 transition-all"
                            title="Apagar estilo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div onClick={handleAddNew} className="border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-6 hover:border-studio-gold hover:bg-studio-gold/5 transition-all cursor-pointer group min-h-[250px] aspect-[4/5]">
                    <div className="w-12 h-12 rounded-full bg-studio-gold/10 flex items-center justify-center text-studio-gold mb-4 group-hover:scale-110 group-hover:bg-studio-gold group-hover:text-studio-black transition-all">
                      <Plus size={20} />
                    </div>
                    <span className="text-xs font-display uppercase tracking-widest font-bold text-white group-hover:text-studio-gold transition-colors text-center leading-tight">Adicionar Estilo</span>
                    <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-2 text-center">Expandir catálogo</p>
                  </div>
                </div>
              )}
            </div>

            {(editingStyle || isAddingNew) && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <form ref={formRef} key={editingStyle?.id || (isAddingNew ? 'new' : 'empty')} onSubmit={handleSave} className="w-full max-w-4xl bg-studio-black border border-studio-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] rounded-md flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-display font-bold uppercase tracking-widest text-studio-gold">
                      {isAddingNew ? 'Cadastrar Novo Estilo' : 'Editar Estilo'}
                    </h2>
                    <button type="button" onClick={closePanel} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-500/10 rounded-full">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col md:flex-row gap-8">
                    {/* LEFTSIDE: Image */}
                    <div className="w-full md:w-[320px] shrink-0 space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between">
                        Imagem de Referência
                        {!previewUrl && <span className="text-rose-500">*Obrigatório</span>}
                      </label>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group aspect-[4/5] bg-[#121212] overflow-hidden border border-white/10 hover:border-studio-gold transition-colors cursor-pointer flex flex-col items-center justify-center"
                      >
                        {previewUrl ? (
                          <>
                            <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-sm">
                              <UploadCloud size={32} className="text-studio-gold mb-2" />
                              <span className="text-white text-[10px] font-bold uppercase tracking-widest">Trocar Imagem</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={32} className="text-slate-600 mb-3 group-hover:text-studio-gold transition-colors" />
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-studio-gold transition-colors">Clique para enviar imagem</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* RIGHTSIDE: Inputs */}
                    <div className="flex-1 flex flex-col space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nome do Estilo</label>
                        <input
                          name="titulo"
                          required
                          className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-studio-gold outline-none text-xs font-bold uppercase tracking-widest text-white transition-colors"
                          type="text"
                          placeholder="Ex: Retrato Corporativo"
                          defaultValue={editingStyle?.titulo || ''}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {!showNewCategoryInput ? (
                            <>
                              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between text-slate-400">
                                <span>Categoria</span>
                                <button
                                  type="button"
                                  onClick={() => setShowNewCategoryInput(true)}
                                  className="text-studio-gold hover:text-white transition-colors flex items-center gap-1"
                                  title="Criar Nova Categoria"
                                >
                                  <Plus size={12} /> Nova
                                </button>
                              </label>
                              <select
                                name="categoria_select"
                                required
                                className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-studio-gold outline-none text-xs font-bold uppercase tracking-widest text-white transition-colors appearance-none cursor-pointer"
                                defaultValue={editingStyle?.categoria || (allCategories.length > 0 ? allCategories[0] : '')}
                              >
                                {allCategories.map(cat => <option key={cat} value={cat}>{cat?.toLowerCase()?.includes('executivo') ? 'Executivo/Corporativo' : cat}</option>)}
                              </select>
                            </>
                          ) : (
                            <>
                              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between text-studio-gold">
                                <span>Nova Categoria</span>
                                <button
                                  type="button"
                                  onClick={() => setShowNewCategoryInput(false)}
                                  className="text-rose-500 hover:text-white transition-colors flex items-center gap-1"
                                  title="Cancelar e Selecionar Existente"
                                >
                                  <X size={12} /> Cancelar
                                </button>
                              </label>
                              <input
                                name="categoria_input"
                                required
                                autoFocus
                                className="w-full px-4 py-3 bg-[#121212] border border-studio-gold outline-none text-xs font-bold uppercase tracking-widest text-white transition-colors"
                                type="text"
                                placeholder="Digite a nova categoria..."
                              />
                            </>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gênero</label>
                          <select
                            name="genero"
                            required
                            className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-studio-gold outline-none text-xs font-bold uppercase tracking-widest text-white transition-colors appearance-none cursor-pointer"
                            defaultValue={editingStyle?.genero || 'Ambos'}
                          >
                            <option value="Ambos">Ambos</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                          </select>
                        </div>
                      </div>

                      {/* NOVO CAMPO: PROMPT DE IA */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Sparkles size={12} className="text-studio-gold" /> Prompt de Geração (IA)
                        </label>
                        <textarea
                          name="prompt"
                          placeholder="Cole aqui o prompt em inglês da Midjourney/Stable Diffusion..."
                          className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-studio-gold outline-none text-xs leading-relaxed text-white resize-none transition-colors custom-scrollbar font-mono"
                          rows={3}
                          defaultValue={editingStyle?.prompt || ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição Comercial (Para o cliente)</label>
                        <textarea
                          name="descricao"
                          required
                          placeholder="Descreva o impacto visual deste estilo para o cliente..."
                          className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-studio-gold outline-none text-xs leading-relaxed text-white resize-none transition-colors custom-scrollbar"
                          rows={2}
                          defaultValue={editingStyle?.descricao || ''}
                        />
                      </div>

                      <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-studio-gold flex items-center gap-2 mb-2"><Sparkles size={12} /> Dica de Dress Code (Roupa)</label>
                        <textarea
                          name="dica_roupa"
                          required
                          placeholder="Ex: Use blazers escuros e evite estampas..."
                          className="w-full flex-1 min-h-[60px] px-4 py-3 bg-studio-gold/5 border border-studio-gold/30 focus:border-studio-gold outline-none text-xs leading-relaxed text-white resize-none transition-colors custom-scrollbar"
                          defaultValue={editingStyle?.dica_roupa || 'Prefira roupas lisas, blazers ou camisas de cores neutras. Evite estampas muito chamativas para um resultado mais elegante com a IA.'}
                        />
                      </div>

                      <div className="pt-6 border-t border-white/5 flex gap-4 mt-auto shrink-0">
                        <button
                          type="button"
                          onClick={closePanel}
                          className="flex-1 py-4 border border-white/10 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/5 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex-[2] bg-studio-gold text-studio-black py-4 font-black uppercase tracking-widest text-[10px] hover:bg-studio-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="animate-spin" size={16} /> : 'Salvar no Portfólio'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}