# Fördermatrix Startup- & Neuunternehmerförderung Luzern

Interaktive Fördermatrix für den internen Gebrauch der Wirtschaftsförderung Luzern (WFL) – Grundlage für Beratungsgespräche.
Basis: `Startupfoerderung_Luzern_Matrix_v2.1.xlsx` (Blätter «Matrix v2», «Review v1», «Lücken»), ergänzt um CSEM und Deep Tech Nation (Recherche 11/2026).

## Funktionen

- **Gründertypen:** Alle anzeigen · Existenzgründung · Skalierbares Startup · Tech & DeepTech · Hochschul-Spin-off · KMU Wachstum & Nachfolge – inkl. «Welcher Typ passt?»-Assistent
- **Filter:** Ebene (LU / ZCH / CH, Schnellwahl «nur LU»), Relevanz (Alle / K+W / nur K), Zielgruppen (Gründerinnen → BG-SAFFA, CleanTech → Technologiefonds, Gründung aus Arbeitslosigkeit → RAV), «Nur Fokus-Akteure»
- **8 Phasen P0–P6** als Karten- oder Tabellenansicht; Abdeckung (K/W/LU) im Phasenkopf, automatische Markierung «Dünne Abdeckung» (0 K) bzw. «Angebotslücke» (leer)
- **Ökosystem-Lücken** (13, priorisiert) per Toggle in den betroffenen Phasen
- **Detailansicht** je Akteur mit allen Phasen, Bemerkungen, Relevanz je Gründertyp
- Ansicht steckt in der URL (z. B. `#typ=tech&luecken=1`) → Links lassen sich teilen

## Inhalte pflegen

Alle Inhalte stehen in **`src/data/matrixData.json`** – kein Code nötig:

| Bereich | Was | Beispiel |
|---|---|---|
| `actors[]` | Akteure mit `ebene`, `segment`, `remark`, `remarkType` und `cells.P0…P6` (`rating`: K/W/R/?/–, `text`) | Angebotstext ändern |
| `types[]` | Gründertypen: `focus` (hervorgehoben), `conditional` (bedingt, °), `excludedCells` (einzelne Zellen ausblenden), `dimmedPhases` | Akteur zu T2 hinzufügen |
| `filters[]` | Zielgruppen-Zusatzfilter → blenden `actor` in jedem Typ ein | |
| `gaps[]` | Lücken mit `phases`, `types` (wo sichtbar), `filters` | Priorität anpassen |

Nach einer Änderung: `npm run build` prüft die Daten; Push auf `main` veröffentlicht automatisch.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) ≥ 20.

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

## Auf GitHub veröffentlichen (Schritt für Schritt)

1. Auf github.com ein **neues, leeres Repository** anlegen (z. B. `wfl-foerdermatrix`, ohne README/.gitignore). Für interne Inhalte: **Private**.
2. Im Projektordner (Git ist bereits initialisiert, Branch `main`, erster Commit vorhanden):

   ```bash
   git remote add origin https://github.com/<DEIN-ACCOUNT>/wfl-foerdermatrix.git
   git push -u origin main
   ```

### Variante A – GitHub Pages (automatisch per GitHub Action)

3. Im Repository: **Settings → Pages → Build and deployment → Source: «GitHub Actions»** wählen.
4. Unter **Actions** läuft «Deploy to GitHub Pages» (bei jedem Push auf `main`). Nach ca. 1 Minute ist die App unter `https://<DEIN-ACCOUNT>.github.io/wfl-foerdermatrix/` erreichbar.

> ⚠️ GitHub Pages ist **öffentlich** erreichbar (auch bei privatem Repo, ausser mit GitHub Enterprise). Die Seite ist zwar mit `noindex` markiert, die URL ist aber für alle aufrufbar, die sie kennen. Für rein interne Inhalte Variante B mit Passwortschutz oder ein internes Hosting prüfen.

### Variante B – Vercel

3. Auf vercel.com mit GitHub anmelden → **Add New → Project** → Repository importieren.
4. Vercel erkennt Vite automatisch (Build: `npm run build`, Output: `dist`) → **Deploy**.
5. Optional: **Settings → Deployment Protection** aktivieren, damit nur berechtigte Personen Zugriff haben.

Die App nutzt relative Pfade (`base: './'` in `vite.config.ts`) und funktioniert daher ohne Anpassung auf beiden Plattformen.

## Technik

React 19 · TypeScript · Vite · Tailwind CSS 4 – rein statische Single-Page-App ohne Backend.

```
src/
  data/matrixData.json   ← alle Inhalte
  logic.ts               ← Filter-, Sortier- und Abdeckungslogik
  App.tsx                ← Layout, URL-Zustand
  components/            ← Typ-/Filterleiste, Phasen-Karten, Tabelle, Detailansicht, Typ-Finder
```
