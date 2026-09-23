import { initializeOutput } from "./src/store";
import { contratosAlertas, contratosExtraer, contratosLeerBuzon, contratosRegistrar, contratosValidar } from "./src/tools/contratos";

await initializeOutput(true);
const inbox = await contratosLeerBuzon({ incluir_procesados: false });
if (!inbox.ok || !inbox.data) throw new Error(inbox.error ?? "No se pudo leer el buzón");

console.log("\n=== DEMO RETO 02 ===\n");
for (const correo of inbox.data) {
  const extracted = await contratosExtraer({ mensaje_id: correo.id });
  if (!extracted.ok || !extracted.data) { console.log(`${correo.id} → ERROR → ${extracted.error}`); continue; }
  const validation = await contratosValidar({ mensaje_id: correo.id, extraido: extracted.data });
  if (!validation.ok || !validation.data) { console.log(`${correo.id} → ERROR → ${validation.error}`); continue; }
  const first = await contratosRegistrar({ mensaje_id: correo.id, extraido: extracted.data, validacion: validation.data, confirmado: false });
  console.log(`${correo.id} → ${validation.data.clasificacion.toUpperCase()} → ${validation.data.requiere_revision.length ? `REVISIÓN: ${validation.data.requiere_revision.join(", ")}` : first.summary}`);
  if (validation.data.requiere_revision.length && correo.id === "msg-006") {
    const confirmed = structuredClone(extracted.data);
    confirmed.valor = { valor: 0, confianza: 1 };
    confirmed.fecha_fin = { valor: "2027-08-31", confianza: 1 };
    const revalidated = await contratosValidar({ mensaje_id: correo.id, extraido: confirmed });
    if (!revalidated.ok || !revalidated.data) throw new Error(revalidated.error ?? "No se pudo revalidar");
    const final = await contratosRegistrar({ mensaje_id: correo.id, extraido: confirmed, validacion: revalidated.data, confirmado: true });
    console.log(`${correo.id} → CONFIRMADO → ${final.summary}`);
  }
}
const alerts = await contratosAlertas({ hoy: "2026-09-03" });
console.log(`\nAlertas → ${alerts.summary}`);
console.log("\nArchivos generados en out/");
