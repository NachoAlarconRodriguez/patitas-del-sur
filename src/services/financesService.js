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
    return (data || []).map((inv) => ({
      ...inv,
      invoiceNumber: inv.invoice_number,
      dueDate: inv.due_date,
      productName: inv.product_name,
      quantityReceived: inv.quantity_received,
      unitCostNeto: inv.unit_cost_neto,
      totalNeto: inv.total_neto,
      totalBruto: inv.total_bruto,
      paymentMethod: inv.payment_method,
    }));
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
    };

    const { data, error } = await supabase
      .from('purchase_invoices')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error creating purchase invoice in Supabase:', err);
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

