import { supabase } from '../lib/supabase.js';

/**
 * Servicio de Finanzas: Facturas de Bodega y Gastos Operacionales
 */

// 1. Facturas de Compra de Proveedores (Bodega)
export async function fetchPurchaseInvoicesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('purchase_invoices')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((inv) => {
      let invItems = inv.items;
      if (!Array.isArray(invItems) || invItems.length === 0) {
        try {
          const cached = localStorage.getItem('patitas_invoice_items_' + (inv.invoice_number || inv.id));
          if (cached) invItems = JSON.parse(cached);
        } catch {
          // ignore
        }
      }
      return {
        ...inv,
        invoiceNumber: inv.invoice_number,
        dueDate: inv.due_date,
        productName: inv.product_name,
        quantityReceived: inv.quantity_received,
        unitCostNeto: inv.unit_cost_neto,
        totalNeto: inv.total_neto,
        totalBruto: inv.total_bruto,
        paymentMethod: inv.payment_method,
        hasShippingCost: Boolean(inv.has_shipping_cost),
        shippingCostNeto: parseFloat(inv.shipping_cost_neto) || 0,
        shippingInvoiceNumber: inv.shipping_invoice_number || '',
        shippingProvider: inv.shipping_provider || '',
        shippingDistributionMethod: inv.shipping_distribution_method || 'units',
        items: Array.isArray(invItems) ? invItems : [],
      };
    });
  } catch (err) {
    console.error('Error fetching purchase invoices from Supabase:', err);
    return [];
  }
}

