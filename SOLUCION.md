# SOLUCION.md — Reto 02

## 1. Problema en una frase
Centralizar y automatizar el registro de contratos que llegan por correo, evitando duplicados, conservando actualizaciones y deteniendo datos de baja confianza para revisión humana.

## 2. Arquitectura

```text
Frontend HTML
   ↓ POST /api/chat
Backend Bun
   ↓
Ciclo del agente + OpenAI
   ↓
Herramientas Zod
   ├── contratos_leer_buzon
   ├── contratos_extraer
   ├── contratos_validar
   ├── contratos_registrar
   └── contratos_alertas
   ↓                         ↓
fixtures (solo lectura)    out/ (escritura)
```

El comportamiento vive en `agent/prompt.md`, el conocimiento de proceso en `src/knowledge/registro-contratos.md` y la ejecución en `src/tools/contratos.ts`.

## 3. Ciclo del agente
El backend envía el historial y el prompt al modelo. Cuando el modelo solicita una herramienta, el backend ejecuta la función tipada y devuelve su resultado al modelo. El ciclo tiene un límite configurable mediante `MAX_AGENT_ITERATIONS`. La herramienta de registro bloquea automáticamente cualquier operación con `requiere_revision` si `confirmado` no es `true`.

## 4. Elección del modelo
Se utiliza OpenAI mediante un adaptador sencillo. El modelo se configura con `OPENAI_MODEL` y por defecto se usa `gpt-5-mini`. La clave se mantiene exclusivamente en el backend. El costo depende del precio vigente del proveedor y del volumen de tokens, por lo que se deja configurable y no se fija un precio histórico en código.

## 5. Estrategia de extracción
La extracción P0 es determinista porque los fixtures contienen texto. Se utilizan expresiones regulares y heurísticas para identificar ID, cliente, NIT/RUC, país, objeto, valor, moneda, fechas y pólizas. Cada campo recibe una confianza. No se inventan campos ausentes: quedan `null` con confianza 0.

El modelo puede orquestar las herramientas, pero el valor que llega al registro debe pasar por `contratos_validar` y `contratos_registrar`.

Para el contrato marco `msg-006`, el valor por demanda se representa como 0, pero con confianza baja, y la fecha final derivada del plazo también requiere confirmación. Esto reproduce la regla de negocio indicada por el PRD.

## 6. Regla de gobierno propuesta

### Canal único
Todo contrato debe llegar al buzón `contratos@periferia-ficticia.com`, administrado por el área administrativa responsable del maestro.

### Obligación del comercial
Dentro de 1 día hábil de la firma, el comercial debe enviar PDF firmado, otrosíes y actas de terminación cuando existan. Asunto sugerido: `CONTRATO | <cliente> | <id>`.

### Acuse automático
El agente confirma recepción, identifica el mensaje y devuelve estado: registrado, actualizado, duplicado, rechazado o pendiente de confirmación.

### Excepciones y escalamiento
Un documento sin firma, sin contraparte identificable o con información esencial ambigua queda en revisión y se escala al responsable administrativo/comercial. El agente no hace revisión jurídica.

### Cierre del gap junio–agosto 2026
Realizar una campaña única contra contratos facturados o activos en ese periodo, solicitando a cada comercial el PDF firmado y sus otrosíes. El resultado se compara con el maestro y se registra con fuente `migracion` cuando corresponda.

### Indicador mensual
`% de contratos facturados que existen en el maestro` = contratos facturados con coincidencia en el maestro / contratos facturados del periodo × 100.

## 7. Decisiones y trade-offs
1. **Extracción determinista primero vs. extracción 100% LLM.** Se eligió determinista para los fixtures porque reduce alucinaciones y hace `demo.ts` reproducible. El LLM queda como orquestador.
2. **CSV vs. base de datos.** Se mantuvo CSV porque el PRD lo exige y facilita una solución independiente. En producción migraría a una base transaccional.
3. **Sesiones en memoria vs. almacenamiento externo.** Se eligió memoria para el reto por simplicidad. En producción usaría un almacén persistente.
4. **PDF/OCR.** No se implementó OCR porque no es necesario para los fixtures y es un no-objetivo P0.

## 8. Supuestos
- Los fixtures representan el flujo real del ejercicio.
- `msg-006` debe confirmarse con valor 0 y fecha fin 2027-08-31, como especifica el prompt de demo del PRD.
- Un comercial desconocido no bloquea el registro.
- Una póliza nueva se marca `pendiente` hasta que exista evidencia de vigencia.

## 9. Cobertura
| Historia | Estado |
|---|---|
| HU-1 Leer buzón | Hecho |
| HU-2 Extraer datos y confianza | Hecho |
| HU-3 Validar/clasificar | Hecho |
| HU-4 Registrar/archivar/historial | Hecho |
| HU-5 Alertas | Hecho |
| HU-6 Errores tipados | Hecho |

Para producción faltaría autenticación, persistencia de sesiones, integración real con Exchange/SharePoint, OCR, observabilidad y pruebas de seguridad más profundas.

## 10. Riesgos y mitigaciones
- Falsos duplicados: priorizar ID y NIT antes que nombres.
- Fechas inferidas incorrectamente: baja confianza + confirmación humana.
- Exposición de la API key: solo variable de entorno del backend.
- Error de un mensaje: resultados tipados y procesamiento independiente.
- Rotación del personal: buzón único, historial y regla de gobierno.
