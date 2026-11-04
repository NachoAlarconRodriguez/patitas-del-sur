import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mpOrderHandler from './api/mercadopago-order.js';
import mpWebhookHandler from './api/mercadopago-webhook.js';

// Plugin local para emular los endpoints serverless de Mercado Pago durante `npm run dev`
function mercadoPagoLocalApiPlugin() {
  const wrapServerless = (handler) => async (req, res) => {
    const env = loadEnv('development', process.cwd(), '');
    process.env.MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || env.MP_ACCESS_TOKEN;
    process.env.MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || env.MP_WEBHOOK_SECRET;

    const urlObj = new URL(req.url || '', 'http://localhost');
    req.query = Object.fromEntries(urlObj.searchParams.entries());

    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf8');
      try {
        req.body = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        req.body = {};
      }
    }

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };

    await handler(req, res);
  };

  return {
    name: 'mercadopago-local-api',
    configureServer(server) {
      server.middlewares.use('/api/mercadopago-order', wrapServerless(mpOrderHandler));
      server.middlewares.use('/api/mercadopago-webhook', wrapServerless(mpWebhookHandler));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mercadoPagoLocalApiPlugin()],
  server: {
    host: true,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        },
      },
    },
  },
});
