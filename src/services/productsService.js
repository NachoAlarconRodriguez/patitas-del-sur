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
      const safeParseJson = (val, fallback = []) => {
        if (Array.isArray(val)) return val;
        if (!val) return fallback;
        if (typeof val === 'object') return val;
        try {
          const res = JSON.parse(val);
          return Array.isArray(res) ? res : [res];
        } catch {
          return typeof val === 'string' && val.trim() ? [val.trim()] : fallback;
        }
      };

      const safeParseJsonObject = (val, fallback = {}) => {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) return val;
        if (!val) return fallback;
        try {
          const res = JSON.parse(val);
          return typeof res === 'object' && res !== null && !Array.isArray(res) ? res : fallback;
        } catch {
          return fallback;
        }
      };

      // Normalizar campos JSON y propiedades para que coincidan al 100% con el frontend
      return data.map((item) => ({
        ...item,
        weights: safeParseJson(item.weights, ['10 kg']),
        images: safeParseJson(item.images, []),
        ingredients: safeParseJson(item.ingredients, []),
        guaranteedAnalysis: safeParseJsonObject(item.guaranteed_analysis || item.guaranteedAnalysis, {}),
        benefits: safeParseJson(item.benefits, []),
        animalPercent: item.animal_percent !== null && item.animal_percent !== undefined && item.animal_percent !== ''
          ? (Number(item.animal_percent) || item.animal_percent)
          : (item.animalPercent ? (Number(item.animalPercent) || item.animalPercent) : null),
        animal_percent: item.animal_percent || item.animalPercent || null,
        originalPrice: item.original_price || item.originalPrice,
        petType: item.pet_type || item.petType,
        isVeterinary: item.is_veterinary ?? item.isVeterinary,
        isPaused: item.is_paused ?? item.isPaused,
        isActive: item.is_active ?? item.isActive,
        proteinValue: item.protein_value ?? item.proteinValue,
        proteinPercent: item.protein_percent ?? item.proteinPercent,
        mainProtein: item.main_protein || item.mainProtein || 'Pollo',
        grainLevel: item.gama || item.grain_level || item.grainLevel || 'free',
        vetDetail: item.vet_detail || item.vetDetail || null,
        lifeStage: item.life_stage || item.lifeStage || 'adulto',
        unitCostNeto: item.unit_cost_neto ?? item.unitCostNeto ?? 0,
        minStock: item.min_stock ?? item.minStock ?? 5,
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
    const payload = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;

      if (key === 'salePrice' || key === 'price') {
        payload.price = Number(value);
      } else if (key === 'unitCostNeto' || key === 'unit_cost_neto') {
        payload.unit_cost_neto = Number(value);
      } else if (key === 'minStock' || key === 'min_stock') {
        payload.min_stock = Number(value);
      } else if (key === 'stock') {
        payload.stock = Number(value);
      } else if (key === 'petType' || key === 'pet_type') {
        payload.pet_type = value;
      } else if (key === 'isPaused' || key === 'is_paused') {
        payload.is_paused = Boolean(value);
      } else if (key === 'isActive' || key === 'is_active') {
        payload.is_active = Boolean(value);
      } else if (key === 'isVeterinary' || key === 'is_veterinary') {
        payload.is_veterinary = Boolean(value);
      } else if (key === 'originalPrice' || key === 'original_price') {
        payload.original_price = value ? Number(value) : null;
      } else if (key === 'format' || key === 'weights') {
        // Map format / weights safely to weights JSON array in Supabase
        payload.weights = Array.isArray(value) ? value : [value];
      } else if (key === 'name') {
        payload.name = value;
      } else if (key === 'brand') {
        payload.brand = value;
      } else if (key === 'category') {
        payload.category = value;
      } else if (key === 'sku') {
        payload.sku = value && String(value).trim() ? String(value).trim() : null;
      } else if (key === 'tagline' || key === 'description') {
        payload.tagline = value || null;
      } else if (key === 'badge') {
        payload.badge = value || null;
      } else if (key === 'benefits') {
        payload.benefits = Array.isArray(value) ? value : (value ? [value] : []);
      } else if (key === 'proteinValue' || key === 'protein_value') {
        payload.protein_value = value !== '' && value !== null && !isNaN(value) ? Number(value) : null;
        payload.protein_percent = value !== '' && value !== null && !isNaN(value) ? `${value}%` : null;
      } else if (key === 'mainProtein' || key === 'main_protein') {
        payload.main_protein = value || null;
      } else if (key === 'grainLevel' || key === 'grain_level' || key === 'gama') {
        payload.gama = value || 'free';
      } else if (key === 'isVeterinary' || key === 'is_veterinary') {
        payload.is_veterinary = Boolean(value);
      } else if (key === 'vetDetail' || key === 'vet_detail') {
        payload.vet_detail = value || null;
      } else if (key === 'lifeStage' || key === 'life_stage') {
        payload.life_stage = value || 'adulto';
      } else if (key === 'image') {
        payload.image = value;
      } else if (key === 'images') {
        payload.images = Array.isArray(value) ? value : (value ? [value] : []);
      } else if (key === 'ingredients') {
        payload.ingredients = Array.isArray(value) ? value : (value ? [value] : []);
      } else if (key === 'guaranteedAnalysis' || key === 'guaranteed_analysis') {
        payload.guaranteed_analysis = (typeof value === 'object' && value !== null) ? value : {};
      } else if (key === 'animalPercent' || key === 'animal_percent') {
        payload.animal_percent = value !== '' && value !== null && !isNaN(value) ? String(value) : (value || null);
      }
      // Note: Unknown fields like inCarousel are intentionally kept in localStorage/UI state
      // to avoid PGRST204 errors in Supabase.
    }

    payload.updated_at = new Date().toISOString();

    // 1. Intentar actualizar por id principal
    let { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId)
      .select();

    // 2. Si no encontró por id (o el id cambió), intentar por sku
    if ((!data || data.length === 0) && updates.sku) {
      const retryBySku = await supabase
        .from('products')
        .update(payload)
        .eq('sku', updates.sku)
        .select();

      if (!retryBySku.error && retryBySku.data && retryBySku.data.length > 0) {
        data = retryBySku.data;
        error = null;
      }
    }

    // 3. Si aún no existe en Supabase, hacer un upsert completo
    if ((!data || data.length === 0) && !error) {
      const insertPayload = {
        id: productId,
        name: updates.name || 'Producto',
        brand: updates.brand || 'Patitas del Sur',
        category: updates.category || 'Alimento Seco',
        pet_type: updates.petType || updates.pet_type || 'perros',
        price: payload.price || 0,
        unit_cost_neto: payload.unit_cost_neto || 0,
        stock: payload.stock || 0,
        min_stock: payload.min_stock || 5,
        sku: payload.sku || null,
        weights: payload.weights || ['10 kg'],
        is_paused: payload.is_paused || false,
        is_active: payload.is_active !== false,
        image: payload.image || 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=600',
        images: payload.images || [],
        tagline: payload.tagline || null,
        badge: payload.badge || null,
        benefits: payload.benefits || [],
        ingredients: payload.ingredients || [],
        guaranteed_analysis: payload.guaranteed_analysis || {},
        animal_percent: payload.animal_percent || null,
        protein_value: payload.protein_value || null,
        protein_percent: payload.protein_percent || null,
        main_protein: payload.main_protein || null,
        gama: payload.gama || 'free',
        is_veterinary: payload.is_veterinary || false,
        vet_detail: payload.vet_detail || null,
        life_stage: payload.life_stage || 'adulto',
        ...payload,
      };

      const upsertRes = await supabase
        .from('products')
        .upsert(insertPayload)
        .select();

      data = upsertRes.data;
      error = upsertRes.error;
    }

    if (error) throw error;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    }
    return { success: true, data };
  } catch (err) {
    console.error('Error updating product in Supabase backend:', err);
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
      sku: productData.sku && String(productData.sku).trim() ? String(productData.sku).trim() : null,
      weights: Array.isArray(productData.weights) ? productData.weights : [productData.format || '12 kg'],
      is_paused: productData.isPaused ?? false,
      is_active: productData.isActive ?? true,
      image: productData.image || 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=600',
      images: Array.isArray(productData.images) ? productData.images : [],
      tagline: productData.tagline || productData.description || null,
      badge: productData.badge || null,
      benefits: Array.isArray(productData.benefits) ? productData.benefits : [],
      protein_value: productData.proteinValue ? Number(productData.proteinValue) : null,
      protein_percent: productData.proteinValue ? `${productData.proteinValue}%` : null,
      main_protein: productData.mainProtein || null,
      gama: productData.grainLevel || productData.gama || 'free',
      is_veterinary: Boolean(productData.isVeterinary),
      vet_detail: productData.vetDetail || null,
      life_stage: productData.lifeStage || 'adulto',
      ingredients: Array.isArray(productData.ingredients) ? productData.ingredients : [],
      guaranteed_analysis: (typeof productData.guaranteedAnalysis === 'object' && productData.guaranteedAnalysis !== null)
        ? productData.guaranteedAnalysis
        : (productData.guaranteed_analysis || {}),
      animal_percent: productData.animalPercent ? String(productData.animalPercent) : (productData.animal_percent || null),
    };

    let { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    // Si ocurre un conflicto de ID duplicado (código 23505), buscar el ID máximo real y reintentar
    if (error && (error.code === '23505' || String(error.message || '').includes('duplicate key'))) {
      console.warn('ID collision detected on createProductInSupabase, finding next available PROD ID...');
      const { data: allProds } = await supabase.from('products').select('id');
      let maxNum = 0;
      (allProds || []).forEach((p) => {
        const m = String(p.id || '').match(/PROD-(\d+)/i);
        if (m) {
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      });
      payload.id = `PROD-${String(maxNum + 1).padStart(2, '0')}`;
      const retryRes = await supabase.from('products').insert(payload).select().single();
      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) throw error;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    }
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    }
    return { success: true };
  } catch (err) {
    console.error('Error deleting product in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function toggleProductPauseInSupabase(productId, isPaused) {
  return updateProductInSupabase(productId, { is_paused: isPaused });
}

