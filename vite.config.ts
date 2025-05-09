import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// 创建时间戳，确保每次构建都生成不同的文件名
const timestamp = new Date().getTime();

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 使用时间戳命名文件
    rollupOptions: {
      output: {
        // 为JS文件添加时间戳
        entryFileNames: `assets/[name]-${timestamp}-[hash].js`,
        chunkFileNames: `assets/[name]-${timestamp}-[hash].js`,
        // 为CSS和其他资源添加时间戳
        assetFileNames: `assets/[name]-${timestamp}-[hash][extname]`
      }
    },
    // 确保生成manifest文件
    manifest: true,
    sourcemap: false
  }
})
