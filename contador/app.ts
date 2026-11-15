// =====================================================================
// La capa de datos del contador.
// La vista (app.contract) declara QUÉ necesita con `resource`;
// este archivo decide CÓMO conseguirlo. Hoy no hay servidor ni base de
// datos: las respuestas son fijas, fabricadas aquí mismo.
//
// @ref LLP 0001#codigo-comentado — Código como material de estudio
// =====================================================================
import type { Answer, Result, Sources } from './app.contract.d.ts';

// grants: qué permisos externos pide esta app (todavía ninguno).
export const grants = '';

// sources: el mapa nombre → función. Cada `resource` del contrato busca
// aquí su respuesta por nombre, igual que un teléfono busca en una agenda.
// - greeting recibe sus argumentos como lista ([name] toma el primero
//   y lo llama `name`) y devuelve un objeto con la forma del shape
//   Greeting: { text: string }.
// - Result<'greeting'> le dice a TypeScript que el valor de regreso
//   DEBE coincidir con esa forma; si no, no compila.
const sources: Sources = {
  greeting: ([name]): Result<'greeting'> => ({ text: `Hello from ${name}.` }),
};

// answer es el único punto de entrada que el runtime de exact llama:
// le llegan el nombre del recurso y sus argumentos, y enruta al sources
// correspondiente. Es la recepcionista del edificio.
//
// app.contract.d.ts es un archivo GENERADO a partir del contrato:
// nunca se edita a mano; se regenera con el compilador.
export const answer: Answer = (source, args, store, storage, native) =>
  sources[source](args, store, storage, native);
