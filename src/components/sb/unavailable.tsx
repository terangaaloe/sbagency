/* Écran neutre « Page indisponible » — aucune fuite d'information.
   Utilisé pour les tenants inexistants ou les pages désactivées. */
export function Unavailable({ code = "HTTP 404 · PAGE INDISPONIBLE" }: { code?: string }) {
  return (
    <div className="app-root">
      <div className="unavail">
        <div>
          <div className="unavail__code">{code}</div>
          <h1>
            Page
            <br />
            indisponible
          </h1>
          <p style={{ color: "var(--sb-gray-300)", maxWidth: 420, margin: "0 auto" }}>
            Cette page partenaire n&apos;est pas accessible publiquement pour le moment.
          </p>
        </div>
      </div>
    </div>
  );
}
