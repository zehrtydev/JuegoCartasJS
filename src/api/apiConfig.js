// Define una constante con la URL predeterminada para el entorno de desarrollo local (servidor JSON Server)
const DEFAULT_DEV_URL = 'http://localhost:3000';

// Obtiene de manera segura las variables de entorno, compatible tanto con Vite (import.meta.env) como con Node.js (process.env) o un objeto vacío por defecto
const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined' && process.env
      ? process.env
      : {};

// Objeto de configuración que mapea las URLs de la API según el modo (development o production) utilizando las variables de entorno o el valor por defecto
const config = {
  development: env.VITE_API_DEV_URL || DEFAULT_DEV_URL,
  production: env.VITE_API_PROD_URL || DEFAULT_DEV_URL,
};

// Determina el modo de ejecución actual leyendo la variable VITE_API_MODE; si no está definida, toma 'development' por defecto
const mode = env.VITE_API_MODE || 'development';

// Exporta la URL base definitiva que utilizarán los servicios de la API basándose en el modo seleccionado
export const API_URL = config[mode] || config.development;

/**
 * Función auxiliar para construir la URL completa de un endpoint específico a partir de un recurso dado.
 * @param {string} resource - El nombre del recurso (por ejemplo: 'cards', 'players', 'admins', 'battles').
 * @returns {string} - La URL completa y lista para realizar peticiones HTTP.
 */
export function buildEndpoint(resource) {
  return `${API_URL}/${resource}`;
}