# Contrato inicial de `db.json`

La API local se expone con JSON Server en `http://localhost:3000`. Los cuatro recursos son colecciones REST y admiten `GET`, `POST`, `PUT`, `PATCH` y `DELETE` por identificador. El CRUD completo de la interfaz se reservará para `cards`.

> La contraseña de `admins` es una semilla de desarrollo para la práctica. No representa un mecanismo de autenticación seguro ni debe reutilizarse fuera de un entorno local.

## `admins`

`id`, `username`, `password`, `displayName`.

## `players`

`id`, `alias`, `points`, `wins`, `losses`, `gamesPlayed`, `createdAt`, `updatedAt`.

`alias` debe ser único; JSON Server no puede imponer esa regla, por lo que la aplicación la validará antes de crear el perfil.

## `cards`

`id`, `pokedexNumber`, `name`, `types`, `hp`, `spriteUrl`, `cryUrl`, `moves`, `specialMove`, `isActive`.

`types` es un arreglo de uno o dos tipos. Cada elemento de `moves` tiene `name`, `power` (20, 30, 40 o 50) y `type`; `specialMove` tiene la misma forma y `power: 70`. El catálogo final contendrá los 151 Pokémon de la primera generación.

## `battles`

`id`, `playerId`, `result`, `pointsAwarded`, `playerTeam`, `botTeam`, `turns`, `log`, `playedAt`.

Los equipos y el registro se guardan como instantáneas para que el historial no cambie si una carta se edita o se elimina posteriormente.
