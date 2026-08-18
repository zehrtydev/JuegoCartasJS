// Importa la función auxiliar encargada de construir las URLs de los endpoints a partir de la configuración global
import { buildEndpoint } from './apiConfig.js';

// Define la constante que almacena la ruta completa para acceder al recurso de jugadores usando el helper
const PLAYERS_ENDPOINT = buildEndpoint('players');

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
 * Función asíncrona para obtener la lista completa de jugadores registrados (GET general).
 * @returns {Promise<Array>} - Arreglo con todos los jugadores.
 */
export async function getPlayers() {
  // Realiza una petición HTTP GET al endpoint general de jugadores
  const response = await fetch(PLAYERS_ENDPOINT);
  // Procesa y retorna la respuesta utilizando la función auxiliar handleResponse
  return handleResponse(response);
}

/**
 * Función asíncrona para buscar un jugador específico filtrando por su nickname único.
 * @param {string} nickname - Apodo único del jugador a buscar en el sistema.
 * @returns {Promise<Array>} - Retorna un arreglo con el resultado de la coincidencia (vacío si no existe).
 */
export async function getPlayerByNickname(nickname) {
  // Realiza una petición HTTP GET pasando el nickname como parámetro de consulta en la URL, codificándolo de manera segura
  const response = await fetch(`${PLAYERS_ENDPOINT}?nickname=${encodeURIComponent(nickname)}`);
  // Procesa y retorna la respuesta
  return handleResponse(response);
}

/**
 * Función asíncrona para registrar un nuevo jugador en la base de datos (POST).
 * @param {Object} player - Objeto que contiene la información del nuevo jugador (id, nickname, puntos, wins, losses, etc.).
 * @returns {Promise<Object>} - Retorna el objeto del jugador recién creado.
 */
export async function createPlayer(player) {
  // Realiza una petición HTTP POST enviando los datos del jugador serializados en formato JSON
  const response = await fetch(PLAYERS_ENDPOINT, {
    method: 'POST', // Método HTTP para la creación de un nuevo recurso
    headers: {
      'Content-Type': 'application/json', // Especifica que el contenido enviado es JSON
    },
    body: JSON.stringify(player), // Convierte el objeto de JavaScript a texto JSON
  });

  // Procesa y retorna la respuesta del servidor
  return handleResponse(response);
}

/**
 * Función asíncrona para actualizar la información completa de un jugador existente (PUT).
 * @param {string|number} id - Identificador único del jugador que será actualizado.
 * @param {Object} playerData - Objeto con los nuevos datos completos del jugador.
 * @returns {Promise<Object>} - Retorna el objeto del jugador actualizado.
 */
export async function updatePlayer(id, playerData) {
  // Realiza una petición HTTP PUT al endpoint del jugador específico utilizando su ID
  const response = await fetch(`${PLAYERS_ENDPOINT}/${id}`, {
    method: 'PUT', // Método HTTP para reemplazar o actualizar completamente el recurso
    headers: {
      'Content-Type': 'application/json', // Especifica que el contenido enviado es JSON
    },
    body: JSON.stringify(playerData), // Convierte los datos actualizados a texto JSON
  });

  // Procesa y retorna la respuesta del servidor
  return handleResponse(response);
}
