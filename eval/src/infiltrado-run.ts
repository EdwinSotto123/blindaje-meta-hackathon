import { runInfiltrado } from "./api-evals";
import { demoApi } from "./demo-data";
/**
 * pnpm eval:infiltrado: solo la prueba del infiltrado contra la API desplegada. Un dispositivo nuevo
 * sube un audio con la voz de A y B, el caso pasa por todo el procesamiento (contenedor ML incluido),
 * se comprueba que no recibe nada de otros casos y se borra. Sirve para ver que el pipeline
 * funciona de punta a punta antes de grabar el demo. No escribe el reporte.
 */
async function main() {
  const t = Date.now();
  const r = await runInfiltrado(demoApi(), Number(process.env.DEMO_WAIT_SECONDS ?? 300));
  for (const c of r.chequeos)
    console.log(`${c.ok ? "ok   " : "FALLA"} ${c.nombre}${c.detalle ? ` (${c.detalle})` : ""}`);
  for (const a of r.advertencias ?? []) console.log(`aviso ${a}`);
  console.log(
    `${r.pasa ? "Pasa" : "No pasa"}: ${r.estado}${r.motivo ? `, ${r.motivo}` : ""}. ${Math.round((Date.now() - t) / 1000)} s.`,
  );
  if (!r.pasa) process.exitCode = 1;
}

void main();
