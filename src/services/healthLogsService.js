import { supabase } from '../lib/supabase.js';

/**
 * Servicio de Bitácora Sanitaria y Citas Veterinarias
 */

// Bitácora de Salud (Vacunas, Antiparasitarios, Evaluaciones)
export async function getPetHealthLogs(petId) {
  if (!petId) return [];
  try {
    const { data, error } = await supabase
      .from('pet_health_logs')
      .select('*')
      .eq('pet_id', petId)
      .order('application_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching health logs from Supabase:', err);
    return [];
  }
}

export async function addHealthLogToSupabase(logData) {
  try {
    const payload = {
      pet_id: logData.petId || logData.pet_id,
      category: logData.category || 'vacunas',
      title: logData.title,
      product_id: logData.productId || logData.product_id || null,
      application_date: logData.date || logData.applicationDate || logData.application_date || new Date().toISOString().split('T')[0],
      next_due_date: logData.nextDueDate || logData.next_due_date || null,
      frequency_months: parseInt(logData.frequencyMonths || logData.frequency_months, 10) || 1,
      reminder_enabled: logData.reminderEnabled ?? logData.reminder_enabled ?? true,
      vet_name: logData.vetName || logData.vet_name || '',
      weight_at_time: logData.weightAtTime || logData.weight_at_time || '',
      diagnosis: logData.diagnosis || '',
      indications: logData.indications || '',
      notes: logData.notes || '',
    };

    const { data, error } = await supabase
      .from('pet_health_logs')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error adding health log to Supabase:', err);
    return { success: false, error: err };
  }
}

export async function deleteHealthLogFromSupabase(logId) {
  try {
    const { error } = await supabase
      .from('pet_health_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting health log from Supabase:', err);
    return { success: false, error: err };
  }
}

// Citas Veterinarias
export async function getVeterinaryAppointments(identifier, isPet = false) {
  try {
    let query = supabase.from('veterinary_appointments').select('*');
    if (isPet) {
      query = query.eq('pet_id', identifier);
    } else {
      query = query.eq('customer_id', identifier);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching appointments from Supabase:', err);
    return [];
  }
}

export async function createVeterinaryAppointmentInSupabase(appointment) {
  try {
    const payload = {
      pet_id: appointment.petId || appointment.pet_id,
      customer_id: appointment.customerId || appointment.customer_id,
      reason: appointment.reason || appointment.title || 'Consulta Veterinaria',
      appointment_date: appointment.appointmentDate || appointment.date,
      appointment_time: appointment.appointmentTime || appointment.time || '10:00',
      clinic_name: appointment.clinicName || appointment.clinic || 'Clínica Veterinaria Austral',
      status: appointment.status || 'programada',
      google_calendar_synced: appointment.googleCalendarSynced || appointment.googleSynced || false,
    };

    const { data, error } = await supabase
      .from('veterinary_appointments')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error creating veterinary appointment in Supabase:', err);
    return { success: false, error: err };
  }
}
