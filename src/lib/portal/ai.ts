import type { PortalStore, ProjectBundle } from "./types";
import { formatStage } from "./format";

const phaseGuidance = {
  analyse:
    "Verdichte zuerst den Ist-Zustand: Hauptprozesse, Datenquellen, Rollen, manuelle Übergaben und wiederkehrende Entscheidungen.",
  structure:
    "Ordne die Probleme in Prozess-, Daten-, Tool- und Verantwortlichkeitslücken. Entferne unnötige Schritte, bevor neue Automatisierung entsteht.",
  digitize:
    "Prüfe, welche Daten, Dokumente und Workflows standardisiert werden müssen, damit Automatisierung stabil und DSGVO-sauber möglich wird.",
  automate:
    "Bewerte jeden Use Case nach Wirkung, Aufwand, Datenqualität und Änderungsrisiko. Starte mit einem Quick Win, der intern Akzeptanz schafft.",
  realize:
    "Plane Umsetzung, Training, Betrieb und KPIs. Der Kunde sollte sehen, was umgesetzt wird, wer beteiligt ist und woran Erfolg gemessen wird.",
};

function words(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9äöüß ]/gi, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4),
  );
}

export function buildConsultantGuidance(bundle: ProjectBundle) {
  const { project, organization, intelligence, tasks, updates } = bundle;
  const missing = [
    ["Stakeholder", intelligence.stakeholders],
    ["Ziele", intelligence.goals],
    ["Tool-Landschaft", intelligence.currentTools],
    ["Datenlage", intelligence.dataSituation],
    ["Constraints", intelligence.constraints],
  ]
    .filter(([, value]) => !String(value).trim())
    .map(([label]) => label);

  return [
    {
      title: `ASDAR-Fokus: ${formatStage(project.asdarStage)}`,
      body: phaseGuidance[project.asdarStage],
    },
    {
      title: "Nächste Beratungsbewegung",
      body:
        project.nextStep ||
        "Formuliere den nächsten sichtbaren Schritt so, dass der Kunde ihn im Portal nachvollziehen kann.",
    },
    {
      title: "Automatisierungshebel",
      body: intelligence.opportunities
        ? `Aktuell sichtbar: ${intelligence.opportunities}`
        : `Für ${organization.industry} zuerst repetitive Aufgaben mit klaren Eingaben und prüfbaren Ausgaben identifizieren.`,
    },
    {
      title: "Lücken im Intake",
      body: missing.length
        ? `Noch ergänzen: ${missing.join(", ")}.`
        : "Der Intake ist gut gefüllt. Jetzt Hypothesen priorisieren und in Roadmap-Bausteine übersetzen.",
    },
    {
      title: "Kommunikation an den Kunden",
      body:
        updates.filter((update) => update.visibility === "customer").length > 0
          ? "Halte die Updates knapp, konkret und ergebnisorientiert: Was wurde gelernt, was passiert als Nächstes, was wird vom Kunden gebraucht?"
          : "Veröffentliche ein erstes Kundenupdate, damit sichtbar wird, dass die Analyse läuft und welche Informationen gebraucht werden.",
    },
    {
      title: "Projektsteuerung",
      body:
        tasks.filter((task) => task.status !== "done").length > 0
          ? "Offene Aufgaben sollten immer einen Owner haben. Kunde sieht nur freigegebene Aufgaben."
          : "Lege mindestens eine Assad-Aufgabe und eine Kundenaufgabe an, damit der nächste Schritt operativ klar ist.",
    },
  ];
}

export function findSimilarProjects(store: PortalStore, bundle: ProjectBundle) {
  return findSimilarProjectBundles(
    store.projects
      .map((project) => {
        const organization = store.organizations.find(
          (entry) => entry.id === project.organizationId,
        );
        if (!organization) return null;
        return {
          project,
          organization,
          intelligence:
            store.projectIntelligence.find(
              (entry) => entry.projectId === project.id,
            ) ?? bundle.intelligence,
        };
      })
      .filter(
        (
          entry,
        ): entry is Pick<ProjectBundle, "project" | "organization" | "intelligence"> =>
          Boolean(entry),
      ),
    bundle,
  );
}

export function findSimilarProjectBundles(
  bundles: Array<Pick<ProjectBundle, "project" | "organization" | "intelligence">>,
  bundle: ProjectBundle,
) {
  const sourceText = [
    bundle.organization.industry,
    bundle.intelligence.issues,
    bundle.intelligence.goals,
    bundle.intelligence.opportunities,
  ].join(" ");
  const sourceWords = words(sourceText);

  return bundles
    .filter((candidate) => candidate.project.id !== bundle.project.id)
    .map((candidate) => {
      const candidateText = [
        candidate.organization.industry,
        candidate.intelligence.issues,
        candidate.intelligence.goals,
        candidate.intelligence.opportunities,
      ].join(" ");
      const candidateWords = words(candidateText);
      const overlap = [...sourceWords].filter((word) =>
        candidateWords.has(word),
      );

      return {
        project: candidate.project,
        organization: candidate.organization,
        score: overlap.length,
        overlap: overlap.slice(0, 5),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
