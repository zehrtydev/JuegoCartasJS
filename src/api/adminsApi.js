// Importa la función auxiliar encargada de construir las URLs de los endpoints a partir de la configuración global
import { buildEndpoint } from './apiConfig.js';

// Define la constante que almacena la ruta completa para acceder al recurso de administradores usando el helper
const ADMINS_ENDPOINT = buildEndpoint('admins');

/**
 * Función auxiliar asíncrona para procesar y validar la respuesta HTTP recibida del servidor.
 * @param {Response} response - Objeto de respuesta nativo de la Fetch API.
 * @returns {Promise<Object>} - Retorna los datos en formato JSON si la petición fue exitosa.
 */
async function handleResponse(response) {
  // Verifica si el código de estado HTTP NO es exitoso (fuera del rango 200-299)
  if (!response.ok) {
    // Lee el cuerpo de la respuesta de error como texto plano
    const errorText = await response.text();
    // Lanza una excepción con el texto del servidor o un mensaje estándar basado en el código de estado HTTP
    throw new Error(errorText || `Error en la petición: ${response.status}`);
  }

  // Si todo es correcto, parsea y retorna el cuerpo de la respuesta en formato JSON
  return response.json();
}

/**
 * Función asíncrona para obtener la lista completa de administradores registrados en la base de datos.
 * @returns {Promise<Array>} - Arreglo con los administradores obtenidos.
 */
export async function getAdmins() {
  // Realiza una petición HTTP GET al endpoint de administradores
  const response = await fetch(ADMINS_ENDPOINT);
  // Procesa la respuesta utilizando la función auxiliar handleResponse
  return handleResponse(response);
}

/**
 * Función asíncrona para validar las credenciales de inicio de sesión de un administrador.
 * @param {string} username - Nombre de usuario ingresado en el login.
 * @param {string} password - Contraseña ingresada en el login.
 * @returns {Promise<Object|null>} - Retorna el objeto del administrador si las credenciales coinciden, o null si no existe.
 */
export async function loginAdmin(username, password) {
  // Realiza una petición GET filtrando por parámetros de URL (username y password), codificándolos de manera segura
  const response = await fetch(
    `${ADMINS_ENDPOINT}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  );

  // Convierte la respuesta filtrada en un arreglo de JavaScript
  const admins = await handleResponse(response);
  // Retorna el primer administrador encontrado (si la credencial es válida) o null en caso contrario
  return admins[0] || null;
}