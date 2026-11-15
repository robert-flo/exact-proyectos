# AGENTS.md — exact-proyectos

Micro-proyectos educativos del programa de aprendizaje Exact by Expo.
El punto de convergencia del programa es el vault `PJ-EXPO-rf-vault`
(índice, diario, LLPs); aquí vive solo el código, una carpeta por proyecto.

## Convención 1: código comentado para enseñar

@ref LLP 0001#codigo-comentado — Código como material de estudio

- Todo archivo de código lleva comentarios profusos, en español, escritos
  como quien se los explica a un alumno: qué hace cada bloque, por qué está
  ahí y qué pasa si se quita. Los comentarios SON la lección.
- Excepción real: `*.test.contract` no admite comentarios en su DSL; la
  explicación de esas pruebas va en el README del proyecto.
- El usuario no escribe código: lee, entiende y explica. Al escribir o
  regenerar código, los comentarios se conservan y actualizan; nunca se
  "limpian" los archivos.

## Convención 2: README con mapa de archivos

@ref LLP 0001#mapa-de-archivos — README con mapa de archivos

- El `README.md` de cada proyecto lleva una tabla con CADA archivo del
  proyecto (excluye lo generado: `target/`, `.exact/`, `node_modules/`),
  su función y por qué existe, en una frase. Objetivo: que al abrir el repo
  sepas por qué está cada archivo. Un archivo nuevo entra con su fila de
  tabla en el mismo commit.

## Estilo

- Commits y comentarios: en español, de una línea, escritos como los
  escribiría una persona; sin firma, pie ni mención de agentes o plataformas.
- Los documentos LLP con las decisiones del programa viven en el vault:
  https://github.com/robert-flo/PJ-EXPO-rf-vault (carpeta `llp/`).
