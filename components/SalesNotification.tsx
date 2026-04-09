'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, Camera, Palette, Heart } from 'lucide-react';

// Nomes aleatórios para gerar prova social (60 nomes variados)
const NAMES = [
  'Carlos', 'Mariana', 'Pedro', 'Ana', 'Bruno', 'Juliana', 'Roberto', 'Camila',
  'Rafael', 'Amanda', 'Tiago', 'Letícia', 'Felipe', 'Beatriz', 'Eliseu', 'Junio',
  'Eduardo', 'Fernanda', 'Lucas', 'Isabella', 'Gustavo', 'Vitória', 'Rodrigo',
  'Larissa', 'Diego', 'Patrícia', 'Marcelo', 'Natália', 'Leonardo', 'Carolina',
  'André', 'Tatiana', 'Marcos', 'Renata', 'Thiago', 'Daniela', 'João', 'Luana',
  'Matheus', 'Vanessa', 'Gabriel', 'Gabriela', 'Guilherme', 'Priscila', 'Henrique',
  'Aline', 'Caio', 'Thais', 'Vinícius', 'Jessica', 'Arthur', 'Bianca', 'Victor',
  'Laura', 'Samuel', 'Julia', 'Enzo', 'Sofia', 'Igor', 'Alice'
];

// Localizações estratégicas (incluindo o seu reduto, Brasília)
const LOCATIONS = [
  'de Brasília, DF', 'de Águas Claras, DF', 'de Taguatinga, DF',
  'de São Paulo, SP', 'do Rio de Janeiro, RJ', 'de Belo Horizonte, MG',
  'de Lisboa, PT', 'do Porto, PT', 'de Curitiba, PR', 'de Goiânia, GO'
];

// As novas ações alinhadas com o seu modelo de negócio atual!
const ACTIONS = [
  { text: 'acabou de garantir o Pack Essencial (5 Estilos)', icon: Camera, color: 'text-studio-gold' },
  { text: 'montou um combo personalizado de 3 Estilos', icon: Camera, color: 'text-white' },
  { text: 'elevou a sua imagem com o Pack Premium (10 Fotos)', icon: Sparkles, color: 'text-studio-gold' },
  { text: 'solicitou uma Direção de Arte Sob Medida 💎', icon: Palette, color: 'text-blue-400' },
  { text: 'aproveitou o Especial de Dia das Mães 🌹', icon: Heart, color: 'text-pink-400' },
  { text: 'garantiu o Pack Elite para Rebranding Total ⚡', icon: Sparkles, color: 'text-emerald-400' }
];

export default function SalesNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const triggerRandomNotification = () => {
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

      setNotification({ name: randomName, location: randomLocation, action: randomAction });
      setIsVisible(true);

      // Esconde a notificação após 6 segundos para dar tempo de ler
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Inicia o ciclo: primeira notificação aparece entre 3 e 8 segundos após entrar no site
    const initialTimer = setTimeout(() => {
      triggerRandomNotification();

      // Depois da primeira, continua a mostrar a cada 15 a 35 segundos
      const interval = setInterval(() => {
        triggerRandomNotification();
      }, Math.floor(Math.random() * 20000) + 15000);

      return () => clearInterval(interval);
    }, Math.floor(Math.random() * 5000) + 3000);

    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          // Notification fica no canto inferior esquerdo
          className="fixed bottom-6 left-6 z-[100] max-w-sm bg-[#121212]/95 backdrop-blur-md border border-studio-gold/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-start gap-4 cursor-default"
        >
          <div className="w-10 h-10 rounded-full bg-studio-gold/10 border border-studio-gold/30 flex items-center justify-center shrink-0 mt-1">
            <notification.action.icon size={18} className={notification.action.color} />
          </div>
          <div>
            <p className="text-sm text-white font-medium">
              <span className="font-bold">{notification.name}</span> <span className="text-gray-400 text-xs font-light tracking-wide">{notification.location}</span>
            </p>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              {notification.action.text}
            </p>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2 font-bold flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-500" /> Compra Verificada
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}