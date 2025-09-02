import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Разрешаем использование внешних пакетов в серверных компонентах
  webpack: (config: any) => {
    config.externals = [...config.externals, "@google/genai"];
    return config;
  },
};

export default nextConfig;
