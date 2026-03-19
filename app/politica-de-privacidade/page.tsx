import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen bg-studio-black text-white py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-studio-gold hover:text-white transition mb-10 text-sm uppercase tracking-widest">
          <ChevronLeft size={16} className="mr-2" />
          Voltar para Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">Política de Privacidade</h1>

        <div className="text-gray-300 font-light leading-relaxed space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">1. Introdução</h2>
          <p>O Virtual Studio respeita a sua privacidade e está comprometido em proteger seus dados pessoais. Esta política de privacidade informará como cuidamos dos seus dados pessoais quando você visita nosso site e utiliza nossos serviços baseados em Inteligência Artificial.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">2. Dados que Coletamos</h2>
          <p>Para fornecer nossos serviços, podemos coletar, usar e armazenar os seguintes tipos de dados pessoais:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Imagens Faciais:</strong> As fotos que você faz o upload para gerar o modelo de IA focado no seu rosto.</li>
            <li><strong>Dados de Identidade e Contato:</strong> Nome, endereço de e-mail e dados de login.</li>
            <li><strong>Dados Técnicos:</strong> Endereço IP, tipo e versão do navegador, sistema operacional e plataforma.</li>
            <li><strong>Dados de Transação:</strong> Detalhes sobre os pagamentos e pacotes adquiridos.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">3. Como Usamos Imagens e IA</h2>
          <p>O processamento de imagens é o núcleo do nosso serviço. Seus dados faciais são usados <strong>exclusivamente</strong> para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Treinar um modelo de IA temporário e personalizado para criar o seu ensaio fotográfico.</li>
            <li>Aplicar a curadoria humana em nossa plataforma para garantir os melhores resultados.</li>
          </ul>
          <p className="font-bold text-studio-gold">As imagens originais e os modelos faciais gerados não são vendidos, fornecidos ou utilizados para treinar as IAs de outras empresas de forma pública. Nossos servidores descartam os dados do modelo permanentemente após o uso ou em um período de tempo determinado pelas nossas rotinas de limpeza.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">4. Segurança de Dados</h2>
          <p>Implementamos medidas de segurança apropriadas para evitar que seus dados pessoais sejam acidentalmente perdidos, usados ou acessados de forma não autorizada, alterados ou divulgados. O acesso aos seus dados é limitado aos nossos serviços.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">5. Retenção de Dados</h2>
          <p>Nós reteremos seus dados pessoais apenas pelo tempo necessário para cumprir os propósitos para os quais os coletamos, inclusive para fins de atender a quaisquer requisitos legais, contábeis ou de relatórios.</p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4 font-display">6. Seus Direitos Legais</h2>
          <p>Sob certas circunstâncias, você tem direitos sob as leis de proteção de dados em relação aos seus dados pessoais, incluindo o direito de solicitar acesso, correção, apagamento (Direito ao Esquecimento) e restrição de processamento de seus dados pessoais.</p>

          <p className="mt-8 text-center border-t border-white/10 pt-8">Para exercer seus direitos ou para qualquer dúvida relacionada à privacidade, entre em contato através do e-mail: <a href="mailto:suporte@virtualstudio.click" className="text-studio-gold hover:underline">suporte@virtualstudio.click</a></p>
        </div>
      </div>
    </div>
  );
}
