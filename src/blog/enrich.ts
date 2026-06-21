import type { FigureSpec } from "@/components/blog-figures";

export type Enrichment = {
  keyTakeaways?: string[];
  figures?: { afterHeadingIncludes: string; spec: FigureSpec }[];
};

export const enrich: Record<string, Enrichment> = {
  "ki-im-unternehmen-einfuehren": {
    keyTakeaways: [
      "Nicht das Tool zuerst, sondern der Prozess: Wer einen unklaren Ablauf automatisiert, bekommt unklare Ergebnisse, nur schneller.",
      "Geeignete Einstiegsprozesse erkennen Sie an vier Merkmalen: hohe Frequenz, klare Regeln, strukturierte Daten und spürbarer manueller Aufwand.",
      "Daten, Mitarbeiter und Abläufe entscheiden über den Erfolg, nicht der Hype um neue Modelle und Features.",
      "Die ASDAR Method ordnet den Einstieg in fünf Schritten: Analysieren, Strukturieren, Digitalisieren, Automatisieren, Realisieren.",
      "Starten Sie mit einem klar abgegrenzten Pilotprojekt mit messbarem Nutzen statt mit dem größten denkbaren Vorhaben.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Welche Prozesse Sie zuerst analysieren sollten",
        spec: {
          type: "checklist",
          title: "Eignet sich ein Prozess für den KI-Einstieg?",
          items: [
            { text: "Hohe Frequenz: Der Prozess läuft täglich oder wöchentlich", ok: true },
            { text: "Klare Regeln: nachvollziehbare Entscheidungslogik statt Bauchsache", ok: true },
            { text: "Strukturierte Daten liegen digital und halbwegs sauber vor", ok: true },
            { text: "Spürbarer manueller Aufwand, etwa durch Copy-Paste oder Suchen", ok: true },
            { text: "Klar abgegrenzter Prozess mit definiertem Anfang und Ende", ok: true },
            { text: "Den komplexesten oder spannendsten Prozess als Erstes wählen", ok: false },
            { text: "Tool kaufen, bevor das zu lösende Problem klar ist", ok: false },
          ],
        },
      },
      {
        afterHeadingIncludes: "Wie ein strukturierter Einstieg aussieht",
        spec: {
          type: "numberedSteps",
          steps: [
            { title: "Analysieren", text: "Welche Prozesse gibt es, wo entsteht Aufwand, wo liegen die Daten? Bestandsaufnahme vor jeder Entscheidung." },
            { title: "Strukturieren", text: "Daten und Abläufe ordnen, Doppelarbeit und Brüche sichtbar machen, Prioritäten setzen." },
            { title: "Digitalisieren", text: "Was noch analog oder manuell läuft, in einen sauberen digitalen Ablauf überführen." },
            { title: "Automatisieren", text: "Erst jetzt kommen Regeln, Schnittstellen und KI ins Spiel, gezielt dort, wo sie tragen." },
            { title: "Realisieren", text: "Umsetzen, messen, im Betrieb verankern und schrittweise ausweiten." },
          ],
        },
      },
    ],
  },

  "prozesse-mit-ki-automatisieren": {
    keyTakeaways: [
      "Zehn Prozesse lassen sich in fast jeder Branche automatisieren: von E-Mail-Vorsortierung und Angebotsvorbereitung über Reporting und Rechnungsworkflows bis zu Meeting-Protokollen und Marketing-Content.",
      "Geeignet ist ein Prozess nur, wenn vier Faktoren stimmen: Häufigkeit, Regelhaftigkeit, Datenqualität und ein beherrschbares Fehlerrisiko.",
      "KI übernimmt den Rohbau und die Routine, der Mensch prüft und gibt frei; gerade bei Kundenservice und Rechnungen ist eine klare Eskalationslogik Pflicht.",
      "Werkzeug kommt nach Prozess: Wer ein Tool kauft, bevor er den Ablauf verstanden hat, automatisiert oft das Falsche und schafft teure Insellösungen.",
      "Die Liste ist Inspiration, kein Umsetzungsplan; welcher Use Case den größten Hebel hat, zeigt erst eine saubere Analyse über die ASDAR Method und den ASDAR Score.",
    ],
    figures: [
      {
        afterHeadingIncludes: "E-Mail-Antworten und Posteingang sortieren",
        spec: {
          type: "beforeAfter",
          caption: "Vier Prozesse: heute manuell vs. mit KI",
          items: [
            {
              title: "E-Mail-Posteingang",
              before: "Jede Mail einzeln lesen, zuordnen und wiederkehrende Antworten von Hand tippen",
              after: "Nachrichten nach Thema und Dringlichkeit kategorisiert, Antwortentwürfe nur noch geprüft und freigegeben",
              saves: "Kürzere Reaktionszeiten im Kundenkontakt",
            },
            {
              title: "Angebotsvorbereitung",
              before: "Textbausteine, Preise und alte Angebote zusammensuchen, jedes Dokument neu bauen",
              after: "Module, Preisstaffeln und Formulierungen vorgeschlagen, erster Entwurf in Minuten",
              saves: "Stunden statt Minuten pro Angebot",
            },
            {
              title: "Rechnungsworkflows",
              before: "Eingangsrechnungen sichten, Daten abtippen, prüfen und manuell weiterleiten",
              after: "Felder ausgelesen, mit Bestellungen abgeglichen, Abweichungen markiert, in die Freigabe eingespeist",
              saves: "Schnellere Durchlaufzeiten, weniger Routinearbeit",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "Welche Prozesse sich für Sie wirklich lohnen",
        spec: {
          type: "checklist",
          title: "Eignet sich der Prozess für Automatisierung?",
          items: [
            { text: "Hohe Häufigkeit: Die Aufgabe läuft oft genug, dass sich der Aufwand amortisiert", ok: true },
            { text: "Regelhaftigkeit: Der Ablauf ist klar genug, um ihn zu beschreiben", ok: true },
            { text: "Datenqualität: Die nötigen Informationen liegen sauber und zugänglich vor", ok: true },
            { text: "Beherrschbares Risiko: Fehlerfolgen sind abgesichert, eine Eskalationslogik ist definiert", ok: true },
            { text: "Tool zuerst kaufen, bevor der Ablauf verstanden ist", ok: false },
            { text: "Die zehn Beispiele ungeprüft als fertigen Umsetzungsplan übernehmen", ok: false },
          ],
        },
      },
    ],
  },

  "asdar-method": {
    keyTakeaways: [
      "Die meisten KI-Projekte scheitern nicht an der Technik, sondern an der Reihenfolge: ein Tool wird gekauft, bevor jemand den Prozess verstanden hat.",
      "ASDAR steht für fünf aufeinander aufbauende Phasen – Analysieren, Strukturieren, Digitalisieren, Automatisieren, Realisieren – und keine wird übersprungen.",
      "Die Tool-Entscheidung fällt erst in Phase 4: Nicht jedes Problem braucht ein Sprachmodell, manchmal genügt eine saubere Schnittstelle.",
      "Der ASDAR Score bewertet vier Dimensionen – Prozessreife, Datenverfügbarkeit, Automatisierungsgrad und organisatorische Bereitschaft – und macht den KI-Reifegrad messbar.",
      "Am Ende steht ein Arbeitsdokument aus Effizienz-Karte, priorisierter Roadmap und Tool-Empfehlung pro Use Case – kein Foliensatz mit Buzzwords.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Die fünf Phasen der ASDAR Method",
        spec: {
          type: "asdarPipeline",
        },
      },
      {
        afterHeadingIncludes: "Wie der ASDAR Score den Reifegrad misst",
        spec: {
          type: "scoreRadar",
          caption: "Beispielhafte Reifegrad-Einordnung über die vier bewerteten Dimensionen des ASDAR Score.",
          axes: [
            { label: "Prozessreife", value: 60 },
            { label: "Datenverfügbarkeit", value: 45 },
            { label: "Automatisierungsgrad", value: 35 },
            { label: "Organisatorische Bereitschaft", value: 55 },
          ],
        },
      },
    ],
  },

  "ki-in-der-pflege": {
    keyTakeaways: [
      "KI ersetzt keine Pflegekraft, sondern übernimmt schreibintensive und koordinierende Routine - das Vier-Augen-Prinzip bleibt, jeder Eintrag wird vom Menschen geprüft und verantwortet.",
      "Fünf konkrete Hebel entlasten am stärksten: Pflegedokumentation per Sprachnotiz, Dienst- und Tourenplanung, Angehörigenkommunikation, strukturierte Übergaben und KI-gestützter Zugriff auf interne Standards.",
      "Gesundheitsdaten fallen unter Art. 9 DSGVO: EU-Hosting, belastbare Auftragsverarbeitung, Datensparsamkeit, kein Training mit Echtdaten und klare Zugriffsrechte gehören von Beginn an in die Anbieterauswahl.",
      "Die Reihenfolge entscheidet: erst den Prozess analysieren und strukturieren, dann das Werkzeug wählen - wer umgekehrt vorgeht, automatisiert nur den vorhandenen Aufwand.",
      "Mit dem ASDAR Score lässt sich vorab einschätzen, welche Abläufe den größten Entlastungshebel bieten, statt überall gleichzeitig zu starten.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Wo digitale Prozesse konkret entlasten",
        spec: {
          type: "useCaseGrid",
          caption: "Fünf praxisnahe Felder, in denen KI Routine abnimmt - die fachliche Verantwortung bleibt beim Team.",
          items: [
            { title: "Dokumentation", text: "Sprachnotizen werden zu strukturierten Einträgen, Standardbausteine vorgeschlagen - die Pflegekraft prüft und bestätigt." },
            { title: "Dienst- und Einsatzplanung", text: "Schichten nach Qualifikation vorbelegen, Touren nach Wegezeit optimieren, bei Ausfall schneller Vertretung vorschlagen." },
            { title: "Angehörigenkommunikation", text: "Standardauskünfte als Antwortentwurf vorbereiten - freigegeben und versendet wird weiterhin durch einen Menschen." },
            { title: "Übergaben", text: "Schichtnotizen zu einer konsistenten Übergabe zusammenfassen: Veränderungen, offene Aufgaben, Auffälligkeiten." },
            { title: "Interne Standards", text: "Durchsuchbarer Wissenszugriff beantwortet Ablauffragen direkt aus freigegebenen Hausdokumenten statt aus Modellwissen." },
          ],
        },
      },
      {
        afterHeadingIncludes: "sensible Daten verlangen klare Regeln",
        spec: {
          type: "checklist",
          title: "Datenschutz-Rahmen bei Gesundheitsdaten (Art. 9 DSGVO)",
          caption: "Vier Bedingungen, die vor der Werkzeugentscheidung geklärt sein müssen.",
          items: [
            { text: "Verarbeitung mit EU-Hosting und belastbaren Auftragsverarbeitungsvertraegen", ok: true },
            { text: "Datensparsamkeit: nur die Daten verarbeiten, die der Prozess wirklich braucht", ok: true },
            { text: "Klare Zugriffsrechte und Protokollierung, wer was eingesehen hat", ok: true },
            { text: "Patientendaten fliessen ungefragt in das Modelltraining", ok: false },
            { text: "Ungeklaerte Datenabfluesse in Drittlaender ausserhalb der EU", ok: false },
          ],
        },
      },
    ],
  },

  "ki-im-autohandel": {
    keyTakeaways: [
      "Geschwindigkeit entscheidet: Wer auf eine Wochenend-Anfrage erst Tage später reagiert, verliert den Interessenten an den Wettbewerber - KI verkürzt die Reaktionszeit von Stunden auf Minuten.",
      "Lead-Erfassung und Terminvereinbarung bringen im Autohaus den schnellsten Effekt: Anfragen aus Mobile.de, AutoScout24, WhatsApp und Telefon werden kanalübergreifend zusammengeführt, automatisch ins CRM gelegt und sofort bestätigt.",
      "KI ersetzt keine Verkäufer, sondern übernimmt Routine - Datenerfassung, Standardantworten, Erinnerungen und Follow-up-Sequenzen - und schafft so Zeit für Kunden mit echter Kaufabsicht.",
      "Fahrzeugbeschreibungen entstehen in Sekunden statt 15 bis 20 Minuten pro Inserat, einheitlich und mit passenden Keywords, was direkt die Standzeit von Gebrauchtwagen senkt.",
      "Der Prozess steht vor dem Tool: erst analysieren und strukturieren, dann an einem klaren Engpass starten, messen und ausweiten - integriert ins bestehende DMS/CRM statt als Insellösung.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Lead-Erfassung und Anfragen",
        spec: {
          type: "beforeAfter",
          caption: "Vom Sammelpostfach zum strukturierten Lead",
          items: [
            {
              title: "Lead-Erfassung und Anfragen",
              before: "Anfragen aus Mobile.de, AutoScout24, Formular, WhatsApp und Telefon landen in getrennten Postfächern; manuelle Sichtung und Übertragung ins CRM, Anfragen bleiben übers Wochenende liegen.",
              after: "Kanalübergreifende Zusammenführung, KI liest Name, Fahrzeug, Budget und Finanzierungswunsch aus, ordnet den Lead dem Bestandsfahrzeug zu und bestätigt in Sekunden - auch nachts.",
              saves: "Reaktionszeit von Stunden auf Minuten",
            },
            {
              title: "Probefahrt- und Werkstatttermine",
              before: "Terminfindung per Telefon und E-Mail, Verfügbarkeit von Fahrzeug, Hebebühne und Mechaniker einzeln prüfen - ein Hin und Her, das Personal bindet.",
              after: "Digitaler Assistent gleicht Anfrage und Kalender ab, reserviert das Fahrzeug, plant nach Arbeitsumfang; Bestätigungen und Erinnerungen laufen automatisch.",
              saves: "Entlastung der Service-Annahme, weniger No-Shows",
            },
            {
              title: "Fahrzeugbeschreibungen",
              before: "Ausstattung, Zustand und Verkaufsargumente von Hand tippen - 15 bis 20 Minuten pro Fahrzeug, oft uneinheitlich oder lückenhaft.",
              after: "KI erzeugt aus strukturierten Fahrzeugdaten vollständige, einheitliche Inserate in der gewünschten Tonalität, inklusive Plattform-Varianten und Keywords.",
              saves: "Inserate schneller online, kürzere Standzeit",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "So beginnen Sie sinnvoll",
        spec: {
          type: "numberedSteps",
          steps: [
            { title: "Analysieren", text: "Wo gehen Leads verloren, wo entstehen Wartezeiten, welche Aufgaben wiederholen sich taeglich?" },
            { title: "Strukturieren", text: "Welcher Ablauf ist klar genug, um ihn ueberhaupt zu automatisieren?" },
            { title: "Digitalisieren und automatisieren", text: "Erst dann das passende Werkzeug waehlen - integriert ins bestehende DMS/CRM, nicht als Inselloesung." },
          ],
        },
      },
    ],
  },

  "ki-fuer-immobilienmakler": {
    keyTakeaways: [
      "Exposé-Texte sinken von 30 bis 90 Minuten Schreibarbeit auf rund zehn Minuten Redigieren – die KI liefert den Entwurf, Energiekennwerte und Flächenangaben prüfen Sie weiterhin selbst.",
      "Auf ein gutes Inserat kommen schnell 40 bis 120 Anfragen; KI qualifiziert per strukturierter Rückfragen vor und sortiert in passend, Rückfrage nötig und unpassend – die finale Auswahl bleibt beim Menschen.",
      "Terminkoordination, Erinnerungen und Eigentümer-Updates laufen automatisch ab, was No-Show-Quoten senkt und einen halben Tag pro Woche aus dem Posteingang nimmt.",
      "Eine saubere Dokumentenstruktur (Grundbuch, Energieausweis, Teilungserklärung) ist die Grundlage, auf der die anderen Automatisierungen erst zuverlässig laufen.",
      "Datenschutz gehört ins Prozessdesign: AV-Vertrag, Transparenz gegenüber Interessenten und seit dem 2. Februar 2025 nachweisbare KI-Kompetenz nach AI Act – geklärt, bevor automatisiert wird.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Exposé-Texte aus Objektdaten erstellen",
        spec: {
          type: "beforeAfter",
          caption: "Fünf Routineaufgaben im Makleralltag – heute manuell, mit KI als Entwurf und Vorsortierung. Die fachliche und rechtliche Verantwortung bleibt beim Makler.",
          items: [
            {
              title: "Exposé-Texte erstellen",
              before: "30 bis 90 Minuten pro Objekt von Hand; Risiko, dass Daten aus dem Vorgängerobjekt stehen bleiben.",
              after: "Entwurf aus strukturierten Objektdaten in Ihrem Tonfall, nach Zielgruppe variiert (Anleger vs. Eigennutzer).",
              saves: "von 1 Stunde auf ca. 10 Minuten Redigieren",
            },
            {
              title: "Anfragen vorqualifizieren",
              before: "40 bis 120 Anfragen pro Inserat, jede einzeln lesen und beantworten.",
              after: "Automatischer Erstkontakt mit Rückfragen; Sortierung in passend, Rückfrage nötig, unpassend.",
              saves: "nur noch die relevante Auswahl im Blick",
            },
            {
              title: "Besichtigungen koordinieren",
              before: "Termin-Pingpong per E-Mail; bei mehreren Objekten ein halber Tag pro Woche.",
              after: "Verfügbare Zeitfenster zur Auswahl, automatische Bestätigungen, Erinnerungen und Eigentümer-Hinweis.",
              saves: "weniger No-Shows, halber Tag/Woche frei",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "Datenschutz: personenbezogene Daten gehören geschützt",
        spec: {
          type: "checklist",
          title: "Datenschutz vor der Automatisierung klären",
          caption: "Drei Punkte, die in jedem Maklerbüro geregelt sein sollten, bevor Interessentendaten durch KI laufen.",
          items: [
            { text: "AV-Vertrag mit jedem KI-Dienstleister, Server-Standort und Datenflüsse bekannt", ok: true },
            { text: "Transparenz: Interessenten erkennen automatisierte Systeme, Auskunfts- und Löschrechte gewahrt", ok: true },
            { text: "KI-Kompetenz der Mitarbeitenden nachweisen – Pflicht nach AI Act seit dem 2. Februar 2025", ok: true },
            { text: "Datenschutz als nachgelagertes Thema behandeln, statt ihn in die Prozessstruktur einzubauen", ok: false },
            { text: "Echte Interessentendaten ohne vertragliche Absicherung in ein öffentliches KI-Tool kippen", ok: false },
          ],
        },
      },
    ],
  },

  "ki-fuer-reinigungsservices": {
    keyTakeaways: [
      "KI wirkt nicht am Putzeimer, sondern in den Prozessen drumherum: Einsatzplanung, Qualitätsnachweis und Kommunikation – dort versickert täglich Zeit, die niemand abrechnet.",
      "KI-gestützte Plansoftware rechnet Schichten unter Beachtung von Arbeitsrecht, Pausen und Qualifikationen, optimiert Routen und zeigt bei Krankmeldung sofort, wer verfügbar ist – das Planungswissen steckt nicht mehr nur in einem Kopf.",
      "Digitale Checklisten mit Zeitstempel, Ort und optionaler NFC-Bestätigung liefern lückenlosen Leistungsnachweis und beenden das 'Aussage gegen Aussage' bei Reklamationen.",
      "In der Qualitätskontrolle markiert Bilderkennung auffällige Verschmutzungen, Vorher-Nachher-Fotos werden dem Auftrag zugeordnet und ergeben Qualitätskennzahlen pro Objekt statt Bauchgefühl.",
      "Die Reihenfolge entscheidet: erst den Prozess analysieren und strukturieren, dann das Tool wählen – wer eine schlechte Tourenplanung in eine App gießt, hat denselben Engpass, nur teurer.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Einsatz- und Tourenplanung",
        spec: {
          type: "beforeAfter",
          caption: "Wo Digitalisierung in der Reinigungsfirma konkret Aufwand spart.",
          items: [
            {
              title: "Einsatz- und Tourenplanung",
              before: "Eine Person jongliert Excel, Whiteboard und Telefon; Krankmeldungen lösen Anruf-Ketten aus, Fahrtwege werden grob geschätzt.",
              after: "Plansoftware schlägt Schichten unter Arbeitsrecht und Qualifikation vor, optimiert Routen und zeigt bei Ausfall sofort Verfügbare an.",
              saves: "weniger Leerfahrten, planbarere Personalkosten",
            },
            {
              title: "Digitale Checklisten",
              before: "Laminiertes Blatt im Putzraum, Abhaken auf Papier, das selten ins Büro zurückfindet – Leistung kaum belegbar.",
              after: "Checkliste am Smartphone führt durchs Leistungsverzeichnis, Erledigtes mit Zeitstempel und NFC-Tag dokumentiert.",
              saves: "lückenloser Nachweis, weniger Streit",
            },
            {
              title: "Qualitätskontrolle",
              before: "Objektleitung fährt stichprobenartig vorbei, notiert subjektiv auf Papier; Mängel werden mündlich weitergegeben und verlaufen sich.",
              after: "Strukturierte App-Rundgänge mit festen Kriterien, Vorher-Nachher-Fotos und Bilderkennung ergeben Qualitätskennzahlen pro Objekt.",
              saves: "objektive, dokumentierte Qualität",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "Fazit",
        spec: {
          type: "useCaseGrid",
          caption: "Die Stellen, an denen Digitalisierung messbar Zeit zurückgibt.",
          items: [
            { title: "Einsatz- und Tourenplanung", text: "KI-gestützte Schicht- und Routenplanung senkt Fahrzeiten und macht Personalkosten planbar." },
            { title: "Digitale Checklisten", text: "Smartphone-Checklisten mit Zeitstempel und NFC liefern den Nachweis erbrachter Leistung." },
            { title: "Qualitätskontrolle", text: "App-Rundgänge und Fotodokumentation mit Bilderkennung ersetzen das Bauchgefühl durch Kennzahlen." },
            { title: "Kundenmeldungen", text: "Ein zentrales Ticketsystem bündelt alle Kanäle; KI sortiert vor und beantwortet Routinefragen." },
            { title: "Angebotsvorbereitung", text: "Vorlagen und KI-Entwürfe aus Begehungsnotizen liefern in Minuten ein konsistentes Angebot." },
          ],
        },
      },
    ],
  },

  "ki-und-datenschutz": {
    keyTakeaways: [
      "KI-Datenschutz scheitert selten an der Technik, sondern daran, dass niemand geregelt hat, welche Daten in welches Tool dürfen.",
      "Drei Datenarten sind kritisch: personenbezogene Daten (DSGVO), besonders sensible Daten nach Art. 9 DSGVO und Geschäftsgeheimnisse wie Kalkulationen oder Produktpläne.",
      "Bei kostenlosen öffentlichen Diensten gilt: Jede Eingabe so behandeln, als würde man sie auf eine öffentliche Pinnwand heften – ohne AVV keine echten Kunden- oder Mitarbeiterdaten.",
      "Statt zu verbieten oder Wildwuchs zuzulassen, helfen drei schlanke Bausteine: eine 3-stufige Datenklassifizierung, eine kurze Liste freigegebener Tools und eine ein- bis zweiseitige KI-Richtlinie.",
      "Seit dem 2. Februar 2025 verlangt der AI Act zudem ausreichende KI-Kompetenz der Beschäftigten, was eine klare Regelung praktisch unterstützt.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Was Mitarbeiter nicht in öffentliche KI-Tools eingeben sollten",
        spec: {
          type: "checklist",
          title: "Ohne vertragliche Absicherung tabu in öffentlichen KI-Tools",
          items: [
            { text: "Echte Kunden- oder Mitarbeiterdaten, auch reine E-Mail-Verläufe", ok: false },
            { text: "Vollständige Verträge, Angebote mit Konditionen, interne Kalkulationen", ok: false },
            { text: "Bewerbungsunterlagen und Personalakten", ok: false },
            { text: "Gesundheits- oder andere besonders sensible Daten", ok: false },
            { text: "Zugangsdaten, API-Schlüssel, interne Systemarchitekturen", ok: false },
            { text: "Marketingtexte und öffentliche Pressemitteilungen umformulieren", ok: true },
            { text: "Allgemeine Recherche und ohnehin öffentliche Informationen", ok: true },
          ],
        },
      },
      {
        afterHeadingIncludes: "Eine einfache Datenklassifizierung, die jeder versteht",
        spec: {
          type: "numberedSteps",
          steps: [
            { title: "Öffentlich / unkritisch", text: "Daten, die ohnehin veröffentlicht sind oder sein dürften – Marketingtexte, allgemeine Recherche. Freie Nutzung jedes freigegebenen Tools." },
            { title: "Intern", text: "Daten ohne Personen- oder Geheimnisbezug, aber nicht für die Öffentlichkeit – interne Prozessbeschreibungen, anonymisierte Beispiele. Nur in freigegebenen Business-Tools." },
            { title: "Vertraulich / sensibel", text: "Personenbezogene und besonders sensible Daten sowie Geschäftsgeheimnisse. Nur in vertraglich abgesicherten Lösungen – oder gar nicht in KI-Tools." },
          ],
        },
      },
    ],
  },

  "ai-act-und-ki-kompetenz": {
    keyTakeaways: [
      "Artikel 4 des AI Act verlangt seit dem 2. Februar 2025, dass Beschäftigte über ausreichende KI-Kompetenz verfügen, wenn sie KI-Systeme einsetzen oder deren Ergebnisse nutzen.",
      "Die Pflicht ist breit gefasst: Sie gilt nicht nur für Hochrisiko-KI, sondern auch für alltägliche Tools wie ChatGPT im Marketing oder einen KI-Assistenten im Kundenservice.",
      "Der AI Act schreibt keine bestimmte Schulungsform, kein Zertifikat und keine Mindeststundenzahl vor – verlangt wird ein Ergebnis: kompetentes Personal.",
      "Bewährt hat sich ein dreistufiges, rollenbasiertes Modell: 60–90 Minuten Basis für alle, anwendungsnahe Vertiefung für aktive Nutzer und Spezialwissen für Verantwortliche.",
      "Für den Nachweis genügt eine schlanke Dokumentation – Teilnahmeübersicht, Schulungsunterlagen, KI-Guideline mit Versionsstand und Tool-Liste –, um belegen zu können, dass man „nach besten Kräften“ gehandelt hat.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Schulungs- und Guideline-Struktur",
        spec: {
          type: "numberedSteps",
          steps: [
            { title: "Basis für alle (60–90 Minuten)", text: "Kurze Grundschulung für alle, die mit KI in Berührung kommen: Wie funktioniert generative KI, was sind Halluzinationen, welche Daten dürfen nicht eingegeben werden, was gilt bei Urheberrecht und Datenschutz." },
            { title: "Vertiefung für aktive Nutzer", text: "Anwendungsnahe Inhalte für Teams wie Marketing, Vertrieb, Support oder Entwicklung: konkrete Use-Cases, gute und schlechte Prompts, Prüfschritte vor der Verwendung, freigegebene Tools." },
            { title: "Spezialwissen für Verantwortliche", text: "Für alle, die KI-Systeme auswählen, einkaufen oder in Hochrisiko-Bereichen einsetzen: Wissen zu Klassifizierung, Dokumentation und den Pflichten aus der KI-Verordnung." },
            { title: "Schlanke KI-Guideline ergänzen", text: "Ein bis drei Seiten statt Aktenordner: Welche Tools sind freigegeben, welche Daten dürfen rein, wer ist Ansprechpartner, wie kennzeichnen wir KI-generierte Inhalte. In fünf Minuten lesbar – und deshalb befolgt." },
          ],
        },
      },
      {
        afterHeadingIncludes: "Pragmatische Dokumentation ohne Bürokratie-Overkill",
        spec: {
          type: "checklist",
          title: "Schlanker Nachweis der KI-Kompetenz",
          items: [
            { text: "Teilnahmeübersicht: Wer wurde wann zu welchem Thema geschult – eine Tabelle genügt.", ok: true },
            { text: "Schulungsunterlagen archiviert ablegen, mit Versionsdatum.", ok: true },
            { text: "KI-Guideline mit Versionsstand, damit nachvollziehbar ist, welche Regeln seit wann gelten.", ok: true },
            { text: "Tool-Liste mit Risikoeinordnung: Welche KI-Systeme sind im Einsatz.", ok: true },
            { text: "Eine Dokumentationsmaschine aufbauen, die niemand pflegt – der häufigste Fehler aus Sorge vor der Aufsicht.", ok: false },
            { text: "Die Dokumentation als Einmalprojekt behandeln, statt als lebendes Dokument, das mit KI-Landschaft und Anwendungsfällen mitwächst.", ok: false },
          ],
        },
      },
    ],
  },

  "warum-ki-projekte-scheitern": {
    keyTakeaways: [
      "KI-Projekte scheitern selten an der Technik: Fünf der sechs häufigsten Gründe – fehlende Analyse, schwache Daten, unklare Verantwortung, mangelnde Akzeptanz und fehlende Erfolgsmessung – liegen vor dem Tool.",
      "Wer einen unklaren Prozess automatisiert, bekommt denselben Murks nur schneller und teurer – das Werkzeug verstärkt, was bereits da ist.",
      "Die richtige Reihenfolge entscheidet: erst analysieren und strukturieren, dann digitalisieren und automatisieren – die Tool-Wahl ist die letzte Entscheidung, nicht die erste.",
      "Jedes KI-Projekt braucht einen Owner mit Mandat und Budget sowie eine vor dem Start definierte Kennzahl mit Baseline, sonst lässt sich weder Erfolg belegen noch Misserfolg korrigieren.",
      "Akzeptanz entsteht durch frühe Einbindung der Anwender und spürbare Entlastung; seit dem 2. Februar 2025 verlangt der EU AI Act zudem ein Mindestmaß an KI-Kompetenz.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Keine Prozessanalyse vor der Einführung",
        spec: {
          type: "checklist",
          title: "Sechs Gründe, warum KI-Projekte scheitern",
          caption: "Fünf der sechs häufigsten Scheiterungsgründe liegen vor der Technik, nicht im Tool.",
          items: [
            { text: "Mit der Frage \"Welches Problem lösen wir?\" starten – Tool als letzte Entscheidung", ok: true },
            { text: "Erst analysieren, dann strukturieren, dann digitalisieren", ok: true },
            { text: "Datenqualität und Zugriffsrechte vor dem Projekt klären", ok: true },
            { text: "Einen Owner mit Mandat und Budget benennen", ok: true },
            { text: "Anwender von Beginn an einbinden, nicht erst zur Abnahme", ok: true },
            { text: "Tool-Chaos: drei Abteilungen testen vier Tools nach LinkedIn-Trend", ok: false },
            { text: "Automatisierung vor Verständnis – Prozess kann niemand sauber beschreiben", ok: false },
            { text: "Kein Business Case, keine messbare Kennzahl mit Baseline", ok: false },
          ],
        },
      },
      {
        afterHeadingIncludes: "Wie ein analysegetriebenes Vorgehen diese Fehler vermeidet",
        spec: {
          type: "numberedSteps",
          caption: "Der entscheidende Unterschied liegt in der Reihenfolge – die Tool-Auswahl kommt bewusst am Ende.",
          steps: [
            { title: "Analysieren", text: "Den realen Ist-Prozess aufnehmen, samt Engpässen, Ausnahmen und Datenlage. Verhindert fehlende Analyse und schwache Daten." },
            { title: "Strukturieren", text: "Den Prozess entschlacken und Verantwortlichkeiten klären, bevor irgendetwas digitalisiert wird. Adressiert Tool-Chaos und unklare Zuständigkeit." },
            { title: "Digitalisieren", text: "Den bereinigten Prozess in eine saubere digitale Grundlage überführen – die Voraussetzung für belastbare Automatisierung." },
            { title: "Automatisieren", text: "Erst jetzt fällt die Tool-Entscheidung, auf Basis eines verstandenen Prozesses und nicht eines Trends." },
            { title: "Realisieren", text: "Mit messbaren Kennzahlen, eingebundener Belegschaft und definiertem Betriebsmodell live gehen. Schließt mangelnde Akzeptanz und fehlende Erfolgsmessung." },
          ],
        },
      },
    ],
  },

  "ki-im-handwerk": {
    keyTakeaways: [
      "KI im Handwerk ersetzt nicht die Arbeit auf der Baustelle, sondern reduziert die Buroarbeit danach - Angebote, Berichte, Fotos, Kundenkommunikation und Planung.",
      "Aus wenigen Stichpunkten oder einem Diktat erzeugt ein KI-System auf Basis Ihrer eigenen Preislisten einen Angebotsentwurf in Minuten statt in 30 bis 60 Minuten.",
      "Baustellenberichte lassen sich per Sprache-zu-Text direkt vor Ort diktieren, sodass die Dokumentation entsteht, solange die Information frisch ist - das zahlt sich bei Nachtragen aus.",
      "Die Reihenfolge entscheidet: zuerst den zeitfressendsten Ablauf angehen (meist Angebote oder Baustellendoku), dann erst den nachsten - so bleibt die Veranderung beherrschbar.",
      "Seit dem 2. Februar 2025 verlangt der EU AI Act KI-Kompetenz der Mitarbeitenden; bei Kundendaten und erkennbaren Personen auf Fotos gelten zusatzlich die DSGVO-Pflichten.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Angebote und Kostenvoranschläge schneller erstellen",
        spec: {
          type: "beforeAfter",
          caption: "Drei typische Verwaltungsaufgaben im Handwerk - vom abendlichen Aufwand zum gepruerften KI-Entwurf.",
          items: [
            {
              title: "Angebot erstellen",
              before: "Positionen aus dem letzten Auftrag zusammensuchen, Preise nachschlagen, Texte neu formulieren",
              after: "Stichpunkte diktieren, KI schlaegt Positionen, Mengen und Standardtexte vor - Sie pruefen und geben frei",
              saves: "30-60 Min. pro Angebot",
            },
            {
              title: "Baustellenbericht",
              before: "Abends aus Notizzetteln und Erinnerung getippt, fehleranfaellig, manches fehlt ganz",
              after: "Bericht direkt vor Ort ins Telefon gesprochen, automatisch strukturiert mit Datum, Gewerk und Beteiligten",
              saves: "Tippen am Abend entfaellt",
            },
            {
              title: "Fotodokumentation",
              before: "Bilder sammeln sich auf dem Handy, manuelles Sortieren und Zuordnen wird aufgeschoben",
              after: "Foto wird ueber Standort, Zeit und Sprachkommentar dem Auftrag zugeordnet und benannt",
              saves: "Richtige Aufnahme in Sekunden",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "Wo der Einstieg sinnvoll ist",
        spec: {
          type: "numberedSteps",
          caption: "Nicht alle fuenf Bereiche gleichzeitig - ein Ablauf nach dem anderen.",
          steps: [
            { title: "Zeitfresser identifizieren", text: "Mit dem Ablauf beginnen, der die meisten Abendstunden kostet - bei vielen Betrieben Angebotserstellung oder Baustellendokumentation." },
            { title: "Prozess vor Werkzeug", text: "Erst verstehen, welcher Prozess Zeit kostet, dann die passende Software waehlen - Werkzeug ist nicht Loesung." },
            { title: "Einen Ablauf sauber etablieren", text: "Erst wenn dieser eine Prozess sauber laeuft, kommt der naechste hinzu. So bleibt die Veranderung beherrschbar und das Team kommt mit." },
            { title: "Pruefschleife und Einweisung", text: "Freigabe durch den Menschen fest einplanen und Mitarbeitende kurz schulen, was das System kann, was nicht und wo gepruft werden muss (EU AI Act)." },
          ],
        },
      },
    ],
  },

  "ki-fuer-arztpraxen": {
    keyTakeaways: [
      "Nicht das Tool entscheidet, sondern die Reihenfolge: erst die Praxisabläufe analysieren, dann gezielt digitalisieren – sonst automatisiert man nur das Chaos.",
      "Gesundheitsdaten sind nach Art. 9 DSGVO besonders geschützt; EU-Hosting, ein AVV und das Fernhalten von Patientendaten aus öffentlichen Tools sind Grundbedingung, keine Kür.",
      "Ein KI-Telefonassistent entlastet über die Triage-Logik: Routine selbst beantworten, Termine aufnehmen, Dringliches sofort an einen Menschen durchstellen.",
      "Terminerinnerungen per SMS oder E-Mail sind der wirksamste Hebel gegen Ausfälle – und enthalten nur Datum, Uhrzeit und Praxisname, keine Diagnosen.",
      "Welcher Baustein den größten Hebel hat – Telefon, Terminmanagement oder Wissensdatenbank – zeigt erst die Analyse von Anrufvolumen, Ausfallquoten und Spitzenzeiten.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Entlastung des Empfangs als eigentliches Ziel",
        spec: {
          type: "useCaseGrid",
          caption: "Die vier Entlastungsfelder einer Arztpraxis – die richtige Reihenfolge ergibt sich aus der Analyse Ihrer konkreten Abläufe.",
          items: [
            { title: "Telefon-Vorfilterung", text: "Ein KI-Telefonassistent ordnet Anrufe per Triage-Logik zu: Routine wird beantwortet, Termine strukturiert aufgenommen, Dringliches sofort an einen Menschen durchgestellt." },
            { title: "Terminmanagement", text: "Online-Buchung mit Regeln, SMS/E-Mail-Erinnerungen gegen Ausfälle (ohne Diagnosen) und Self-Service-Verschiebung, die freie Slots automatisch wieder freigibt." },
            { title: "FAQ-Assistent", text: "Beantwortet Standardfragen rund um die Uhr ausschließlich aus freigegebenen Inhalten und übergibt an den Menschen, sobald es individuell oder medizinisch wird." },
            { title: "Interne Wissensdatenbank", text: "Bündelt Praxisstandards, Abläufe und Checklisten durchsuchbar an einem Ort – für schnellere Einarbeitung und konsistente Abläufe, EU-gehostet je Rolle." },
          ],
        },
      },
      {
        afterHeadingIncludes: "Gesundheitsdaten sind besonders schützenswert",
        spec: {
          type: "checklist",
          title: "Datenschutz-Leitplanken vor jedem KI-Einsatz",
          caption: "Diese Punkte gehören an den Anfang, nicht ans Ende – sonst entsteht ein Compliance-Risiko statt eines Effizienzprojekts.",
          items: [
            { text: "EU-Hosting, belastbarer AVV und dokumentierte technisch-organisatorische Maßnahmen", ok: true },
            { text: "Datensparsamkeit by Design: Der Telefonassistent braucht keinen Befund, nur das Anliegen", ok: true },
            { text: "AI-Literacy: Mitarbeitende seit 2. Februar 2025 nach EU AI Act geschult", ok: true },
            { text: "Klare Eskalationslogik: Dringliches und Individuelles geht zwingend an den Menschen", ok: true },
            { text: "Patientendaten in öffentliche KI-Tools ohne AVV geben", ok: false },
            { text: "Diagnosen oder Behandlungsdetails in Terminerinnerungen aufnehmen", ok: false },
          ],
        },
      },
    ],
  },

  "ki-in-der-steuerkanzlei": {
    keyTakeaways: [
      "Vor der Toolwahl steht die Prozessanalyse: Erst klären, welche Abläufe Zeit kosten, fehleranfällig sind oder unter Personalmangel leiden — dann erst über Technik sprechen.",
      "Der größte und risikoärmste Hebel liegt im Posteingang: KI klassifiziert und liest eingehende Belege, Bescheide und Rechnungen vor und bereitet Felder für DATEV auf — die fachliche Prüfung bleibt beim Menschen.",
      "Fristenmanagement ist weniger 'intelligente' KI als saubere Automation: Aus einem ausgelesenen Bescheid wird automatisch eine Einspruchsfrist mit Vorlauf-Erinnerung; das Fundament ist die strukturierte Prozessdefinition.",
      "Bei Mandantenfragen ist der Antwortentwurf zur menschlichen Freigabe der haftungssichere Einstieg — nicht der vollautomatische Chatbot mit Zugriff auf alle Mandantsdaten.",
      "Mandantsdaten gehören nur in Dienste mit AV-Vertrag und dokumentierter Rechtsgrundlage; seit dem 2. Februar 2025 verlangt der EU AI Act zudem ausreichende KI-Kompetenz der Mitarbeitenden.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Dokumente vorsortieren und auslesen",
        spec: {
          type: "beforeAfter",
          items: [
            {
              title: "Dokumente sichten und zuordnen",
              before: "Belege, Bescheide und Kontoauszüge manuell nach Mandant und Typ sortieren",
              after: "KI klassifiziert nach Mandant, Dokumenttyp und Dringlichkeit; Fristsachen landen sofort im richtigen Korb",
              saves: "Weniger Handgriffe je Beleg",
            },
            {
              title: "Daten erfassen",
              before: "Betrag, Datum, Steuernummer und Leistungszeitraum von Hand abtippen",
              after: "Felder werden ausgelesen und für die Übergabe an DATEV aufbereitet — Prüfung bleibt beim Berufsträger",
              saves: "Erfassung statt Abtippen",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "Verschwiegenheitspflicht und Datenschutz",
        spec: {
          type: "checklist",
          title: "Mandantsdaten sicher verarbeiten",
          items: [
            { text: "Datenstandort, Zugriff und Trainingsnutzung vor dem Tool klären", ok: true },
            { text: "AV-Vertrag und dokumentierte Rechtsgrundlage für jeden externen Dienst", ok: true },
            { text: "Datensparsamkeit als Default — pseudonymisierte oder reduzierte Daten bevorzugen", ok: true },
            { text: "Fachliche Letztentscheidung bei Fristen und Bescheiden bleibt beim Berufsträger", ok: true },
            { text: "KI-Kompetenz der Mitarbeitenden nach EU AI Act (seit 2. Februar 2025) sicherstellen", ok: true },
            { text: "Mandantsdaten über öffentliche Consumer-Dienste ohne AV-Vertrag eingeben", ok: false },
            { text: "Vollautomatischer Chatbot mit Zugriff auf alle Mandantsdaten von Tag eins", ok: false },
          ],
        },
      },
    ],
  },

  "ki-in-der-gastronomie": {
    keyTakeaways: [
      "Die richtige Reihenfolge ist entscheidend: erst analysieren und strukturieren, dann digitalisieren und automatisieren - sonst automatisiert die beste Software nur das Chaos schneller.",
      "Vier Bereiche rechnen sich heute konkret: Reservierungen kanalübergreifend bündeln, Bewertungen analysieren und beantworten, Schichtplanung aus Bedarfsprognosen erzeugen und Content schneller produzieren.",
      "KI liefert den Entwurf, nicht das letzte Wort: Antworten auf negative Bewertungen werden vor dem Versand gegengelesen, Dienstplan-Freigaben und der persönliche Schliff bleiben beim Team.",
      "Dienst-, Verfügbarkeits- und Qualifikationsdaten sind personenbezogen und gehören in Systeme mit klarer Rechtsgrundlage, definierten Zugriffsrechten und EU-Hosting.",
      "Seit dem 2. Februar 2025 verlangt der EU AI Act ausreichende KI-Kompetenz der Mitarbeitenden - eine kurze, dokumentierte Einweisung gehört von Anfang an dazu.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Reservierungen und Anfragen automatisieren",
        spec: {
          type: "beforeAfter",
          items: [
            {
              title: "Reservierungen und Anfragen",
              before: "Anrufe im Service, E-Mails, Instagram, WhatsApp und Buchungsportal in getrennten Postfächern; No-Shows und Doppelbelegungen in den Lücken.",
              after: "Anfragen aller Kanäle gebündelt, klassifiziert und mit Standardantworten beantwortet; Verfügbarkeit gegen das Reservierungstool geprüft, nur Sonderfälle landen beim Menschen.",
              saves: "Kürzere Antwortzeiten, weniger No-Shows durch automatische Erinnerungen",
            },
            {
              title: "Bewertungsmanagement",
              before: "Rezensionen verstreut auf Google, TripAdvisor und Booking; kritische Bewertungen bleiben tagelang unbeantwortet.",
              after: "Rezensionen zentral gebündelt, Stimmung und wiederkehrende Themen erkannt, Antwortentwürfe im Ton des Hauses - Freigabe bei der Leitung.",
              saves: "Schnellere, gleichmäßige Reaktionen; Schwachstellen früh sichtbar",
            },
            {
              title: "Schicht- und Personalplanung",
              before: "Dienstpläne in Tabellen oder im Kopf der Schichtleitung; jede Krankmeldung löst eine Kette von Telefonaten aus.",
              after: "Bedarfsprognose aus Umsätzen, Wochentag, Wetter und Events; Planvorschläge unter Beachtung von Verfügbarkeiten, Qualifikationen und Ruhezeiten, Vertretungsvorschläge bei Ausfall.",
              saves: "Weniger Über- und Unterbesetzung, nachvollziehbare Pläne",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "Was vor dem ersten Tool kommt",
        spec: {
          type: "checklist",
          title: "Sauberer Einstieg statt Aktionismus",
          items: [
            { text: "Zuerst den Ablauf analysieren und strukturieren, dann erst das Tool auswählen", ok: true },
            { text: "Mit einem klar abgegrenzten Prozess starten und den Nutzen messen, bevor breit investiert wird", ok: true },
            { text: "Festlegen, wer welche Entscheidung freigibt und wann ein Mensch übernehmen muss", ok: true },
            { text: "Mitarbeitende gemäß EU AI Act schulen - kurze, dokumentierte Einweisung von Anfang an", ok: true },
            { text: "Einen unsauberen Reservierungsprozess automatisieren - das beschleunigt nur das Chaos", ok: false },
            { text: "Mitarbeiterdaten in ein beliebiges Tool ohne klare Rechtsgrundlage und EU-Hosting kopieren", ok: false },
            { text: "Standardsätze automatisch auf ernste Beschwerden verschicken, ohne sie gegenzulesen", ok: false },
          ],
        },
      },
    ],
  },

  "ki-im-ecommerce": {
    keyTakeaways: [
      "KI im E-Commerce bringt realen Nutzen in vier Feldern: Produktdaten erzeugen, Kundenservice, Retourenanalyse und Kampagnen – die Datenqualität entscheidet über Entlastung oder Mehraufwand.",
      "Produktbeschreibungen lassen sich nur so gut automatisieren, wie die Attribute strukturiert sind; bei Größen und rechtlich relevanten Aussagen bleibt das Vier-Augen-Prinzip Pflicht.",
      "Ein KI-Chatbot ersetzt kein Service-Team, sondern entlastet bei Standardanfragen wie Lieferstatus oder Retouren – mit klar definiertem Übergabepunkt und DSGVO-konformer Verarbeitung.",
      "Retouren sind der stillste Margenkiller: KI deckt Muster auf, doch Wert entsteht erst durch die Umsetzung – korrigierter Produkttext, bessere Größentabelle, angepasstes Foto.",
      "Seit dem 2. Februar 2025 verlangt der EU AI Act ausreichende KI-Kompetenz der Mitarbeitenden; wer ein bis zwei Anwendungsfälle priorisiert statt alles gleichzeitig zu starten, zahlt nicht doppelt.",
    ],
    figures: [
      {
        afterHeadingIncludes: "Produktbeschreibungen und Produktdaten erzeugen",
        spec: {
          type: "useCaseGrid",
          items: [
            { title: "Produktdaten erzeugen", text: "Beschreibungen, Bullet-Points und Meta-Titel für große Sortimente in einem Durchlauf – nur so gut wie die strukturierten Eingangsattribute." },
            { title: "Kundenservice & Self-Service", text: "Wiederkehrende Anfragen wie Lieferstatus, Größenberatung oder Retouren teilautomatisiert beantworten, mit klarem Übergabepunkt zum Menschen." },
            { title: "Retourenanalyse", text: "Rücksendegründe mit Produkt, Variante und Kanal verknüpfen und Muster sichtbar machen, die in Tabellen untergehen." },
            { title: "Kampagnenautomation", text: "Betreffvarianten, Segmenttexte und anlassbezogene Strecken automatisiert erzeugen und testen – auf sauberer CRM-Datenbasis." },
          ],
        },
      },
      {
        afterHeadingIncludes: "Kundenservice-Antworten und Self-Service",
        spec: {
          type: "numberedSteps",
          steps: [
            { title: "Antwortvorschläge für Agents", text: "Die KI entwirft die Antwort, der Mitarbeiter prüft und sendet. Geringstes Risiko, sofort spürbare Entlastung." },
            { title: "Self-Service mit Anbindung", text: "Ein Assistent mit echtem Zugriff auf Bestelldaten und Sendungsverfolgung – nicht nur wiedergekäute FAQ-Texte." },
            { title: "Voll automatisierte Standardfälle", text: "Erst sinnvoll, wenn die Prozesse klar definiert und die Eskalationspfade dokumentiert sind." },
          ],
        },
      },
    ],
  },

  "ki-fuer-agenturen": {
    keyTakeaways: [
      "Mehr Output entsteht nicht durch mehr Tools, sondern durch saubere Prozesse: Wer den Ablauf nicht versteht, automatisiert nur das Chaos – nur schneller.",
      "Bei Angeboten liefert KI aus Briefing und Altprojekten das Gerüst (Leistungspakete, Annahmen, Risiken) – realistisch 40 bis 60 Prozent weniger Zeit, während Preis und Positionierung beim Menschen bleiben.",
      "Meeting-Protokolle aus Transkriptionen brauchen Einwilligung aller Teilnehmenden, EU-Hosting plus AV-Vertrag bei sensiblen Inhalten und seit dem 2. Februar 2025 geschulte Mitarbeitende laut EU AI Act.",
      "Beim Reporting gehört die Datensammlung in eine saubere Automatisierung, die Interpretation kann KI vorbereiten – die strategische Bewertung bleibt beim Menschen.",
      "Bei Recherche und Content ist KI am stärksten und zugleich am anfälligsten: Jede Zahl und Quelle muss geprüft werden, die Agenturstimme bleibt redaktionelle Aufgabe, vertrauliche Kundendaten gehören nicht in beliebige Tools.",
    ],
    figures: [
      {
        afterHeadingIncludes: "mehr Output",
        spec: {
          type: "beforeAfter",
          caption: "Wo KI im Agenturalltag das Gerüst liefert und der fachliche Teil beim Menschen bleibt.",
          items: [
            {
              title: "Angebote und Briefings",
              before: "2 bis 4 Stunden je Angebot: aus Altprojekten kopieren, Leistungen anpassen, Briefings aus Mails und PDFs sortieren",
              after: "KI erzeugt aus strukturiertem Briefing den Erstentwurf mit Leistungspaketen, Annahmen und Risiken; Preis und Positionierung bleiben beim Team",
              saves: "40 bis 60 % weniger Zeit pro Angebot",
            },
            {
              title: "Meeting-Protokolle",
              before: "20 bis 30 Minuten je Termin – oder das Protokoll entsteht gar nicht, dann fehlt später die verbindliche Grundlage",
              after: "KI strukturiert die Transkription zu Entscheidungen, To-dos und offenen Punkten; Freigabe bleibt beim Menschen",
              saves: "Protokolle entstehen konsistent statt gar nicht",
            },
            {
              title: "Projektreporting",
              before: "1 bis 2 Stunden je Kunde: Zahlen aus Zeiterfassung, Projektboard und drei Werbeplattformen manuell in eine Folie gießen",
              after: "Automatisierte Datenanbindung sammelt, KI formuliert Kommentar und ordnet Abweichungen ein",
              saves: "vom Zusammensuchen zum Kuratieren",
            },
          ],
        },
      },
      {
        afterHeadingIncludes: "Meeting-Protokollen mit KI beachten",
        spec: {
          type: "checklist",
          title: "Meeting-Protokolle mit KI: rechtssicher aufsetzen",
          items: [
            { text: "Einwilligung aller Teilnehmenden zu Aufzeichnung und Transkription vorab klären", ok: true },
            { text: "EU-Hosting und Auftragsverarbeitungsvertrag bei sensiblen Mandaten und personenbezogenen Inhalten", ok: true },
            { text: "KI-Protokoll als Entwurf behandeln – verbindliche Freigabe bei Entscheidungen bleibt beim Menschen", ok: true },
            { text: "AI-Literacy sicherstellen: seit 2. Februar 2025 müssen KI-Nutzende laut EU AI Act geschult sein", ok: true },
            { text: "Gespräche ohne Zustimmung mitschneiden oder die Einwilligung erst nachträglich nachholen", ok: false },
            { text: "Meeting-Tools breit ausrollen, ohne Datenort und Schulung mitzudenken", ok: false },
          ],
        },
      },
    ],
  },
};
