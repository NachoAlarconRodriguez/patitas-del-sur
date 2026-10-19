-- =========================================================================
-- PATITAS DEL SUR 2.0 - ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE
-- Producción | PostgreSQL 15+ | Soporte Invitados + RLS + Mercado Pago
-- =========================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. TABLA: PRODUCTOS & INVENTARIO (products)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    pet_type TEXT NOT NULL DEFAULT 'perros', -- 'perros', 'gatos', 'ambos'
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2),
    badge TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    weights JSONB DEFAULT '[]'::jsonb,
    sku TEXT UNIQUE,
    stock INTEGER DEFAULT 10,
    min_stock INTEGER DEFAULT 5,
    unit_cost_neto NUMERIC(12, 2) DEFAULT 0,
    protein_value NUMERIC(5, 2),
    protein_percent TEXT,
    main_protein TEXT,
    protein_subtitle TEXT,
    gama TEXT,
    gama_detail TEXT,
    animal_percent TEXT,
    animal_percent_detail TEXT,
    is_veterinary BOOLEAN DEFAULT false,
    vet_detail TEXT,
    life_stage TEXT,
    target_stage_label TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    guaranteed_analysis JSONB DEFAULT '{}'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    frequency_months INTEGER DEFAULT 1,
    is_paused BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 2. TABLA: CLIENTES & TUTORES (customers)
-- Soporta usuarios registrados (con auth_user_id) y compradores invitados
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Puerto Varas',
    address TEXT,
    depto TEXT,
    delivery_reference TEXT,
    whatsapp_notifications BOOLEAN DEFAULT true,
    role TEXT NOT NULL DEFAULT 'cliente', -- 'cliente', 'admin'
    points INTEGER DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user ON public.customers(auth_user_id);

-- -------------------------------------------------------------------------
-- 3. TABLA: MASCOTAS REGISTRADAS (pets)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'perro', -- 'perro', 'gato'
    breed TEXT,
    birthdate DATE,
    age TEXT,
    weight TEXT,
    sterilized TEXT DEFAULT 'Sí',
    favorite_food_name TEXT,
    favorite_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    bag_size TEXT,
    total_days_duration INTEGER DEFAULT 30,
    days_remaining INTEGER DEFAULT 30,
    last_order_date DATE,
    estimated_depletion_date DATE,
    deworming_external TEXT,
    deworming_internal TEXT,
    vaccines TEXT,
    deworming TEXT,
    vet_clinic TEXT,
    allergies TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pets_customer ON public.pets(customer_id);

-- -------------------------------------------------------------------------
-- 4. TABLA: BITÁCORA DE SALUD (pet_health_logs)
-- Vacunas, desparasitaciones y consultas médicas por mascota
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pet_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'vacunas', 'antiparasitario', 'consulta'
    title TEXT NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_date DATE,
    frequency_months INTEGER DEFAULT 1,
    reminder_enabled BOOLEAN DEFAULT true,
    vet_name TEXT,
    weight_at_time TEXT,
    diagnosis TEXT,
    indications TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_logs_pet ON public.pet_health_logs(pet_id);

-- -------------------------------------------------------------------------
-- 5. TABLA: CITAS VETERINARIAS (veterinary_appointments)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.veterinary_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    clinic_name TEXT,
    status TEXT DEFAULT 'programada', -- 'programada', 'completada', 'cancelada'
    google_calendar_synced BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 6. TABLA: PEDIDOS Y VENTAS (orders)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- Ej: 'PED-9842'
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    channel TEXT DEFAULT 'web', -- 'web', 'manual'
    payment_method TEXT DEFAULT 'Tarjeta', -- 'Web', 'Tarjeta', 'Efectivo', 'Transferencia'
    payment_status TEXT DEFAULT 'pendiente', -- 'pendiente', 'pagado', 'fallido'
    mercadopago_preference_id TEXT,
    mercadopago_payment_id TEXT,
    status TEXT DEFAULT 'en_preparacion', -- 'en_preparacion', 'en_camino', 'entregado', 'cancelado'
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    delivery_day_text TEXT,
    delivery_date DATE,
    delivery_slot TEXT,
    address TEXT,
    city TEXT,
    delivery_zone TEXT,
    tracking_code TEXT,
    invoice_number TEXT,
    agreement_used TEXT,
    coupon_code_used TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- -------------------------------------------------------------------------