export async function createPurchaseInvoiceInSupabase(invoiceData) {
  try {
    const payload = {
      invoice_number: invoiceData.invoiceNumber || invoiceData.invoice_number,
      provider: invoiceData.provider,
      rut: invoiceData.rut || '',
      date: invoiceData.date || new Date().toISOString().split('T')[0],
      due_date: invoiceData.dueDate || invoiceData.due_date || null,
      product_name: invoiceData.productName || invoiceData.product_name || '',
      quantity_received: parseInt(invoiceData.quantityReceived || invoiceData.quantity_received, 10) || 0,
      unit_cost_neto: parseFloat(invoiceData.unitCostNeto || invoiceData.unit_cost_neto) || 0,
      total_neto: parseFloat(invoiceData.totalNeto || invoiceData.total_neto) || 0,
      iva: parseFloat(invoiceData.iva) || 0,
      total_bruto: parseFloat(invoiceData.totalBruto || invoiceData.total_bruto) || 0,
      status: invoiceData.status || 'pendiente',
      payment_method: invoiceData.paymentMethod || invoiceData.payment_method || 'Transferencia',
      has_shipping_cost: Boolean(invoiceData.hasShippingCost || invoiceData.has_shipping_cost),
      shipping_cost_neto: parseFloat(invoiceData.shippingCostNeto || invoiceData.shipping_cost_neto) || 0,
      shipping_invoice_number: invoiceData.shippingInvoiceNumber || invoiceData.shipping_invoice_number || null,
      shipping_provider: invoiceData.shippingProvider || invoiceData.shipping_provider || null,
      shipping_distribution_method: invoiceData.shippingDistributionMethod || invoiceData.shipping_distribution_method || 'units',
      items: Array.isArray(invoiceData.items) ? invoiceData.items : [],
    };

    let { data, error } = await supabase
      .from('purchase_invoices')
      .insert(payload)
      .select()
      .single();

    // Fallback defensivo si las nuevas columnas no han sido migradas en la base de datos remota
    if (error && (error.message?.includes('column') || error.code === '42703')) {
      console.warn('Columnas de flete no detectadas en purchase_invoices, aplicando fallback seguro:', error.message);
      const basicPayload = {
        invoice_number: payload.invoice_number,
        provider: payload.provider,
        rut: payload.rut,
        date: payload.date,
        due_date: payload.due_date,
        product_name: payload.product_name,
        quantity_received: payload.quantity_received,
        unit_cost_neto: payload.unit_cost_neto,
        total_neto: payload.total_neto,
        iva: payload.iva,
        total_bruto: payload.total_bruto,
        status: payload.status,
        payment_method: payload.payment_method,
      };
      const fallbackRes = await supabase.from('purchase_invoices').insert(basicPayload).select().single();
      if (fallbackRes.error) throw fallbackRes.error;
      data = fallbackRes.data;
      error = null;
    } else if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error creating purchase invoice in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function updatePurchaseInvoiceInSupabase(identifier, invoiceData) {
  try {
    const payload = {
      product_name: invoiceData.productName || invoiceData.product_name || 'Varios productos',
      quantity_received: parseInt(invoiceData.quantityReceived || invoiceData.quantity_received || invoiceData.itemsCount, 10) || 0,
      unit_cost_neto: parseFloat(invoiceData.unitCostNeto || invoiceData.unit_cost_neto) || 0,
      total_neto: parseFloat(invoiceData.totalNeto || invoiceData.total_neto) || 0,
      iva: parseFloat(invoiceData.iva) || 0,
      total_bruto: parseFloat(invoiceData.totalBruto || invoiceData.total_bruto) || 0,
      has_shipping_cost: Boolean(invoiceData.hasShippingCost ?? invoiceData.has_shipping_cost),
      shipping_cost_neto: parseFloat(invoiceData.shippingCostNeto ?? invoiceData.shipping_cost_neto) || 0,
      shipping_invoice_number: invoiceData.shippingInvoiceNumber ?? invoiceData.shipping_invoice_number ?? null,
      shipping_provider: invoiceData.shippingProvider ?? invoiceData.shipping_provider ?? null,
      shipping_distribution_method: invoiceData.shippingDistributionMethod ?? invoiceData.shipping_distribution_method ?? 'units',
      items: Array.isArray(invoiceData.items) ? invoiceData.items : [],
    };

    if (invoiceData.provider) payload.provider = invoiceData.provider;
    if (invoiceData.rut) payload.rut = invoiceData.rut;
    if (invoiceData.date) payload.date = invoiceData.date;
    if (invoiceData.dueDate || invoiceData.due_date) payload.due_date = invoiceData.dueDate || invoiceData.due_date;
    if (invoiceData.paymentMethod || invoiceData.payment_method) payload.payment_method = invoiceData.paymentMethod || invoiceData.payment_method;
    if (invoiceData.status) payload.status = invoiceData.status;

    let query = supabase.from('purchase_invoices').update(payload);
    const isNumOrUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(identifier);
    if (isNumOrUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('invoice_number', identifier);
    }

    let { data, error } = await query.select();

    // Fallback defensivo si la tabla remota no tiene aún las columnas de flete/items
    if (error && (error.message?.includes('column') || error.code === '42703')) {
      console.warn('Columnas de flete no detectadas en purchase_invoices al actualizar, aplicando fallback seguro:', error.message);
      const basicPayload = {
        product_name: payload.product_name,
        quantity_received: payload.quantity_received,
        unit_cost_neto: payload.unit_cost_neto,
        total_neto: payload.total_neto,
        iva: payload.iva,
        total_bruto: payload.total_bruto,
      };
      if (payload.provider) basicPayload.provider = payload.provider;
      if (payload.rut) basicPayload.rut = payload.rut;
      if (payload.date) basicPayload.date = payload.date;
      if (payload.due_date) basicPayload.due_date = payload.due_date;
      if (payload.payment_method) basicPayload.payment_method = payload.payment_method;
      if (payload.status) basicPayload.status = payload.status;

      let fallbackQuery = supabase.from('purchase_invoices').update(basicPayload);
      if (isNumOrUuid) {
        fallbackQuery = fallbackQuery.eq('id', identifier);
      } else {
        fallbackQuery = fallbackQuery.eq('invoice_number', identifier);
      }
      const fallbackRes = await fallbackQuery.select();
      if (fallbackRes.error) throw fallbackRes.error;
      data = fallbackRes.data;
      error = null;
    } else if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error updating purchase invoice in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function updatePurchaseInvoiceStatus(identifier, status) {
  try {
    let query = supabase.from('purchase_invoices').update({ status });
    // Check if it's a UUID/ID or invoice_number string
    const isNumOrUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(identifier);
    if (isNumOrUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('invoice_number', identifier);
    }

    const { data, error } = await query.select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating invoice status:', err);
    return { success: false, error: err };
  }
}


// 2. Gastos Operacionales (Combustible, Fijo, Packaging, etc.)
export async function fetchExpensesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((exp) => ({
      ...exp,
      categoryLabel: exp.category_label,
      documentType: exp.document_type,
      documentNumber: exp.document_number,
      hasIvaCredit: exp.has_iva_credit,
      paymentMethod: exp.payment_method,
      isRecurring: exp.is_recurring,
    }));
  } catch (err) {
    console.error('Error fetching expenses from Supabase:', err);
    return [];
  }
}

export async function createExpenseInSupabase(expenseData) {
  try {
    const payload = {
      category: expenseData.category || 'combustible',
      category_label: expenseData.categoryLabel || expenseData.category_label || '',
      icon: expenseData.icon || '💸',
      description: expenseData.description,
      provider: expenseData.provider || '',
      document_type: expenseData.documentType || expenseData.document_type || 'boleta',
      document_number: expenseData.documentNumber || expenseData.document_number || '',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(expenseData.amount) || 0,
      neto: parseFloat(expenseData.neto) || 0,
      iva: parseFloat(expenseData.iva) || 0,
      has_iva_credit: expenseData.hasIvaCredit ?? expenseData.has_iva_credit ?? false,
      payment_method: expenseData.paymentMethod || expenseData.payment_method || 'Efectivo',
      is_recurring: expenseData.isRecurring ?? expenseData.is_recurring ?? false,
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error creating expense in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function deleteExpenseFromSupabase(expenseId) {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting expense from Supabase:', err);
    return { success: false, error: err };
  }
}

// 3. Configuración de Mercado Pago en store_settings
export async function getMercadoPagoSettingsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'mercadopago')
      .maybeSingle();

    if (error) throw error;
    return data ? data.value : null;
  } catch (err) {
    console.error('Error fetching Mercado Pago settings from Supabase:', err);
    return null;
  }
}

export async function updateMercadoPagoSettingsInSupabase(settings) {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        key: 'mercadopago',
        value: settings,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error saving Mercado Pago settings to Supabase:', err);
    return { success: false, error: err };
  }
}

