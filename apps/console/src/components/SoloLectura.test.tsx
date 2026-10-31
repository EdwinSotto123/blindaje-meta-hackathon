import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ConsoleUser } from "../api/types";
import { AuthContext, type AuthValue } from "../app/context";
import { Acciones, SOLO_LECTURA_TEXTO } from "./SoloLectura";

const base: ConsoleUser = {
  id: "usr-demo-admin",
  email: "admin@demo.blindaje.test",
  display_name: "Administración Demo",
  role: "admin",
  org: { id: "org-central", name: "Equipo de Blindaje" },
};

function render(user: ConsoleUser, compact = false) {
  const value: AuthValue = {
    status: "authed",
    user,
    expired: false,
    loggedOut: false,
    health: null,
    isDemo: true,
    login: async () => user,
    logout: async () => {},
  };
  return renderToStaticMarkup(
    <AuthContext.Provider value={value}>
      <Acciones className="row" label="Decisión" compact={compact}>
        <button type="button" className="btn btn-primary">
          Confirmar vínculo
        </button>
      </Acciones>
    </AuthContext.Provider>,
  );
}

describe("acciones de la consola con la cuenta de jurado", () => {
  it("quedan desactivadas, con el motivo escrito y ligado al grupo", () => {
    const html = render({ ...base, id: "usr-demo-jurado", solo_lectura: true });
    expect(html).toMatch(/<fieldset class="acciones row" disabled="" aria-label="Decisión" aria-describedby="([^"]+)">/);
    const id = /aria-describedby="([^"]+)"/.exec(html)![1];
    expect(html).toContain(`<p id="${id}" class="solo-lectura-nota">`);
    expect(html).toContain(SOLO_LECTURA_TEXTO);
  });

  it("en un botón suelto, el motivo va en dos palabras", () => {
    const html = render({ ...base, solo_lectura: true }, true);
    expect(html).toContain("Solo lectura</span>");
    expect(html).not.toContain(`>${SOLO_LECTURA_TEXTO}<`);
  });

  it("para el resto del equipo no cambian", () => {
    const html = render(base);
    expect(html).toContain('<fieldset class="acciones row" aria-label="Decisión">');
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("solo-lectura-nota");
  });
});
