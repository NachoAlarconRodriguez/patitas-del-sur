import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Plugin local para emular los endpoints serverless durante `npm run dev`
function mercadoPagoLocalApiPlugin() {
  const wrapServerless = (loader) => async (req, res) => {
    const env = loadEnv('development', process.cwd(), '');
    process.env.MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || env.MP_ACCESS_TOKEN;
    process.env.MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || env.MP_WEBHOOK_SECRET;
    process.env.VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || env.VAPID_PUBLIC_KEY;
    process.env.VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || env.VAPID_PRIVATE_KEY;
    process.env.VAPID_SUBJECT = process.env.VAPID_SUBJECT || env.VAPID_SUBJECT;

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

    const mod = await loader();
    const handler = mod.default || mod;
    await handler(req, res);
  };

  return {
    name: 'mercadopago-local-api',
    configureServer(server) {
      server.middlewares.use('/api/mercadopago-order', wrapServerless(() => import('./api/mercadopago-order.js')));
      server.middlewares.use('/api/mercadopago-webhook', wrapServerless(() => import('./api/mercadopago-webhook.js')));
      server.middlewares.use('/api/admin-push-notify', wrapServerless(() => import('./api/admin-push-notify.js')));
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
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});
