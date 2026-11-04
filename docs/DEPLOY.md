# Despliegue

Todo corre en Cloudflare. Hay cuatro Workers y un contenedor:

| Pieza    | Worker              | URL                                            |
| -------- | ------------------- | ---------------------------------------------- |
| API      | `blindaje-api`      | https://blindaje-api.vigiaperu.workers.dev     |
| Consola  | `blindaje-console`  | https://blindaje-console.vigiaperu.workers.dev |
| Portal   | `blindaje-negocios` | https://blindaje-negocios.vigiaperu.workers.dev |
| Landing  | `blindaje-landing`  | https://blindaje-landing.vigiaperu.workers.dev |
| ML       | contenedor `MlContainer` de `blindaje-api` | (interno, por Durable Object) |

## Automático (GitHub Actions)

`.github/workflows/deploy.yml` corre cuando el CI pasa en `main`. También se puede lanzar a mano desde la pestaña Actions.

Pasos:

1. Aplica las migraciones de D1 pendientes (`infra/migrations`).
2. Despliega la API con `--containers-rollout=none`. El contenedor ML sigue con su imagen actual.
3. Despliega la consola, compilada contra la API en vivo (`VITE_API_URL=self`).
4. Despliega el portal contra la API en vivo, con `VITE_DEMO=1`: lee los casos sintéticos que el seed guarda en la base (`?demo=1`).
5. Despliega la landing.
6. Hace una prueba de humo: `/v1/health` y las cuatro páginas deben responder 200.

### Configuración (una sola vez)

1. **Cloudflare, token de API.** Ve a *My Profile → API Tokens → Create Token* y usa la plantilla *Edit Cloudflare Workers*.
   - Agrega los permisos de cuenta *D1: Edit*, *Queues: Edit* y *Containers: Edit*.
   - Limita el token a la cuenta del proyecto.
   - Si un paso falla por permisos, el mensaje de wrangler dice cuál falta.
2. **GitHub, entorno.** En *Settings → Environments*, crea el entorno `production` con dos secretos:
   - `CLOUDFLARE_API_TOKEN`: el token del paso anterior.
   - `CLOUDFLARE_ACCOUNT_ID`: el id de la cuenta, que aparece en el panel de Cloudflare a la derecha de *Workers & Pages*.

   En el mismo entorno puedes activar *Required reviewers* para aprobar cada despliegue a mano.
3. **GitHub Actions habilitado.** Si la cuenta tiene un bloqueo de facturación, GitHub no arranca ningún job. Se ve como *"The job was not started because your account is locked due to a billing issue"*.

Los secretos de los Workers (`JWT_SECRET`, `MODEL_API_KEY`, etc.) no pasan por GitHub. Viven en Cloudflare y se cambian con `wrangler secret put`.

## A mano

Desde la raíz del repo, con `wrangler login` hecho:

```bash
pnpm --filter @blindaje/api exec wrangler d1 migrations apply blindaje --remote
pnpm --filter @blindaje/api exec wrangler deploy --containers-rollout=none
VITE_API_URL=self pnpm --filter @blindaje/console run deploy
VITE_API_URL=https://blindaje-api.vigiaperu.workers.dev VITE_DEMO=1 pnpm --filter @blindaje/portal run deploy
pnpm --filter @blindaje/landing run deploy   # Astro exige Node 22.23.4 o más nuevo
```

## Imagen del contenedor ML

La imagen se construye en una máquina que tenga Docker y los pesos de Llama Prompt Guard 2 en `services/ml/.models-gated/`. Ver `services/ml/README.md`.

```bash
cd services/api
npx wrangler deploy     # construye services/ml/Dockerfile y lanza la imagen nueva
```

El contenedor duerme tras 30 minutos sin uso y despierta en 40 a 60 s. Antes de una demo, despiértalo con `pnpm --filter @blindaje/eval eval:infiltrado`.

## Volver atrás

Cada despliegue de un Worker crea una versión. Para volver a la anterior:

```bash
cd services/api && npx wrangler rollback   # lo mismo en apps/console, apps/portal o apps/landing
```

Las migraciones de D1 no se revierten solas. Una migración que necesite deshacerse se corrige con otra migración nueva.
