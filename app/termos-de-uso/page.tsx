import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-studio-black text-white py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-studio-gold hover:text-white transition mb-10 text-sm uppercase tracking-widest">
          <ChevronLeft size={16} className="mr-2" />
          Voltar para Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">Termos de Uso</h1>
        
        <div className="text-gray-300 font-light leading-relaxed space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">1. Aceitação dos Termos</h2>
          <p>Ao acessar e operar os serviços do Virtual Studio, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com alguma parte destes termos, não deverá usar nossos serviços.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">2. Descrição do Serviço</h2>
          <p>O Virtual Studio é uma plataforma baseada em Inteligência Artificial que permite aos usuários transformar fotos comuns em retratos profissionais, ensaios e imagens artísticas através de curadoria humana e modelos avançados de IA.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">3. Uso Aceitável e Responsabilidades do Usuário</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Você concorda em fazer o upload apenas de imagens suas ou de pessoas que lhe deram consentimento explícito para tal.</li>
            <li>É estritamente proibido usar nossos serviços para gerar imagens difamatórias, obscenas, ilegais ou que violem os direitos de terceiros.</li>
            <li>Você é responsável por manter a confidencialidade de sua conta e senha.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">4. Propriedade Intelectual</h2>
          <p>Ao utilizar o Virtual Studio, você mantém os direitos autorais das imagens originais enviadas. O Virtual Studio concede a você o direito de uso comercial e pessoal das imagens geradas através da nossa plataforma, desde que geradas em conformidade com estes Termos de Uso.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">5. Pagamentos e Reembolsos</h2>
          <p>Os serviços são cobrados conforme os pacotes detalhados em nosso site. Devido à natureza computacional intensiva da geração de imagens via I.A. (custos de processamento), não oferecemos reembolsos após o processamento das imagens ter sido iniciado.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">6. Modificações no Serviço</h2>
          <p>O Virtual Studio reserva-se o direito de modificar ou descontinuar, temporária ou permanentemente, o serviço com ou sem aviso prévio.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">7. Contato</h2>
          <p>Para dúvidas sobre estes Termos de Uso, entre em contato através do e-mail: <a href="mailto:suporte@virtualstudio.click" className="text-studio-gold hover:underline">suporte@virtualstudio.click</a></p>
        </div>
      </div>
    </div>
  );
}
