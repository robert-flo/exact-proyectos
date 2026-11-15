# contador

Dos botones: uno suma, otro resta. El hola mundo del programa de aprendizaje
Exact by Expo (criterio de cierre: poder explicarlo con palabras propias).

## Mapa de archivos

| Archivo | Qué es y por qué está aquí |
|---|---|
| `app.contract` | La vista completa, en el DSL Contract: shapes (tipos de datos), rutas de navegación, componente con `state`, `action` y `view`. El corazón del proyecto; está comentado bloque por bloque. |
| `app.ts` | La capa de datos: `sources` (mapa nombre → función) y `answer` (el único punto de entrada) responden a los `resource` que declara el contrato. Comentado. |
| `app.contract.d.ts` | Tipos GENERADOS a partir del contrato. No se edita a mano: se regenera con el compilador. |
| `app.test.contract` | Pruebas declarativas (`tap`, `expect`) que corren contra la app real en un navegador. Nota: este DSL no admite comentarios, por eso está limpio; la explicación de cada prueba está aquí arriba. |
| `app.json` | Metadata de la app: nombre, id (`com.robertflo.contador`), plataformas habilitadas (`host.web`). |
| `exact.mjs` | El corredor de exact: todos los comandos pasan por aquí (`web`, `test web`, `contract build`, `setup`). |
| `package.json` | Declara Bun y las dependencias del proyecto. Sin Node ni npm. |
| `AGENTS.md` / `CLAUDE.md` | Instrucciones para agentes de IA que trabajen en el proyecto (el usuario no usa Claude; AGENTS.md manda). |
| `.gitignore` | Ignora lo generado: `target/` (builds), `.exact/` (estado local), `node_modules/` (deps). |

@ref LLP 0001#mapa-de-archivos — README con mapa de archivos
@ref LLP 0001#codigo-comentado — Código como material de estudio