// 4. Inversiones y Aportes de Socios (Partner Investments)
export async function fetchPartnerInvestmentsFromSupabase() {
  try {
    // Intentar primero desde tabla partner_investments si existe
    const { data: tableData, error: tableError } = await supabase
      .from('partner_investments')
      .select('*')
      .order('date', { ascending: false });

    if (!tableError && Array.isArray(tableData) && tableData.length > 0) {
      return tableData.map((inv) => ({
        id: inv.id,
        partnerName: inv.partner_name,
        partnerRut: inv.partner_rut,
        amount: parseFloat(inv.amount) || 0,
        date: inv.date,
        investmentType: inv.investment_type,
        investmentTypeLabel: inv.investment_type_label,
        paymentMethod: inv.payment_method,
        destinationAccount: inv.destination_account,
        referenceNumber: inv.reference_number,
        notes: inv.notes,
        createdAt: inv.created_at,
      }));
    }

    // Fallback garantizado: store_settings
    const { data: storeData, error: storeError } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'partner_investments')
      .maybeSingle();

    if (storeError) throw storeError;
    if (storeData && Array.isArray(storeData.value)) {
      return storeData.value;
    }
    return [];
  } catch (err) {
    console.error('Error fetching partner investments from Supabase:', err);
    return [];
  }
}

export async function savePartnerInvestmentsToSupabase(investments) {
  try {
    // Guardar en store_settings para sincronización inmediata
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        key: 'partner_investments',
        value: investments,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    // Intentar también en tabla partner_investments si está disponible
    try {
      const rows = investments.map((inv) => ({
        id: inv.id,
        partner_name: inv.partnerName || inv.partner_name,
        partner_rut: inv.partnerRut || inv.partner_rut || '',
        amount: parseFloat(inv.amount) || 0,
        date: inv.date,
        investment_type: inv.investmentType || inv.investment_type || 'capital_inicial',
        investment_type_label: inv.investmentTypeLabel || inv.investment_type_label || '',
        payment_method: inv.paymentMethod || inv.payment_method || 'Transferencia Bancaria',
        destination_account: inv.destinationAccount || inv.destination_account || '',
        reference_number: inv.referenceNumber || inv.reference_number || '',
        notes: inv.notes || '',
      }));
      await supabase.from('partner_investments').upsert(rows);
    } catch {
      // Ignorar si la tabla física aún no ha corrido la migración
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error saving partner investments to Supabase:', err);
    return { success: false, error: err };
  }
}


