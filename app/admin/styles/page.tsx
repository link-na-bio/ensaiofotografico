'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
// 👇 Olha o Sparkles adicionado aqui nesta linha!
import { Search, Plus, Trash2, X, UploadCloud, Loader2, Sparkles } from 'lucide-react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleEdit = (style: any) => {
    setIsAddingNew(false);
    setEditingStyle(style);
    setSelectedFile(null);
    setPreviewUrl(style.img_url);
  };

  const closePanel = () => {
    setEditingStyle(null);
    setIsAddingNew(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const titulo = formData.get('titulo') as string;
    const categoria = formData.get('categoria') as string;
    const descricao = formData.get('descricao') as string;
    const genero = formData.get('genero') as string;
    const dica_roupa = formData.get('dica_roupa') as string;

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
        const { error } = await supabase.from('estilos').insert([{ titulo, categoria, descricao, genero, dica_roupa, img_url: finalImgUrl }]);
        if (error) throw error;
        alert('Estilo adicionado com sucesso!');
      } else if (editingStyle) {
        const { error } = await supabase.from('estilos').update({ titulo, categoria, descricao, genero, dica_roupa, img_url: finalImgUrl }).eq('id', editingStyle.id);
        if (error) throw error;
        alert('Estilo atualizado!');
      }

      closePanel();
      fetchStyles();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
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

  return (
    <div className="flex h-screen overflow-hidden bg-studio-black text-white">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-studio-black border-b border-white/5 flex items-center justify-between px-8 bg-gradient-to-b from-white/[0.02] to-transparent sticky top-0 z-50">
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

        <div className="flex-1 overflow-y-auto p-8 bg-[#121212]">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-10">
                <h1 className="text-3xl font-display uppercase tracking-widest font-bold mb-2">Gestão de Estilos</h1>
                <p className="text-slate-500 text-xs tracking-widest uppercase">Curadoria de portfólio para a sua Inteligência Artificial</p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
                {['Todos', 'Retrato', 'Editorial', 'Comercial', 'Evento'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-studio-gold text-studio-black border border-studio-gold' : 'bg-white/5 border border-white/10 text-slate-400 hover:border-studio-gold hover:text-studio-gold'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-studio-gold" size={40} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredStyles.map((style) => (
                    <div key={style.id} className="group bg-studio-black border border-white/10 rounded-none overflow-hidden hover:border-studio-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all flex flex-col">
                      <div className="aspect-[4/5] overflow-hidden relative">
                        <Image
                          src={style.img_url}
                          alt={style.titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-studio-gold text-studio-black text-[9px] font-bold uppercase tracking-widest px-3 py-1.5">{style.categoria}</span>
                          <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5">{style.genero}</span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg font-display uppercase tracking-widest font-bold mb-2">{style.titulo}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-1 line-clamp-3">{style.descricao}</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(style)}
                            className="flex-1 py-3 border border-studio-gold/30 text-studio-gold text-[10px] uppercase tracking-widest font-bold hover:bg-studio-gold hover:text-studio-black transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(style.id)}
                            className="p-3 border border-white/10 text-slate-400 hover:text-rose-500 hover:border-rose-500 hover:bg-rose-500/10 transition-all"
                            title="Apagar estilo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div onClick={handleAddNew} className="border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-12 hover:border-studio-gold hover:bg-studio-gold/5 transition-all cursor-pointer group min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-studio-gold/10 flex items-center justify-center text-studio-gold mb-6 group-hover:scale-110 group-hover:bg-studio-gold group-hover:text-studio-black transition-all">
                      <Plus size={24} />
                    </div>
                    <span className="text-sm font-display uppercase tracking-widest font-bold text-white group-hover:text-studio-gold transition-colors">Adicionar Novo Estilo</span>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2">Expandir o catálogo</p>
                  </div>
                </div>
              )}
            </div>

            {(editingStyle || isAddingNew) && (
              <aside className="w-full lg:w-[400px] shrink-0">
                <form onSubmit={handleSave} className="sticky top-8 bg-studio-black border border-studio-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
                  <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent flex items-center justify-between">
                    <h2 className="text-sm font-display font-bold uppercase tracking-widest text-studio-gold">
                      {isAddingNew ? 'Cadastrar Novo Estilo' : 'Editar Estilo'}
                    </h2>
                    <button type="button" onClick={closePanel} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
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
                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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

                    <div className="space-y-5">
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
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Categoria</label>
                          <select
                            name="categoria"
                            required
                            className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-studio-gold outline-none text-xs font-bold uppercase tracking-widest text-white transition-colors appearance-none cursor-pointer"
                            defaultValue={editingStyle?.categoria || 'Retrato'}
                          >
                            <option value="Retrato">Retrato</option>
                            <option value="Editorial">Editorial</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Evento">Evento</option>
                          </select>
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

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição Comercial</label>
                        <textarea
                          name="descricao"
                          required
                          placeholder="Descreva o impacto visual deste estilo..."
                          className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-studio-gold outline-none text-xs leading-relaxed text-white resize-none transition-colors custom-scrollbar"
                          rows={3}
                          defaultValue={editingStyle?.descricao || ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-studio-gold flex items-center gap-2"><Sparkles size={12} /> Dica de Dress Code (Roupa)</label>
                        <textarea
                          name="dica_roupa"
                          required
                          placeholder="Ex: Use blazers escuros e evite estampas..."
                          className="w-full px-4 py-3 bg-studio-gold/5 border border-studio-gold/30 focus:border-studio-gold outline-none text-xs leading-relaxed text-white resize-none transition-colors custom-scrollbar"
                          rows={3}
                          defaultValue={editingStyle?.dica_roupa || 'Prefira roupas lisas, blazers ou camisas de cores neutras. Evite estampas muito chamativas para um resultado mais elegante com a IA.'}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-studio-gold text-studio-black py-4 font-black uppercase tracking-widest text-[10px] hover:bg-studio-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : 'Salvar no Portfólio'}
                      </button>
                      <button
                        type="button"
                        onClick={closePanel}
                        className="w-full py-4 border border-white/10 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/5 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}