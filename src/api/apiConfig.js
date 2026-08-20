// URL predeterminada del JSON Server para desarrollo local.
const DEFAULT_DEV_URL = 'http://localhost:3000';

// Obtiene de manera segura las variables de entorno, compatible tanto con Vite (import.meta.env) como con Node.js (process.env) o un objeto vacío por defecto
const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined' && process.env
      ? process.env
      : {};

// Vite expone PROD/MODE durante el build. VITE_API_URL tiene prioridad para
// simplificar la configuración de Vercel; se conserva VITE_API_PROD_URL por
// compatibilidad con la configuración anterior.
const isProduction = env.PROD === true || env.MODE === 'production';
const configuredUrl = env.VITE_API_URL || (
  isProduction ? env.VITE_API_PROD_URL : env.VITE_API_DEV_URL
);

// En producción nunca debe apuntar al localhost del navegador del visitante.
if (isProduction && !configuredUrl) {
  throw new Error('Falta configurar VITE_API_URL (o VITE_API_PROD_URL) en el despliegue.');
}

export const API_URL = (configuredUrl || DEFAULT_DEV_URL).replace(/\/$/, '');

/**
 * Función auxiliar para construir la URL completa de un endpoint específico a partir de un recurso dado.
 * @param {string} resource - El nombre del recurso (por ejemplo: 'cards', 'players', 'admins', 'battles').
 * @returns {string} - La URL completa y lista para realizar peticiones HTTP.
 */
export function buildEndpoint(resource) {
  return `${API_URL}/${resource}`;
}
