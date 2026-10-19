-- =========================================================================
-- MIGRACIÓN FASE 1: SEGURIDAD CRÍTICA, ROLES Y ROW LEVEL SECURITY (RLS)
-- Fecha: 19 Octubre 2026
-- =========================================================================

-- 1. FUNCIÓN DE APOYO: IDENTIFICAR ADMINISTRADOR
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.customers
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER: VINCULAR AUTOMÁTICAMENTE REGISTROS AUTH CON CUSTOMERS
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

-- =========================================================================
-- REINICIALIZAR Y ASEGURAR POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =========================================================================

-- Limpiar políticas anteriores
DROP POLICY IF EXISTS "Productos visibles publicamente" ON public.products;
DROP POLICY IF EXISTS "Admin gestiona productos" ON public.products;
DROP POLICY IF EXISTS "Clientes ven su propio perfil" ON public.customers;
DROP POLICY IF EXISTS "Clientes crean o editan su perfil" ON public.customers;
DROP POLICY IF EXISTS "Mascotas accesibles" ON public.pets;
DROP POLICY IF EXISTS "Bitacora accesible" ON public.pet_health_logs;
DROP POLICY IF EXISTS "Citas accesibles" ON public.veterinary_appointments;
DROP POLICY IF EXISTS "Crear pedidos publicamente" ON public.orders;
DROP POLICY IF EXISTS "Lectura y gestion de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Crear items de pedido" ON public.order_items;
DROP POLICY IF EXISTS "Lectura de items" ON public.order_items;
DROP POLICY IF EXISTS "Rewards publicos" ON public.rewards;
DROP POLICY IF EXISTS "Rewards gestion" ON public.rewards;
DROP POLICY IF EXISTS "Convenios publicos" ON public.convenios;
DROP POLICY IF EXISTS "Convenios gestion" ON public.convenios;
DROP POLICY IF EXISTS "Cupones verificables" ON public.convenio_coupons;
DROP POLICY IF EXISTS "Redenciones de puntos accesibles" ON public.points_redemptions;
DROP POLICY IF EXISTS "Ajustes accesibles" ON public.store_settings;
DROP POLICY IF EXISTS "Facturas bodega admin" ON public.purchase_invoices;
DROP POLICY IF EXISTS "Gastos admin" ON public.expenses;

-- 1. TABLA: PRODUCTOS (products)
CREATE POLICY "Productos visibles publico o admin"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin gestiona productos"
    ON public.products FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. TABLA: CLIENTES (customers)
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

-- 3. TABLA: MASCOTAS (pets)
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

-- 4. TABLA: BITÁCORA DE SALUD (pet_health_logs)
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

-- 5. TABLA: CITAS VETERINARIAS (veterinary_appointments)
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

-- 6. TABLA: PEDIDOS (orders)
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

-- 7. TABLA: ÍTEMS DE PEDIDO (order_items)
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

-- 8. TABLA: FINANZAS Y FACTURAS (purchase_invoices & expenses) - EXCLUSIVO ADMIN
CREATE POLICY "Facturas bodega solo admin"
    ON public.purchase_invoices FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Gastos operacionales solo admin"
    ON public.expenses FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9. TABLA: AJUSTES DE TIENDA (store_settings)
CREATE POLICY "Lectura publica de ajustes generales"
    ON public.store_settings FOR SELECT
    USING (key = 'shipping' OR public.is_admin());

CREATE POLICY "Admin gestiona ajustes"
    ON public.store_settings FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 10. RECOMPENSAS Y CONVENIOS
CREATE POLICY "Rewards publicos activos"
    ON public.rewards FOR SELECT
    USING (active = true OR public.is_admin());

CREATE POLICY "Admin gestiona rewards"
    ON public.rewards FOR ALL
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
