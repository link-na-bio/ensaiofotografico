import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Os dois asteriscos autorizam qualquer imagem segura (https) a ser exibida, resolvendo para o Placehold e Supabase de uma vez só!
      },
    ],
  },
};

export default nextConfig;