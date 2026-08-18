// Importa la función auxiliar encargada de construir las URLs de los endpoints a partir de la configuración global
import { buildEndpoint } from './apiConfig.js';

// Define la constante que almacena la ruta completa para acceder al recurso de cartas usando el helper
const CARDS_ENDPOINT = buildEndpoint('cards');

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
 * Función asíncrona para obtener la lista completa de cartas registradas (GET general).
 * @returns {Promise<Array>} - Arreglo con todas las cartas disponibles.
 */
export async function getCards() {
  // Realiza una petición HTTP GET al endpoint general de cartas
  const response = await fetch(CARDS_ENDPOINT);
  // Procesa y retorna la respuesta utilizando la función auxiliar handleResponse
  return handleResponse(response);
}

/**
 * Función asíncrona para obtener una carta específica filtrada por su identificador único (GET por ID).
 * @param {string|number} id - Identificador único de la carta a buscar.
 * @returns {Promise<Object>} - Objeto con la información de la carta encontrada.
 */
export async function getCardById(id) {
  // Realiza una petición HTTP GET concatenando el ID específico de la carta
  const response = await fetch(`${CARDS_ENDPOINT}/${id}`);
  // Procesa y retorna la respuesta
  return handleResponse(response);
}

/**
 * Función asíncrona para crear y registrar una nueva carta en el sistema (POST).
 * @param {Object} card - Objeto que contiene los datos de la nueva carta a crear.
 * @returns {Promise<Object>} - Retorna el objeto de la carta recién creada.
 */
export async function postCard(card) {
  // Realiza una petición HTTP POST enviando la información serializada en formato JSON
  const response = await fetch(CARDS_ENDPOINT, {
    method: 'POST', // Método HTTP para la creación de un nuevo recurso
    headers: {
      'Content-Type': 'application/json', // Especifica que el cuerpo de la solicitud es JSON
    },
    body: JSON.stringify(card), // Convierte el objeto de JavaScript a texto JSON
  });

  // Procesa y retorna la respuesta del servidor
  return handleResponse(response);
}

/**
 * Función asíncrona para reemplazar o editar de manera completa una carta existente (PUT).
 * @param {Object} card - Objeto con los datos nuevos y completos que reemplazarán al anterior.
 * @param {string|number} id - Identificador de la carta que será completamente reemplazada.
 * @returns {Promise<Object>} - Retorna el objeto de la carta actualizada.
 */
export async function putCard(card, id) {
  // Realiza una petición HTTP PUT al endpoint de la carta específica
  const response = await fetch(`${CARDS_ENDPOINT}/${id}`, {
    method: 'PUT', // Método HTTP para el reemplazo completo del recurso
    headers: {
      'Content-Type': 'application/json', // Especifica que el contenido es JSON
    },
    body: JSON.stringify(card), // Convierte el objeto completo a JSON
  });

  // Procesa y retorna la respuesta del servidor
  return handleResponse(response);
}

/**
 * Función asíncrona para actualizar de manera parcial una carta existente (PATCH).
 * @param {Object} data - Objeto con los campos específicos que se desean modificar (ej. cambiar el estado activo).
 * @param {string|number} id - Identificador de la carta que sufrirá la modificación parcial.
 * @returns {Promise<Object>} - Retorna el objeto de la carta con los cambios parciales aplicados.
 */
export async function patchCard(data, id) {
  // Realiza una petición HTTP PATCH al endpoint de la carta específica
  const response = await fetch(`${CARDS_ENDPOINT}/${id}`, {
    method: 'PATCH', // Método HTTP para la actualización parcial de un recurso
    headers: {
      'Content-Type': 'application/json', // Especifica que el contenido enviado es JSON
    },
    body: JSON.stringify(data), // Convierte las propiedades parciales a JSON
  });

  // Procesa y retorna la respuesta del servidor
  return handleResponse(response);
}

/**
 * Función asíncrona para eliminar una carta del sistema de forma permanente (DELETE).
 * @param {string|number} id - Identificador único de la carta a eliminar.
 * @returns {Promise<Object>} - Retorna la respuesta del servidor confirmando la eliminación.
 */
export async function deleteCard(id) {
  // Realiza una petición HTTP DELETE enviando el ID correspondiente al recurso a borrar
  const response = await fetch(`${CARDS_ENDPOINT}/${id}`, {
    method: 'DELETE', // Método HTTP para eliminar un recurso
  });

  // Procesa y retorna la respuesta del servidor
  return handleResponse(response);
}