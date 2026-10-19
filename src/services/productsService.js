import { supabase } from '../lib/supabase.js';
import { PRODUCTS } from '../data/mockData';

/**
 * Servicio de Productos con sincronización a Supabase y fallback a catálogo local
 */

export async function fetchProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase products fetch failed, using local mock data:', error.message);
      return PRODUCTS;
    }

    if (data && data.length > 0) {
      // Normalizar campos JSON y propiedades para que coincidan al 100% con el frontend
      return data.map((item) => ({
        ...item,
        weights: Array.isArray(item.weights) ? item.weights : JSON.parse(item.weights || '[]'),
        images: Array.isArray(item.images) ? item.images : JSON.parse(item.images || '[]'),
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : JSON.parse(item.ingredients || '[]'),
        guaranteedAnalysis: item.guaranteed_analysis || item.guaranteedAnalysis || {},
        benefits: Array.isArray(item.benefits) ? item.benefits : JSON.parse(item.benefits || '[]'),
        originalPrice: item.original_price || item.originalPrice,
        petType: item.pet_type || item.petType,
        isVeterinary: item.is_veterinary ?? item.isVeterinary,
        isPaused: item.is_paused ?? item.isPaused,
        isActive: item.is_active ?? item.isActive,
      }));
    }

    return PRODUCTS;
  } catch (err) {
    console.error('Error fetching products from Supabase:', err);
    return PRODUCTS;
  }
}

export async function updateProductInSupabase(productId, updates) {
  try {
    // Map camelCase fields to snake_case for Supabase if needed
    const payload = {};
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'salePrice') payload.price = value;
      else if (key === 'unitCostNeto') payload.unit_cost_neto = value;
      else if (key === 'minStock') payload.min_stock = value;
      else if (key === 'petType') payload.pet_type = value;
      else if (key === 'isPaused') payload.is_paused = value;
      else if (key === 'isActive') payload.is_active = value;
      else if (key === 'isVeterinary') payload.is_veterinary = value;
      else if (key === 'originalPrice') payload.original_price = value;
      else payload[key] = value;
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating product in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function createProductInSupabase(productData) {
  try {
    const payload = {
      id: productData.id || `PROD-${Date.now().toString().slice(-6)}`,
      name: productData.name,
      brand: productData.brand || 'Patitas del Sur',
      category: productData.category || 'Alimento Seco',
      pet_type: productData.petType || productData.pet_type || 'perros',
      price: productData.salePrice || productData.price || 0,
      original_price: productData.originalPrice || productData.original_price || null,
      unit_cost_neto: productData.unitCostNeto || productData.unit_cost_neto || 0,
      stock: productData.stock ?? 10,
      min_stock: productData.minStock || productData.min_stock || 5,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      weights: Array.isArray(productData.weights) ? productData.weights : [productData.format || '12 kg'],
      is_paused: productData.isPaused ?? false,
      is_active: productData.isActive ?? true,
      image: productData.image || 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=600',
    };


    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error creating product in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function deleteProductFromSupabase(productId) {
  try {
    // Soft delete or remove
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting product in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function toggleProductPauseInSupabase(productId, isPaused) {
  return updateProductInSupabase(productId, { is_paused: isPaused });
}

