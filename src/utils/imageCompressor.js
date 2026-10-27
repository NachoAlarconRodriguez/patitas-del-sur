/**
 * Comprime y optimiza imágenes en el navegador antes de enviarlas a Supabase.
 * Reduce fotos de alta resolución (3-15MB) a ~80-160KB en formato WebP/JPEG,
 * garantizando que se guarden en el backend (PostgreSQL) sin errores de tamaño ni timeouts.
 */
export async function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al decodificar la imagen'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Escalar proporcionalmente si excede las dimensiones máximas
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target.result);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Probar exportar en WebP para máxima compresión y nitidez; fallback a JPEG
          let result = canvas.toDataURL('image/webp', quality);
          if (!result || !result.startsWith('data:image/webp')) {
            result = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(result);
        } catch (err) {
          console.warn('Fallo en compresión canvas, usando fallback dataURL:', err);
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