-- 7. TABLA: ÍTEMS DEL PEDIDO (order_items)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    weight TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- -------------------------------------------------------------------------
-- 8. TABLA: CLUB DE PUNTOS Y RECOMPENSAS (rewards & points_redemptions)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rewards (
    id TEXT PRIMARY KEY, -- 'rew-envio-gratis', 'rew-dscto-10'
    title TEXT NOT NULL,
    points INTEGER NOT NULL,
    icon TEXT,
    validity TEXT,
    discount_type TEXT,
    discount_value NUMERIC(12, 2) DEFAULT 0,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.points_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    reward_id TEXT NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
    points_spent INTEGER NOT NULL,
    coupon_code TEXT,
    status TEXT DEFAULT 'activo', -- 'activo', 'utilizado', 'expirado'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 9. TABLA: CONVENIOS Y ALIANZAS (convenios & convenio_coupons)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.convenios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'veterinaria', -- 'veterinaria', 'adiestramiento', 'spa'
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    discount_type TEXT DEFAULT 'general', -- 'general', 'single_use'
    discount_percent NUMERIC(5, 2) DEFAULT 10,
    commission_percent NUMERIC(5, 2) DEFAULT 8,
    active BOOLEAN DEFAULT true,
    redemptions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.convenio_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    convenio_id TEXT NOT NULL REFERENCES public.convenios(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'disponible', -- 'disponible', 'canjeado'
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ
);

-- -------------------------------------------------------------------------
-- 10. TABLA: FINANZAS - FACTURAS DE COMPRA (purchase_invoices)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    provider TEXT NOT NULL,
    rut TEXT,
    date DATE NOT NULL,
    due_date DATE,
    product_name TEXT,
    quantity_received INTEGER DEFAULT 0,
    unit_cost_neto NUMERIC(12, 2) DEFAULT 0,
    total_neto NUMERIC(12, 2) DEFAULT 0,
    iva NUMERIC(12, 2) DEFAULT 0,
    total_bruto NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pendiente', -- 'pagada', 'pendiente'
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 11. TABLA: FINANZAS - GASTOS OPERATIVOS (expenses)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'combustible', 'packaging', 'fijo', 'mantenimiento', 'servicios', 'notaria'
    category_label TEXT,
    icon TEXT,
    description TEXT NOT NULL,
    provider TEXT,
    document_type TEXT DEFAULT 'boleta', -- 'boleta', 'factura'
    document_number TEXT,
    date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    neto NUMERIC(12, 2) DEFAULT 0,
    iva NUMERIC(12, 2) DEFAULT 0,
    has_iva_credit BOOLEAN DEFAULT false,
    payment_method TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 12. TABLA: CONFIGURACIÓN GENERAL (store_settings)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACCESO
-- =========================================================================

-- 0. Funciones auxiliares de seguridad y Triggers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.customers
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.customers (auth_user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinary_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenio_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 1. Productos: Lectura pública de productos activos, gestión exclusiva de admin
CREATE POLICY "Productos visibles publico o admin"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin gestiona productos"
    ON public.products FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. Clientes: Lectura y actualización de su propio perfil o admin
CREATE POLICY "Clientes ven su propio perfil o admin"
    ON public.customers FOR SELECT
    USING (auth.uid() = auth_user_id OR public.is_admin());

CREATE POLICY "Clientes actualizan su perfil o admin"
    ON public.customers FOR UPDATE
    USING (auth.uid() = auth_user_id OR public.is_admin())
    WITH CHECK (auth.uid() = auth_user_id OR public.is_admin());

CREATE POLICY "Crear clientes auth o admin"
    ON public.customers FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id OR public.is_admin() OR auth.uid() IS NULL);

CREATE POLICY "Admin elimina clientes"
    ON public.customers FOR DELETE
    USING (public.is_admin());

-- 3. Mascotas y Salud: Acceso exclusivo para su dueño o admin
CREATE POLICY "Mascotas accesibles por tutor o admin"
    ON public.pets FOR SELECT
    USING (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    );

CREATE POLICY "Tutor o admin gestiona mascotas"
    ON public.pets FOR ALL
    USING (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    )
    WITH CHECK (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    );

CREATE POLICY "Salud accesible por tutor o admin"
    ON public.pet_health_logs FOR SELECT
    USING (
      pet_id IN (
        SELECT p.id FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE c.auth_user_id = auth.uid()
      )
      OR public.is_admin()
    );

CREATE POLICY "Tutor o admin gestiona bitacora de salud"
    ON public.pet_health_logs FOR ALL
    USING (
      pet_id IN (
        SELECT p.id FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE c.auth_user_id = auth.uid()
      )
      OR public.is_admin()
    )
    WITH CHECK (
      pet_id IN (
        SELECT p.id FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE c.auth_user_id = auth.uid()
      )
      OR public.is_admin()
    );

CREATE POLICY "Citas accesibles por tutor o admin"
    ON public.veterinary_appointments FOR SELECT
    USING (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    );

CREATE POLICY "Tutor o admin gestiona citas"
    ON public.veterinary_appointments FOR ALL
    USING (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    )
    WITH CHECK (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    );

-- 4. Pedidos & Ítems: Permitir creación (invitados o registrados), lectura por dueño o admin
CREATE POLICY "Lectura de pedidos por dueno o admin"
    ON public.orders FOR SELECT
    USING (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR (customer_email IS NOT NULL AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      OR public.is_admin()
    );

CREATE POLICY "Crear pedidos clientes o invitados"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin gestiona pedidos"
    ON public.orders FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin elimina pedidos"
    ON public.orders FOR DELETE
    USING (public.is_admin());

CREATE POLICY "Lectura de items por dueno o admin"
    ON public.order_items FOR SELECT
    USING (
      order_id IN (
        SELECT id FROM public.orders
        WHERE customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
        OR (customer_email IS NOT NULL AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      )
      OR public.is_admin()
    );

CREATE POLICY "Crear items de pedido"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin gestiona items"
    ON public.order_items FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Puntos, Convenios y Ajustes
CREATE POLICY "Rewards publicos activos"
    ON public.rewards FOR SELECT
    USING (active = true OR public.is_admin());

CREATE POLICY "Admin gestiona rewards"
    ON public.rewards FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Convenios publicos activos"
    ON public.convenios FOR SELECT
    USING (active = true OR public.is_admin());

CREATE POLICY "Admin gestiona convenios"
    ON public.convenios FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Cupones verificables para checkout"
    ON public.convenio_coupons FOR SELECT
    USING (true);

CREATE POLICY "Admin o checkout actualiza cupones"
    ON public.convenio_coupons FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin gestiona cupones"
    ON public.convenio_coupons FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Redenciones de puntos tutor o admin"
    ON public.points_redemptions FOR SELECT
    USING (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    );

CREATE POLICY "Crear redenciones de puntos"
    ON public.points_redemptions FOR INSERT
    WITH CHECK (
      customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
      OR public.is_admin()
    );

CREATE POLICY "Lectura publica de ajustes generales"
    ON public.store_settings FOR SELECT
    USING (key = 'shipping' OR public.is_admin());

CREATE POLICY "Admin gestiona ajustes"
    ON public.store_settings FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Finanzas: Facturas bodega y Gastos operacionales - EXCLUSIVO ADMINISTRADOR
CREATE POLICY "Facturas bodega solo admin"
    ON public.purchase_invoices FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Gastos operacionales solo admin"
    ON public.expenses FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =========================================================================
-- SEED DATA: DATOS INICIALES DEL CATÁLOGO & CONFIGURACIÓN
-- =========================================================================

-- Recompensas Club Patitas
INSERT INTO public.rewards (id, title, points, icon, validity, discount_type, discount_value, active) VALUES
('rew-envio-gratis', 'Envío Gratis en tus compras', 1500, '🚚', 'Válido en tus próximas 2 compras', 'shipping_free', 3990, true),
('rew-dscto-10', '10% OFF en Alimento Seco', 2500, '🏷️', 'Válido en 1 compra de saco grande', 'percent_discount', 10, true),
('rew-snack-regalo', 'Snack Deshidratado de Regalo', 3500, '🥩', 'Incluido en tu próximo despacho', 'free_product', 8990, true),
('rew-dscto-15', '15% OFF en Línea Antiparasitarios', 4500, '🛡️', 'Válido en compras Nexgard / Bravecto', 'percent_discount', 15, true)
ON CONFLICT (id) DO NOTHING;

-- Configuración de Mercado Pago y Tienda
INSERT INTO public.store_settings (key, value) VALUES
('mercadopago', '{
    "commissionRatePercent": 3.19,
    "fixedFeeCLP": 350,
    "ivaPercent": 19,
    "payoutSchedule": "instant",
    "cardDiscountActive": false
}'::jsonb),
('shipping', '{
    "freeShippingThreshold": 35000,
    "standardShippingCost": 3990,
    "zones": ["Puerto Varas", "Llanquihue", "Frutillar", "Puerto Montt"]
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Cliente Demo Administrador y Cliente Demo Tutor
INSERT INTO public.customers (id, full_name, email, phone, city, address, role, points, total_spent) VALUES
('00000000-0000-0000-0000-000000000001', 'Camila Silva', 'camila@patitasdelsur.cl', '+56 9 8456 1234', 'Puerto Varas', 'Av. Los Colonos 1420, Depto 402', 'admin', 1250, 420000),
('00000000-0000-0000-0000-000000000002', 'Felipe Soto', 'felipe@tutor.cl', '+56 9 9123 4567', 'Puerto Varas', 'Los Mañíos 124', 'cliente', 890, 295000)
ON CONFLICT (id) DO NOTHING;

-- Mascotas Demo
INSERT INTO public.pets (id, customer_id, name, type, breed, weight, sterilized, favorite_food_name, bag_size, total_days_duration, days_remaining) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Kira 🐶', 'perro', 'Samoyedo', '21.5 kg', 'Sí', 'Bravery Salmón Adulto 12kg', '12 kg', 30, 12),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Jack 🐱', 'gato', 'Europeo Común', '4.8 kg', 'Sí', 'Patagonia Holística Trucha Silvestre 7kg', '7 kg', 45, 18)
ON CONFLICT (id) DO NOTHING;

-- Productos Iniciales
INSERT INTO public.products (id, pet_type, brand, name, tagline, category, price, original_price, badge, rating, reviews_count, image, weights, sku, stock, min_stock, unit_cost_neto, frequency_months, is_paused, is_active) VALUES
('bravery-chicken-adult', 'perros', 'Bravery', 'Bravery Pollo Adulto Raza Mediana / Grande', 'Alimento Super Premium 100% Natural, Grain Free & Hipoalergénico', 'Alimento Seco', 68990, 74990, 'Grain Free 100%', 4.9, 96, '/images/bravery_chicken.jpg', '["4 kg", "12 kg"]'::jsonb, 'BRAV-POL-12', 24, 6, 42500, 1, false, true),
('bravery-lamb-adult', 'perros', 'Bravery', 'Bravery Cordero Adulto Raza Mediana / Grande', 'Fórmula Hipoalergénica con Cordero de Pradera 100% Natural', 'Alimento Seco', 70990, 76990, 'Super Premium', 4.9, 112, '/images/bravery_lamb.jpg', '["4 kg", "12 kg"]'::jsonb, 'BRAV-COR-12', 18, 6, 42500, 1, false, true),
('bravery-salmon-adult', 'perros', 'Bravery', 'Bravery Salmón Adulto Raza Mediana / Grande', 'Receta Marina con Salmón Silvestre Rico en Omega-3 & Antiinflamatorios', 'Alimento Seco', 69990, 75990, 'Omega-3 Austral', 5.0, 154, '/images/bravery_chicken.jpg', '["4 kg", "12 kg"]'::jsonb, 'BRAV-SAL-12', 24, 8, 41800, 1, false, true),
('patagonia-holistica-trucha', 'gatos', 'Patagonia Holística', 'Patagonia Holística Trucha Silvestre & Salmón Austral', 'Fórmula Felina Sin Granos para Salud Renal y Pelaje Brillante', 'Alimento Seco Gatos', 52990, 57990, 'Salud Renal', 4.9, 88, '/images/cat_food_tuna.png', '["3 kg", "7 kg"]'::jsonb, 'PAT-TRU-7', 16, 5, 31200, 1, false, true),
('dr-pet-urinary-care', 'gatos', 'Dr. Pet Care', 'Dr. Pet Urinary Care Felino', 'Alimento Clínico Preventivo para Sistema Urinario', 'Alimento Veterinario Gatos', 34990, 39990, 'Fórmula Médica', 4.9, 64, '/images/cat_food_tuna.png', '["3 kg"]'::jsonb, 'DRP-URI-3', 12, 4, 21500, 1, false, true),
('nexgard-spectra-dog', 'perros', 'NexGard', 'NexGard Spectra Perros 7.5 - 15kg (Masticable Mensual)', 'Protección total mensual contra pulgas, garrapatas y parásitos internos', 'Antiparasitarios', 18990, 21990, 'Top Ventas', 5.0, 142, '/images/dog_food_salmon.png', '["1 Comprimido (1 Mes)", "Pack 3 Comprimidos (3 Meses)"]'::jsonb, 'NEX-7-15', 35, 10, 11500, 1, false, true),
('bravecto-dog-medium', 'perros', 'Bravecto', 'Bravecto Perros 10 - 20kg (Comprimido 12 Semanas)', 'Protección prolongada de 3 meses continuos contra pulgas y garrapatas', 'Antiparasitarios', 34990, 38990, 'Protección 3 Meses', 4.9, 118, '/images/bravery_lamb.jpg', '["1 Comprimido (12 Semanas)"]'::jsonb, 'BRV-10-20', 25, 8, 22000, 3, false, true),
('simparica-trio-dog', 'perros', 'Simparica', 'Simparica Trio Perros 10 - 20kg (Triple Acción Mensual)', 'Triple protección mensual contra pulgas, garrapatas y nemátodos', 'Antiparasitarios', 19990, 22990, 'Triple Acción', 4.9, 65, '/images/bravery_chicken.jpg', '["1 Comprimido (1 Mes)", "Pack 3 Comprimidos"]'::jsonb, 'SIM-10-20', 20, 6, 12200, 1, false, true),
('bravecto-plus-cat', 'gatos', 'Bravecto', 'Bravecto Plus Gatos (Pipeta Spot-on 12 Semanas)', 'Protección extendida de 3 meses para felinos contra pulgas, ácaros y parásitos', 'Antiparasitarios', 28990, 32990, 'Felino 12 Semanas', 5.0, 89, '/images/cat_food_tuna.png', '["1 Pipeta (12 Semanas)"]'::jsonb, 'BRV-CAT-12', 30, 8, 17500, 3, false, true),
('revolution-plus-cat', 'gatos', 'Zoetis', 'Revolution Plus Gatos 2.5 - 5kg (Pipeta Mensual 6 en 1)', 'Protección mensual completa 6 en 1 contra parásitos internos y externos', 'Antiparasitarios', 16990, 18990, 'Fórmula 6 en 1', 4.9, 52, '/images/cat_food_tuna.png', '["1 Pipeta (1 Mes)", "Pack 3 Pipetas"]'::jsonb, 'REV-CAT-6', 28, 8, 10500, 1, false, true),
('snack-ciervo-deshidratado', 'perros', 'Sur Natural', 'Snack Ciervo Patagónico Deshidratado 200g', 'Premios 100% Deshidratados Monoproteicos de la Patagonia', 'Snacks Naturales', 18990, 21990, '100% Natural', 4.9, 74, '/images/dog_food_ingredients.png', '["200 g"]'::jsonb, 'SNK-CIE-200', 45, 15, 9200, 1, false, true),
('snack-atun-gatos', 'gatos', 'Sur Natural', 'Bocaditos Crujientes de Atún & Hierba Gatera 70g', 'Premios Funcionales con Taurina y Omega 3', 'Snacks Naturales', 5490, 6490, 'Crujiente', 4.8, 77, '/images/cat_food_tuna.png', '["70 g"]'::jsonb, 'SNK-ATU-70', 50, 15, 2700, 1, false, true)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    is_active = EXCLUDED.is_active;
