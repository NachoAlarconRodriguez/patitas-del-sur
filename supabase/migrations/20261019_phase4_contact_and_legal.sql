-- =========================================================================
-- MIGRACIÓN FASE 4: TABLAS DE CONTACTO, NEWSLETTER Y POLÍTICAS RLS
-- Fecha: 19 Octubre 2026
-- =========================================================================

-- 1. TABLA: MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    pet_type TEXT DEFAULT 'perro',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'replied'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

-- 2. TABLA: SUSCRIPTORES AL NEWSLETTER
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO
DROP POLICY IF EXISTS "Visitantes pueden enviar mensajes de contacto" ON public.contact_messages;
CREATE POLICY "Visitantes pueden enviar mensajes de contacto"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin puede ver mensajes de contacto" ON public.contact_messages;
CREATE POLICY "Admin puede ver mensajes de contacto"
ON public.contact_messages
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Visitantes pueden suscribirse al newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Visitantes pueden suscribirse al newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin puede ver y gestionar suscriptores" ON public.newsletter_subscribers;
CREATE POLICY "Admin puede ver y gestionar suscriptores"
ON public.newsletter_subscribers
FOR ALL
USING (public.is_admin());
