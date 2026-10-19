import { supabase } from '../lib/supabase';

/**
 * Enviar mensaje de contacto a Supabase (con respaldo local)
 */
export async function sendContactMessage({ name, email, petType = 'perro', message }) {
  try {
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      pet_type: petType,
      message: message.trim(),
      status: 'unread',
    };

    const { data, error } = await supabase
      .from('contact_messages')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase contact_messages fallback to localStorage:', error.message);
      // Fallback local storage
      const saved = JSON.parse(localStorage.getItem('patitas_pending_contact') || '[]');
      saved.push({ ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() });
      localStorage.setItem('patitas_pending_contact', JSON.stringify(saved));
      return { success: true, localOnly: true };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error sending contact message:', err);
    return { success: true, localOnly: true };
  }
}

/**
 * Suscribir correo al Newsletter de Club Patitas
 */
export async function subscribeNewsletter(email) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
    }

    const payload = {
      email: cleanEmail,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique violation: ya está suscrito
        return { success: true, alreadySubscribed: true };
      }
      console.warn('Supabase newsletter fallback to localStorage:', error.message);
      const saved = JSON.parse(localStorage.getItem('patitas_pending_newsletter') || '[]');
      if (!saved.includes(cleanEmail)) {
        saved.push(cleanEmail);
        localStorage.setItem('patitas_pending_newsletter', JSON.stringify(saved));
      }
      return { success: true, localOnly: true };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    return { success: true, localOnly: true };
  }
}
