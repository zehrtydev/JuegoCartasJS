// Importa la función auxiliar encargada de construir las URLs de los endpoints a partir de la configuración global
import { buildEndpoint } from './apiConfig.js';

// Define la constante que almacena la ruta completa para acceder al recurso de batallas usando el helper
const BATTLES_ENDPOINT = buildEndpoint('battles');

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
 * Función asíncrona para obtener la lista completa de batallas registradas en la base de datos o almacenamiento.
 * @returns {Promise<Array>} - Arreglo con el historial de batallas obtenidas.
 */
export async function getBattles() {
  // Realiza una petición HTTP GET al endpoint de batallas
  const response = await fetch(BATTLES_ENDPOINT);
  // Procesa y retorna la respuesta utilizando la función auxiliar handleResponse
  return handleResponse(response);
}

/**
 * Función asíncrona para registrar y almacenar una nueva batalla finalizada en la API.
 * @param {Object} battle - Objeto que contiene la información completa de la partida (jugador, resultado, mazos, fechas, etc.).
 * @returns {Promise<Object>} - Retorna el objeto de la batalla recién creada.
 */
export async function createBattle(battle) {
  // Realiza una petición HTTP POST al endpoint de batallas enviando los datos serializados en JSON
  const response = await fetch(BATTLES_ENDPOINT, {
    method: 'POST', // Especifica el método HTTP para la creación de un nuevo recurso
    headers: {
      'Content-Type': 'application/json', // Indica que el cuerpo de la petición va en formato JSON
    },
    body: JSON.stringify(battle), // Convierte el objeto de JavaScript de la batalla a una cadena JSON
  });

  // Procesa y retorna la respuesta de éxito utilizando la función auxiliar handleResponse
  return handleResponse(response);
}