# Reto 02 — Registro de Contratos Vigentes

Solución en TypeScript + Bun con frontend HTML, backend HTTP y herramientas tipadas con Zod.

## Requisitos

* Bun instalado.
* Para ejecutar el modo agente se requiere una `OPENAI_API_KEY` en `.env`.

## Instalación

```bash
bun install
cp .env.example .env
```

Completa `OPENAI_API_KEY` en `.env`.

## Demo local

La demo es determinista y no necesita una clave de proveedor:

```bash
bun run demo
```

Procesa los seis mensajes, muestra clasificación, revisión y confirmación del `msg-006` y genera `out/alertas.md`.

## Aplicación

Para ejecutar la aplicación:

```bash
bun run dev
```

Abrir en el navegador:

http://localhost:3000

Prompt recomendado:

```text
Procesa el buzón de contratos con fecha de hoy 2026-09-03. Registra lo que esté limpio, muéstrame lo que requiere revisión campo por campo y termina con el reporte de alertas. No registres nada dudoso sin preguntarme.
```

Para `msg-006`, la demo confirma explícitamente valor 0 y fecha fin 2027-08-31, tal como indica el PRD.

## Variables de entorno

* `OPENAI_API_KEY`: clave de acceso al proveedor del modelo.
* `OPENAI_MODEL`: modelo utilizado por el agente.
* `PORT`: puerto HTTP de la aplicación.
* `MAX_AGENT_ITERATIONS`: límite de iteraciones del agente.
* `MAX_TOKENS_PER_TURN`: límite de tokens por turno.

## Salidas

* `out/sharepoint/maestro-contratos.csv`
* `out/sharepoint/Contratos/...`
* `out/sharepoint/historial.jsonl`
* `out/procesados.json`
* `out/log.jsonl`
* `out/alertas.md`

## Seguridad

La clave del proveedor solo se lee desde el backend mediante `OPENAI_API_KEY`. No se incluye en el frontend ni en los logs.

## Prueba

**Link local:** http://localhost:3000

**Access key:** No aplica.

Si se utiliza un despliegue público para la defensa, el link de prueba debe reemplazarse por la URL correspondiente.

## Nota de despliegue

Para una defensa remota, se puede desplegar el mismo servidor en un proveedor que ejecute Bun. La aplicación es independiente de Periferia y utiliza únicamente los fixtures entregados.
pendiente de Periferia y usa únicamente los fixtures entregados.
